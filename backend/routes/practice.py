from flask import Blueprint

practice_bp = Blueprint('practice', __name__, url_prefix='/api/practice')


@practice_bp.route('/', methods=['GET'])
def get_practice():
    # TODO: integrar Claude API para chat de práctica
    return {'message': 'practice endpoint — próximamente'}, 200
