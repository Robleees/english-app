from flask import Blueprint

vocabulary_bp = Blueprint('vocabulary', __name__, url_prefix='/api/vocabulary')


@vocabulary_bp.route('/', methods=['GET'])
def get_vocabulary():
    # TODO: implementar CRUD de vocabulario
    return {'message': 'vocabulary endpoint — próximamente'}, 200
