from flask import Blueprint, request, jsonify

from services.news_service import get_news
from services.claude_service import extract_vocabulary

news_bp = Blueprint('news', __name__, url_prefix='/api/news')

VALID_CATEGORIES = {'technology', 'science', 'environment', 'sports', 'general'}


@news_bp.route('/', methods=['GET'])
def get_news_route():
    """GET /api/news?category=technology

    Devuelve lista de artículos. Usa datos mock si NEWS_API_KEY no está configurada.
    Respuesta: { articles: [...], is_mock: bool }
    """
    category = request.args.get('category', 'technology').lower()
    if category not in VALID_CATEGORIES:
        category = 'technology'

    try:
        articles = get_news(category)
        is_mock  = articles[0].get('is_mock', False) if articles else False
        return jsonify({'articles': articles, 'is_mock': is_mock})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@news_bp.route('/analyze', methods=['POST'])
def analyze_article():
    """POST /api/news/analyze
    Body: { "text": "article title + description combined" }
    Devuelve: [{ term, definition, example, level }] × 5
    """
    data = request.get_json()
    if not data or not data.get('text'):
        return jsonify({'error': 'El campo "text" es obligatorio'}), 400

    try:
        words = extract_vocabulary(data['text'])
        return jsonify(words)
    except ValueError as e:
        # Error de Claude o clave no configurada
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        return jsonify({'error': f'Error al llamar a Claude: {str(e)}'}), 500
