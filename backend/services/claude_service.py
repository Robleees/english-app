import os
import anthropic

# El cliente se inicializa con la key del entorno
_client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

MODEL = 'claude-sonnet-4-20250514'


def analyze_vocabulary(text: str) -> dict:
    """Extrae 5 palabras clave de un texto con definición, ejemplo y nivel."""
    # TODO: implementar en la sesión de Noticias
    raise NotImplementedError


def chat_with_tutor(messages: list, mode: str = 'free') -> str:
    """Envía historial de chat al tutor de inglés y devuelve la respuesta."""
    # TODO: implementar en la sesión de Chat
    raise NotImplementedError
