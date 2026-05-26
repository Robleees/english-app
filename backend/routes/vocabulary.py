from flask import Blueprint, request, jsonify
from datetime import datetime

from app import db
from models.vocabulary import Word

vocabulary_bp = Blueprint('vocabulary', __name__, url_prefix='/api/vocabulary')


@vocabulary_bp.route('/', methods=['GET'])
def get_vocabulary():
    """Lista todas las palabras. Filtros opcionales: ?category=X&level=Y"""
    category = request.args.get('category')
    level    = request.args.get('level')

    query = Word.query
    if category:
        query = query.filter_by(category=category)
    if level:
        query = query.filter_by(level=level)

    words = query.order_by(Word.created_at.desc()).all()
    return jsonify([w.to_dict() for w in words])


@vocabulary_bp.route('/due', methods=['GET'])
def get_due_words():
    """Palabras cuya next_review_at ya llegó: las que toca repasar hoy.
    Se registra esta ruta ANTES de /<int:word_id> para que Flask no intente
    convertir 'due' a entero."""
    now   = datetime.utcnow()
    words = (Word.query
             .filter(Word.next_review_at <= now)
             .order_by(Word.next_review_at)
             .all())
    return jsonify([w.to_dict() for w in words])


@vocabulary_bp.route('/', methods=['POST'])
def create_word():
    data = request.get_json()
    if not data or not data.get('term') or not data.get('definition'):
        return jsonify({'error': 'term y definition son obligatorios'}), 400

    word = Word(
        term       = data['term'].strip(),
        definition = data['definition'].strip(),
        example    = data.get('example', '').strip(),
        category   = data.get('category', 'General'),
        level      = data.get('level', 'B1'),
        origin     = data.get('origin', 'manual'),
    )
    db.session.add(word)
    db.session.commit()
    return jsonify(word.to_dict()), 201


@vocabulary_bp.route('/<int:word_id>', methods=['PUT'])
def update_word(word_id):
    # db.get_or_404 lanza 404 automáticamente si no existe (Flask-SQLAlchemy 3+)
    word = db.get_or_404(Word, word_id)
    data = request.get_json()

    for field in ('term', 'definition', 'example', 'category', 'level', 'origin'):
        if field in data:
            setattr(word, field, data[field])

    db.session.commit()
    return jsonify(word.to_dict())


@vocabulary_bp.route('/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    word = db.get_or_404(Word, word_id)
    db.session.delete(word)
    db.session.commit()
    return jsonify({'message': 'eliminado'}), 200


@vocabulary_bp.route('/<int:word_id>/review', methods=['POST'])
def review_word(word_id):
    """Actualiza next_review_at y ease_factor según el algoritmo de spaced repetition.
    Body: { "difficulty": "easy" | "hard" }
    """
    word = db.get_or_404(Word, word_id)
    data = request.get_json()
    difficulty = data.get('difficulty')

    if difficulty not in ('easy', 'hard'):
        return jsonify({'error': 'difficulty debe ser "easy" o "hard"'}), 400

    # La lógica del algoritmo vive en el modelo, no en la ruta
    word.review(difficulty)
    db.session.commit()
    return jsonify(word.to_dict())
