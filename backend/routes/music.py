from flask import Blueprint

music_bp = Blueprint('music', __name__, url_prefix='/api/music')


@music_bp.route('/', methods=['GET'])
def get_music():
    # TODO: integrar Lyrics.ovh
    return {'message': 'music endpoint — próximamente'}, 200
