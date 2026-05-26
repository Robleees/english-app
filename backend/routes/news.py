from flask import Blueprint

news_bp = Blueprint('news', __name__, url_prefix='/api/news')


@news_bp.route('/', methods=['GET'])
def get_news():
    # TODO: integrar NewsAPI
    return {'message': 'news endpoint — próximamente'}, 200
