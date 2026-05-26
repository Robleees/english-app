import os
import requests

NEWS_API_KEY = os.getenv('NEWS_API_KEY')
BASE_URL = 'https://newsapi.org/v2'


def get_top_headlines(category: str = 'technology', page_size: int = 10) -> list:
    """Obtiene titulares de NewsAPI. Cachear 1 hora para no gastar cuota."""
    # TODO: implementar con caché en la sesión de Noticias
    raise NotImplementedError
