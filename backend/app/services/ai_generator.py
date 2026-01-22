import json
import time
from typing import Dict, Any
import httpx
from openai import OpenAI
from ..config import settings
from ..utils.prompts import HOMEWORK_PROMPT


def get_openai_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OpenAI API key is not configured")

    if settings.OPENAI_PROXY:
        http_client = httpx.Client(
            proxies=settings.OPENAI_PROXY,
            timeout=60.0,
        )
        return OpenAI(api_key=settings.OPENAI_API_KEY, http_client=http_client)

    return OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_homework(
    subject: str,
    topic: str,
    level: str,
    tasks_count: int
) -> Dict[str, Any]:
    """
    Generate homework tasks using OpenAI API

    Args:
        subject: Subject name (e.g., "математика", "физика")
        topic: Topic name (e.g., "квадратные уравнения")
        level: Difficulty level (oge, ege_base, ege_profile, olympiad)
        tasks_count: Number of tasks to generate (3-10)

    Returns:
        Dict with generated tasks

    Raises:
        ValueError: If OpenAI API key is not set or generation fails
    """
    client = get_openai_client()

    # Prepare prompt
    level_translations = {
        "oge": "ОГЭ",
        "ege_base": "ЕГЭ базовый уровень",
        "ege_profile": "ЕГЭ профильный уровень",
        "olympiad": "Олимпиада"
    }
    level_text = level_translations.get(level, level)

    prompt = HOMEWORK_PROMPT.format(
        subject=subject,
        topic=topic,
        level=level_text,
        tasks_count=tasks_count
    )

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Ты опытный репетитор, который создаёт уникальные задачи для учеников. Всегда отвечай только валидным JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.8,
            response_format={"type": "json_object"}
        )

        # Parse response
        content = response.choices[0].message.content
        result = json.loads(content)

        return result

    except Exception as e:
        raise ValueError(f"Failed to generate homework: {str(e)}")


def test_connection() -> Dict[str, Any]:
    """
    Test OpenAI connection and return model + latency in ms.
    """
    client = get_openai_client()
    start = time.time()
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a ping test. Reply with OK."},
                {"role": "user", "content": "ping"}
            ],
            temperature=0,
        )
        latency_ms = int((time.time() - start) * 1000)
        return {
            "model": response.model,
            "latency_ms": latency_ms,
            "proxy_enabled": bool(settings.OPENAI_PROXY),
        }
    except Exception as e:
        raise ValueError(f"Failed to test OpenAI connection: {str(e)}")
