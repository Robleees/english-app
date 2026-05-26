from flask import Blueprint

progress_bp = Blueprint('progress', __name__, url_prefix='/api/progress')


@progress_bp.route('/', methods=['GET'])
def get_progress():
    # TODO: implementar estadísticas y racha
    return {'message': 'progress endpoint — próximamente'}, 200
