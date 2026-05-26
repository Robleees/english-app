import os
import json
import anthropic

MODEL = 'claude-sonnet-4-20250514'

# Inicialización lazy: el cliente se crea la primera vez que se necesita,
# no al importar el módulo. Así el servidor arranca aunque no haya API key.
_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError('ANTHROPIC_API_KEY no está configurada en el entorno')
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


_VOCAB_SYSTEM = """You are an English tutor helping a B2-level Spanish speaker prepare for an \
international environmental volunteering program in Germany.

When given an article text, extract exactly 5 key words or phrases that are:
- Useful for the B2 level or higher
- Relevant to environmental conservation, nature, teamwork, or daily life abroad

For each word or phrase provide:
- term: the word or short phrase
- definition: a simple, clear definition in English (max 20 words)
- example: a natural sentence showing the word in context (max 20 words)
- level: the CEFR level — one of: A2, B1, B2, C1

Respond ONLY with a valid JSON array. No preamble, no explanation, no markdown fences.
Example format:
[{"term": "biodiversity", "definition": "the variety of plant and animal life in a habitat", "example": "The lake supports remarkable biodiversity.", "level": "B2"}]"""


def extract_vocabulary(text: str) -> list:
    """Extrae 5 palabras clave de un texto de artículo usando Claude.

    Devuelve una lista de dicts: [{ term, definition, example, level }]
    Lanza ValueError si Claude no responde con JSON válido.
    """
    client = _get_client()

    # Truncar a 3000 chars para controlar el costo de tokens
    truncated = text[:3000]

    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=_VOCAB_SYSTEM,
        messages=[
            {'role': 'user', 'content': f'Article:\n\n{truncated}'}
        ],
    )

    raw = message.content[0].text.strip()

    # Extraer el array JSON aunque Claude añada texto antes o después
    # Buscamos desde el primer '[' hasta el último ']'
    start = raw.find('[')
    end   = raw.rfind(']')
    if start == -1 or end == -1:
        raise ValueError(f'Claude no devolvió un array JSON válido. Respuesta: {raw[:200]}')

    words = json.loads(raw[start:end + 1])

    # Validación básica de la estructura esperada
    required = {'term', 'definition', 'example', 'level'}
    for w in words:
        if not required.issubset(w.keys()):
            raise ValueError(f'Palabra con campos faltantes: {w}')

    return words


def chat_with_tutor(messages: list, mode: str = 'free') -> str:
    """Envía historial de chat al tutor de inglés y devuelve la respuesta.
    Se implementará en la sesión de Práctica."""
    raise NotImplementedError
