from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensiones
    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Blueprints — una ruta por sección
    from routes.news import news_bp
    from routes.vocabulary import vocabulary_bp
    from routes.grammar import grammar_bp
    from routes.music import music_bp
    from routes.practice import practice_bp
    from routes.progress import progress_bp

    app.register_blueprint(news_bp)
    app.register_blueprint(vocabulary_bp)
    app.register_blueprint(grammar_bp)
    app.register_blueprint(music_bp)
    app.register_blueprint(practice_bp)
    app.register_blueprint(progress_bp)

    # Crear tablas en primera ejecución
    with app.app_context():
        db.create_all()

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'EnglishApp backend running'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
