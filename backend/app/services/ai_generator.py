import json
import time
import logging
import re
from typing import Dict, Any, List, Optional
import httpx
from openai import OpenAI, OpenAIError
from ..config import settings
from ..utils.prompts import HOMEWORK_PROMPT
from ..utils.homework_validator import validate_homework_tasks

logger = logging.getLogger(__name__)


def validate_homework_structure(data: Dict[str, Any], expected_tasks: int) -> bool:
    """
    Validate that the homework JSON has the expected structure.

    Expected structure:
    {
        "tasks": [
            {"number": 1, "text": "...", "solution": "...", "answer": "..."},
            ...
        ]
    }
    """
    if not isinstance(data, dict):
        return False

    if "tasks" not in data:
        return False

    tasks = data["tasks"]
    if not isinstance(tasks, list):
        return False

    if len(tasks) != expected_tasks:
        logger.warning(f"Expected {expected_tasks} tasks, got {len(tasks)}")

    for task in tasks:
        if not isinstance(task, dict):
            return False
        required_fields = ["number", "text", "solution", "answer"]
        if not all(field in task for field in required_fields):
            return False

    return True


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


def get_anthropic_client():
    """Get Anthropic client. Returns httpx client since we'll use direct API."""
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("Anthropic API key is not configured")

    return httpx.Client(
        base_url="https://api.anthropic.com",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        timeout=120.0
    )


def call_claude(prompt: str, system_prompt: str) -> str:
    """
    Call Claude API directly via HTTP.

    Args:
        prompt: User prompt
        system_prompt: System prompt

    Returns:
        Response text from Claude
    """
    client = get_anthropic_client()

    try:
        response = client.post(
            "/v1/messages",
            json={
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4096,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
        )
        response.raise_for_status()

        data = response.json()
        return data["content"][0]["text"]

    except httpx.HTTPStatusError as e:
        logger.error(f"Claude API HTTP error: {e.response.status_code}: {e.response.text}")
        raise ValueError(f"Claude API request failed: {e.response.status_code}")
    except Exception as e:
        logger.error(f"Claude API error: {type(e).__name__}: {str(e)}")
        raise ValueError("Claude API request failed")


def generate_homework(
    subject: str,
    topic: str,
    level: str,
    tasks_count: int,
    model: Optional[str] = None,
    validate_quality: bool = True
) -> Dict[str, Any]:
    """
    Generate homework tasks using AI (OpenAI or Anthropic)

    Args:
        subject: Subject name (e.g., "математика", "физика")
        topic: Topic name (e.g., "квадратные уравнения")
        level: Difficulty level (oge, ege_base, ege_profile, olympiad)
        tasks_count: Number of tasks to generate (3-10)
        model: AI model to use ("gpt-4o-mini", "claude-3-5-sonnet-20241022", or None for default)
        validate_quality: Whether to validate generated tasks quality

    Returns:
        Dict with generated tasks and validation info

    Raises:
        ValueError: If API key is not set or generation fails
    """
    # Determine which model to use
    if model is None:
        model = settings.DEFAULT_AI_MODEL

    # Determine provider
    use_claude = "claude" in model.lower()
    use_gpt = "gpt" in model.lower()

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

    system_prompt = "Ты опытный репетитор, который создаёт уникальные задачи для учеников. Всегда отвечай только валидным JSON."

    try:
        # Generate tasks using selected model
        if use_claude:
            # Claude API call
            content = call_claude(prompt, system_prompt)
            # Extract JSON from response (Claude might wrap it)
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                content = json_match.group()
            result = json.loads(content)

        elif use_gpt:
            # OpenAI API call
            client = get_openai_client()
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            result = json.loads(content)

        else:
            raise ValueError(f"Unknown model: {model}")

        # Validate basic structure
        if not validate_homework_structure(result, tasks_count):
            logger.error(f"Invalid homework structure from {model}: {result}")
            raise ValueError("AI returned invalid homework structure")

        # Quality validation
        validation_info = {
            "model_used": model,
            "total_generated": len(result.get("tasks", [])),
            "validation_enabled": validate_quality
        }

        if validate_quality:
            tasks = result.get("tasks", [])
            valid_tasks, invalid_tasks = validate_homework_tasks(tasks, subject, level)

            validation_info.update({
                "valid_count": len(valid_tasks),
                "invalid_count": len(invalid_tasks),
                "quality_score": len(valid_tasks) / len(tasks) if tasks else 0,
                "errors": [item["errors"] for item in invalid_tasks] if invalid_tasks else []
            })

            # Log quality issues
            if invalid_tasks:
                logger.warning(
                    f"Quality validation: {len(invalid_tasks)}/{len(tasks)} tasks failed. "
                    f"Model: {model}, Subject: {subject}"
                )

            # Return only valid tasks
            result["tasks"] = valid_tasks

        result["_validation"] = validation_info

        return result

    except OpenAIError as e:
        logger.error(f"OpenAI API error: {type(e).__name__}: {str(e)}")
        raise ValueError("AI service temporarily unavailable. Please try again later.")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {str(e)}")
        raise ValueError("AI returned invalid response format")
    except ValueError:
        # Re-raise our own ValueError messages
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_homework: {type(e).__name__}: {str(e)}")
        raise ValueError("Failed to generate homework. Please try again.")


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
    except OpenAIError as e:
        logger.error(f"OpenAI connection test failed: {type(e).__name__}: {str(e)}")
        raise ValueError("AI service connection failed")
    except Exception as e:
        logger.error(f"Unexpected error in test_connection: {type(e).__name__}: {str(e)}")
        raise ValueError("Failed to test AI connection")
