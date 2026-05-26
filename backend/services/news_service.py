import os
import requests
from datetime import datetime

NEWS_API_KEY = os.getenv('NEWS_API_KEY')
BASE_URL = 'https://newsapi.org/v2'

# Cache simple en memoria: { category: { 'data': [...], 'fetched_at': datetime } }
# Se reinicia cada vez que se reinicia el servidor (suficiente para dev)
_cache: dict = {}
CACHE_TTL_SECONDS = 3600  # 1 hora

# NewsAPI no tiene categoría "environment", la mapeamos a "general"
_CATEGORY_MAP = {
    'environment': 'general',
    'technology':  'technology',
    'science':     'science',
    'sports':      'sports',
    'general':     'general',
}


def get_news(category: str = 'technology', page_size: int = 10) -> list:
    """Devuelve artículos para la categoría dada.

    Si NEWS_API_KEY no está configurada → datos mock (sin gastar cuota).
    Si está configurada → NewsAPI con caché de 1 hora.
    """
    if not NEWS_API_KEY:
        return _get_mock_articles(category)
    return _fetch_with_cache(category, page_size)


# ── Caché y fetch real ────────────────────────────────────────────────────────

def _fetch_with_cache(category: str, page_size: int) -> list:
    now   = datetime.utcnow()
    entry = _cache.get(category)

    if entry:
        age_seconds = (now - entry['fetched_at']).total_seconds()
        if age_seconds < CACHE_TTL_SECONDS:
            return entry['data']  # respuesta cacheada todavía válida

    articles = _fetch_from_api(category, page_size)
    _cache[category] = {'data': articles, 'fetched_at': now}
    return articles


def _fetch_from_api(category: str, page_size: int) -> list:
    api_category = _CATEGORY_MAP.get(category, 'general')
    params = {
        'apiKey':   NEWS_API_KEY,
        'category': api_category,
        'language': 'en',
        'pageSize': page_size,
    }
    resp = requests.get(f'{BASE_URL}/top-headlines', params=params, timeout=10)
    resp.raise_for_status()
    return [_normalize(a) for a in resp.json().get('articles', [])]


def _normalize(article: dict) -> dict:
    """Convierte el formato de NewsAPI al formato interno de la app."""
    return {
        'title':        article.get('title', ''),
        'description':  article.get('description', '') or '',
        'url':          article.get('url', '#'),
        'image':        article.get('urlToImage'),
        'published_at': article.get('publishedAt', ''),
        'source':       article.get('source', {}).get('name', 'Unknown'),
        'is_mock':      False,
    }


# ── Datos mock para desarrollo sin API key ────────────────────────────────────

