import json
import time
import logging
from typing import Dict, Any, List, Optional
import httpx
from openai import OpenAI, OpenAIError
from ..config import settings
from ..utils.prompts import HOMEWORK_PROMPT, PROBLEM_SECTION_TEMPLATE
from ..utils.homework_validator import validate_homework_tasks

logger = logging.getLogger(__name__)

OPENAI_DEFAULT_MODEL = settings.GPT_NANO_MODEL
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"


def validate_homework_structure(data: Dict[str, Any], expected_tasks: int) -> bool:
    """
    Validate that the homework JSON has the expected structure.

    Supports both old format (tasks array) and new worksheet format (blocks array).
    """
    if not isinstance(data, dict):
        return False

    # New worksheet format with blocks
    if "blocks" in data:
        blocks = data["blocks"]
        if not isinstance(blocks, list) or len(blocks) == 0:
            return False

        total_tasks = 0
        for block in blocks:
            if not isinstance(block, dict):
                return False
            if "tasks" not in block or not isinstance(block["tasks"], list):
                return False
            for task in block["tasks"]:
                if not isinstance(task, dict):
                    return False
                required_fields = ["number", "text", "answer"]
                if not all(field in task for field in required_fields):
                    return False
                total_tasks += 1

        if total_tasks < 10:
            logger.warning(f"Expected at least 15 tasks in worksheet, got {total_tasks}")

        # Flatten tasks for compatibility with validation
        all_tasks = []
        for block in blocks:
            all_tasks.extend(block["tasks"])
        data["tasks"] = all_tasks

        return True

    # Old format with tasks array
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
            timeout=300.0,
        )
        return OpenAI(api_key=settings.OPENAI_API_KEY, http_client=http_client)

    return OpenAI(api_key=settings.OPENAI_API_KEY)

def get_http_client() -> httpx.Client:
    if settings.OPENAI_PROXY:
        return httpx.Client(proxies=settings.OPENAI_PROXY, timeout=300.0)
    return httpx.Client(timeout=300.0)


def _generate_homework_openai(
    subject: str,
    topic: str,
    level: str,
    tasks_count: int,
    model: str,
) -> Dict[str, Any]:
    client = get_openai_client()

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "Ты опытный репетитор, который создаёт уникальные задачи для учеников. Всегда отвечай только валидным JSON.",
            },
            {"role": "user", "content": topic},
        ],
        temperature=1,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    result = json.loads(content)
    return result


