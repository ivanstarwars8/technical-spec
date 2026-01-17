import json
from typing import Dict, Any
from openai import OpenAI
from ..config import settings
from ..utils.prompts import HOMEWORK_PROMPT


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
    if not settings.OPENAI_API_KEY:
        raise ValueError("OpenAI API key is not configured")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

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
