from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Sin esto, Flask haría 308 redirect de /api/vocabulary a /api/vocabulary/
    # lo que rompe CORS en algunos browsers
    app.url_map.strict_slashes = False

    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

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

    with app.app_context():
        # Los modelos deben importarse ANTES de create_all() para que
        # SQLAlchemy registre sus tablas en el metadata
        from models.vocabulary import Word          # noqa: F401
        from models.progress import DailyActivity  # noqa: F401
        db.create_all()

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'EnglishApp backend running'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