def _generate_homework_claude(
    subject: str,
    topic: str,
    level: str,
    tasks_count: int,
    model: str,
) -> Dict[str, Any]:
    api_key = settings.CLAUDE_API_KEY_EFFECTIVE
    if not api_key:
        raise ValueError("Claude API key is not configured")

    # model passed as argument
    prompt = (
        "Ты опытный репетитор, который создаёт уникальные задачи для учеников.\n"
        "ВАЖНО: отвечай ТОЛЬКО валидным JSON без пояснений.\n\n"
        f"Предмет: {subject}\n"
        f"Тема: {topic}\n"
        f"Уровень: {level}\n"
        f"Количество задач: {tasks_count}\n\n"
        "Формат ответа:\n"
        "{\n"
        '  "tasks": [\n'
        '    {"number": 1, "text": "...", "solution": "...", "answer": "..."},\n'
        "    ...\n"
        "  ]\n"
        "}\n"
    )

    http_client = get_http_client()
    try:
        resp = http_client.post(
            CLAUDE_API_URL,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": 8192,
                "temperature": 0.8,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
    finally:
        http_client.close()

    if resp.status_code >= 400:
        logger.error(f"Claude API error: {resp.status_code}: {resp.text}")
        raise ValueError("AI service temporarily unavailable. Please try again later.")

    payload = resp.json()
    blocks = payload.get("content") or []
    text_parts: List[str] = []
    for b in blocks:
        if isinstance(b, dict) and b.get("type") == "text" and isinstance(b.get("text"), str):
            text_parts.append(b["text"])
    text = "\n".join(text_parts).strip()
    if not text:
        raise ValueError("AI returned empty response")

    # Some models may wrap JSON in markdown fences; strip them if present
    if text.startswith("```"):
        text = text.strip().strip("```").strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()

    return json.loads(text)


def generate_homework(
    subject: str,
    topic: str,
    level: str,
    tasks_count: int,
    ai_provider: str = "gpt",
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
    # Prepare prompt
    level_translations = {
        "oge": "ОГЭ",
        "ege_base": "ЕГЭ базовый уровень",
        "ege_profile": "ЕГЭ профильный уровень",
        "olympiad": "Олимпиада"
    }
    level_text = level_translations.get(level, level)

    # Extract problem from topic if present (marked with "Проблема:" or similar)
    problem_section = ""
    problem_markers = ["проблема ученика:", "проблема:", "ошибки:", "слабое место:"]
    topic_lower = topic.lower()
    for marker in problem_markers:
        if marker in topic_lower:
            problem_section = PROBLEM_SECTION_TEMPLATE.format(problem=topic)
            break

    prompt = HOMEWORK_PROMPT.format(
        subject=subject,
        topic=topic,
        level=level_text,
        tasks_count=tasks_count,
        problem_section=problem_section
    )

    try:
        # Call selected provider
        if ai_provider == "claude_sonnet":
            result = _generate_homework_claude(subject, prompt, level_text, tasks_count, settings.CLAUDE_SONNET_MODEL)
        elif ai_provider == "gpt_mini":
            result = _generate_homework_openai(subject, prompt, level_text, tasks_count, settings.GPT_MINI_MODEL)
        else:
            # gpt_nano (default fallback)
            result = _generate_homework_openai(subject, prompt, level_text, tasks_count, settings.GPT_NANO_MODEL)

        # Validate structure
        if not validate_homework_structure(result, tasks_count):
            logger.error(f"Invalid homework structure from AI({ai_provider}): {result}")
            raise ValueError("AI returned invalid homework structure")

        # Validate quality of tasks
        tasks = result.get("tasks", [])
        valid_tasks, invalid_tasks = validate_homework_tasks(tasks, subject, level_text)

        # Update result with only valid tasks
        result["tasks"] = valid_tasks

        # Add validation metadata
        result["_validation"] = {
            "total_generated": len(tasks),
            "valid_count": len(valid_tasks),
            "invalid_count": len(invalid_tasks),
            "quality_score": round(len(valid_tasks) / len(tasks), 2) if tasks else 0,
            "rejected_tasks": [
                {
                    "number": item["task"].get("number"),
                    "errors": item["errors"]
                }
                for item in invalid_tasks
            ]
        }

        logger.info(
            f"Homework validation complete: {len(valid_tasks)}/{len(tasks)} tasks passed "
            f"(quality score: {result['_validation']['quality_score']})"
        )

        return result

    except OpenAIError as e:
        logger.error(f"OpenAI API error: {type(e).__name__}: {str(e)}")
        raise ValueError("AI service temporarily unavailable. Please try again later.")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI({ai_provider}) response as JSON: {str(e)}")
        raise ValueError("AI returned invalid response format")
    except ValueError:
        # Re-raise our own ValueError messages
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_homework({ai_provider}): {type(e).__name__}: {str(e)}")
        raise ValueError("Failed to generate homework. Please try again.")


def test_connection(ai_provider: str = "gpt") -> Dict[str, Any]:
    """
    Test AI connection and return model + latency in ms.
    """
    start = time.time()
    try:
        if ai_provider.startswith("claude"):
            api_key = settings.CLAUDE_API_KEY_EFFECTIVE
            if not api_key:
                raise ValueError("Claude API key is not configured")
            
            model = settings.CLAUDE_SONNET_MODEL
            
            http_client = get_http_client()
            try:
                resp = http_client.post(
                    CLAUDE_API_URL,
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": model,
                        "max_tokens": 32,
                        "temperature": 0,
                        "messages": [{"role": "user", "content": "ping"}],
                    },
                )
            finally:
                http_client.close()
            if resp.status_code >= 400:
                raise ValueError("AI service connection failed")
            model_name = (resp.json() or {}).get("model") or model
        else:
            model = settings.GPT_MINI_MODEL if ai_provider == "gpt_mini" else settings.GPT_NANO_MODEL
            client = get_openai_client()
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a ping test. Reply with OK."},
                    {"role": "user", "content": "ping"},
                ],
                # temperature=0 removed for gpt-5-nano compatibility
            )
            model_name = response.model

        latency_ms = int((time.time() - start) * 1000)
        return {
            "provider": ai_provider,
            "model": model_name,
            "latency_ms": latency_ms,
            "proxy_enabled": bool(settings.OPENAI_PROXY),
        }
    except OpenAIError as e:
        logger.error(f"OpenAI connection test failed: {type(e).__name__}: {str(e)}")
        raise ValueError("AI service connection failed")
    except Exception as e:
        logger.error(f"Unexpected error in test_connection({ai_provider}): {type(e).__name__}: {str(e)}")
        raise ValueError("Failed to test AI connection")
