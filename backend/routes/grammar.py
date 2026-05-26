from flask import Blueprint

grammar_bp = Blueprint('grammar', __name__, url_prefix='/api/grammar')


@grammar_bp.route('/', methods=['GET'])
def get_grammar():
    # TODO: implementar temas de gramática y quiz
    return {'message': 'grammar endpoint — próximamente'}, 200