_MOCK: dict = {
    'technology': [
        {
            'title':       'AI Monitors Lake Ecosystems in Real Time',
            'description': 'Machine learning algorithms are now deployed to monitor water quality, temperature, and biodiversity in freshwater ecosystems, giving conservationists unprecedented insight into environmental changes and allowing faster response to pollution events.',
            'url': '#', 'image': None, 'published_at': '2026-05-26T08:00:00Z', 'source': 'Tech Review',
        },
        {
            'title':       'Solar-Powered Sensors Track Wildlife Migration',
            'description': 'A new network of solar-powered sensors is helping researchers track the migration patterns of birds and fish across Central Europe, providing critical data for conservation planning and offering volunteers real-time updates on biodiversity recovery efforts.',
            'url': '#', 'image': None, 'published_at': '2026-05-25T14:00:00Z', 'source': 'Nature Tech',
        },
        {
            'title':       'Electric Boats Reduce Pollution on European Lakes',
            'description': 'Zero-emission electric boats are replacing traditional diesel vessels on several protected European lakes, dramatically reducing water and noise pollution while maintaining sustainable tourism, fishing activities, and recreational use of these fragile ecosystems.',
            'url': '#', 'image': None, 'published_at': '2026-05-24T10:00:00Z', 'source': 'Green Transport',
        },
        {
            'title':       'Blockchain Ensures Transparency in Carbon Credits',
            'description': 'Environmental organizations are using blockchain technology to create transparent, immutable records of carbon offset projects, helping volunteers and donors track the tangible impact of their conservation contributions with unprecedented accuracy.',
            'url': '#', 'image': None, 'published_at': '2026-05-23T09:00:00Z', 'source': 'Climate Tech',
        },
    ],
    'environment': [
        {
            'title':       'Lake Constance Biodiversity Reaches 20-Year High',
            'description': 'Recent ecological surveys of Lake Constance show a significant recovery in biodiversity, with fish populations increasing by 30% and rare aquatic plant species returning to the shoreline following decades of dedicated conservation work by local and international volunteers.',
            'url': '#', 'image': None, 'published_at': '2026-05-26T07:00:00Z', 'source': 'Environmental Monitor',
        },
        {
            'title':       'International Volunteers Transform Wetland Restoration Project',
            'description': 'Over 200 volunteers from 15 countries gathered near the Rhine delta to restore native plant species and remove invasive vegetation, demonstrating the remarkable power of international cooperation in environmental conservation and building lasting cross-cultural friendships.',
            'url': '#', 'image': None, 'published_at': '2026-05-25T11:00:00Z', 'source': 'Conservation Weekly',
        },
        {
            'title':       'Alpine Region Faces Unprecedented Climate Warming',
            'description': 'New climate research shows the Alpine region is warming at twice the global average rate, threatening glaciers, mountain ecosystems, and water supplies for millions of people downstream. Conservation programs are urgently expanding to mitigate the impact on fragile habitats.',
            'url': '#', 'image': None, 'published_at': '2026-05-24T08:30:00Z', 'source': 'Climate Science',
        },
        {
            'title':       'Migratory Birds Return to Restored Wetlands',
            'description': 'After years of dedicated habitat restoration along the Rhine-Danube corridor, ecologists have recorded the return of several endangered migratory bird species, marking a significant milestone for European conservation efforts and validating the work of thousands of environmental volunteers.',
            'url': '#', 'image': None, 'published_at': '2026-05-23T15:00:00Z', 'source': 'Birding Europe',
        },
        {
            'title':       'Community Conservation Outperforms Government Programs',
            'description': 'Long-term studies across Germany and Austria show that grassroots environmental movements driven by community volunteers consistently achieve better conservation outcomes than top-down government initiatives, with higher species recovery rates and more sustainable land management practices.',
            'url': '#', 'image': None, 'published_at': '2026-05-22T10:00:00Z', 'source': 'Ecology Today',
        },
    ],
    'science': [
        {
            'title':       'Freshwater Ecosystems More Fragile Than Previously Estimated',
            'description': 'A major international study has found that freshwater ecosystems including rivers and lakes are significantly more vulnerable to climate change and pollution than scientists previously believed, with warming causing rapid, often irreversible shifts in biological communities and food chains.',
            'url': '#', 'image': None, 'published_at': '2026-05-26T06:00:00Z', 'source': 'Science Daily',
        },
        {
            'title':       'New Method Removes 98% of Microplastics from Water',
            'description': 'Scientists have developed an innovative filtration system capable of removing up to 98% of microplastics from freshwater sources, offering new hope for restoring contaminated rivers and lakes that serve as critical habitats for fish, amphibians, and aquatic plants.',
            'url': '#', 'image': None, 'published_at': '2026-05-25T13:00:00Z', 'source': 'Research Gate',
        },
        {
            'title':       'Peatlands Store Twice as Much Carbon as Forests',
            'description': 'Research published this month shows that peatlands store nearly twice as much carbon as all the world\'s forests combined, making their preservation and active restoration absolutely critical for meeting international climate commitments and preventing catastrophic emissions.',
            'url': '#', 'image': None, 'published_at': '2026-05-24T11:00:00Z', 'source': 'Nature Journal',
        },
        {
            'title':       'Volunteer Work Significantly Improves Mental Health',
            'description': 'A comprehensive study across five European countries confirms that participation in environmental volunteer programs significantly improves mental health outcomes, reducing anxiety and depression while building meaningful social connections and a profound sense of purpose and achievement.',
            'url': '#', 'image': None, 'published_at': '2026-05-23T08:00:00Z', 'source': 'Psychology Today',
        },
    ],
    'sports': [
        {
            'title':       'Open Water Swimming Surges in Popularity Across Europe',
            'description': 'Swimming in natural lakes and rivers is experiencing unprecedented growth across Europe, with participation in organized open water events increasing by 45% since 2023, driven by a collective desire for nature connection, wellness, and authentic outdoor experiences.',
            'url': '#', 'image': None, 'published_at': '2026-05-26T09:00:00Z', 'source': 'Sports Europe',
        },
        {
            'title':       'Trail Runners Collect Waste Along Alpine Routes',
            'description': 'Major trail running events across the Alps are partnering with conservation organizations to raise awareness and funding for mountain habitat protection, with participants voluntarily collecting waste and planting native trees along race routes to offset their environmental footprint.',
            'url': '#', 'image': None, 'published_at': '2026-05-25T07:00:00Z', 'source': 'Trail Magazine',
        },
        {
            'title':       'Rhine Cycling Path Attracts Eco-Conscious Tourists',
            'description': 'A newly completed 1,200-kilometer cycling path following the Rhine from the Swiss Alps to the North Sea is attracting environmentally conscious tourists, boosting local economies while promoting sustainable travel and raising awareness about the river\'s fragile ecosystems.',
            'url': '#', 'image': None, 'published_at': '2026-05-24T14:00:00Z', 'source': 'Cycling Weekly',
        },
        {
            'title':       'Water Sports Community Organizes Lake Constance Cleanup',
            'description': 'Windsurfers, kayakers, and open water swimmers from the Lake Constance region have organized a series of underwater and shoreline cleanup events, removing over two tons of waste from the lake in the past year and dramatically improving water quality for recreational use.',
            'url': '#', 'image': None, 'published_at': '2026-05-23T10:00:00Z', 'source': 'Outdoor Life',
        },
    ],
    'general': [
        {
            'title':       'Record Applications for European Youth Exchange Programs',
            'description': 'Cultural exchange programs connecting young Europeans from different countries are receiving record numbers of applications, with participants citing international experience, language immersion, and the desire to contribute meaningfully to environmental conservation as their primary motivations.',
            'url': '#', 'image': None, 'published_at': '2026-05-26T10:00:00Z', 'source': 'EU Youth Report',
        },
        {
            'title':       "Glocal Volunteering: Thinking Globally, Acting Locally",
            'description': "International volunteer organizations are adopting a 'glocal' approach, connecting local environmental conservation projects with participants from around the world to create lasting, measurable change while fostering genuine cross-cultural understanding and lifelong friendships.",
            'url': '#', 'image': None, 'published_at': '2026-05-25T12:00:00Z', 'source': 'Global Citizen',
        },
        {
            'title':       'Immersive Volunteering Accelerates Language Acquisition',
            'description': 'Linguistic research confirms that immersive experiences in foreign countries accelerate language acquisition dramatically, with participants in international volunteer programs showing faster vocabulary growth and more confident spoken language skills than traditional classroom learners.',
            'url': '#', 'image': None, 'published_at': '2026-05-24T09:00:00Z', 'source': 'Language Learning',
        },
        {
            'title':       'Germany Expands International Environmental Volunteer Programs',
            'description': 'The German Federal Environment Agency has announced significantly expanded support for international volunteer conservation programs, offering subsidized accommodation, professional training, and mentorship to participants who commit to at least two weeks of hands-on environmental work.',
            'url': '#', 'image': None, 'published_at': '2026-05-23T11:00:00Z', 'source': 'Deutsche Welle',
        },
    ],
}

# Añade is_mock=True a todos los artículos mock
for _cat in _MOCK.values():
    for _a in _cat:
        _a['is_mock'] = True


def _get_mock_articles(category: str) -> list:
    return _MOCK.get(category, _MOCK['general'])
