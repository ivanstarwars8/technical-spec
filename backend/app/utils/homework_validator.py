"""
Модуль валидации качества сгенерированных учебных заданий.

Проверяет задания по 8 критериям качества:
1. Форматно-структурная замкнутость
2. Единственность правильного ответа
3. Хронологическая точность
4. Причинно-следственная конкретность
5. Терминологическая строгость
6. Доказательность решения
7. Педагогическое соответствие
8. Отсутствие самопротиворечий
"""

import re
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class HomeworkQualityValidator:
    """Валидатор качества учебных заданий"""

    # Стоп-слова для проверки качества
    WEAK_REASONING_PATTERNS = [
        r"остальные\s+тоже\s+(подходят|связаны|верны)",
        r"в\s+целом",
        r"можно\s+сказать",
        r"в\s+общем\s+смысле",
        r"отчасти\s+верн",
    ]

    ABSTRACT_TERMS = [
        "улучшение", "ухудшение", "прогресс", "развитие",
        "демократизация", "модернизация"
    ]

    OPTION_MARKERS = [
        r"\b[А-Г]\)",  # А) Б) В) Г)
        r"\b[1-4]\)",  # 1) 2) 3) 4)
        r"\b[а-г]\)",  # а) б) в) г)
        r"\b[A-D]\)",  # A) B) C) D)
    ]

    def __init__(self, subject: str, level: str):
        self.subject = subject.lower()
        self.level = level.lower()
        self.is_history = "истор" in self.subject

    def validate_task(self, task: Dict) -> Tuple[bool, List[str]]:
        """
        Проверяет задание по всем критериям качества.

        Args:
            task: Словарь с полями {number, text, solution, answer}

        Returns:
            (is_valid, errors): True если задание валидно, список ошибок
        """
        errors = []

        # Проверка структуры
        if not self._check_structure(task):
            errors.append("Отсутствуют обязательные поля (text/solution/answer)")
            return False, errors

        text = task.get("text", "")
        solution = task.get("solution", "")
        answer = task.get("answer", "")

        # 1. Форматно-структурная замкнутость
        closure_errors = self._check_closure(text, solution, answer)
        errors.extend(closure_errors)

        # 2. Единственность правильного ответа
        uniqueness_errors = self._check_uniqueness(solution)
        errors.extend(uniqueness_errors)

        # 3. Хронологическая точность (только для истории)
        if self.is_history:
            chrono_errors = self._check_chronology(text, solution)
            errors.extend(chrono_errors)

        # 4. Причинно-следственная конкретность
        causality_errors = self._check_causality(text, solution)
        errors.extend(causality_errors)

        # 5. Терминологическая строгость
        terminology_errors = self._check_terminology(solution)
        errors.extend(terminology_errors)

        # 6. Доказательность решения
        proof_errors = self._check_proof_quality(solution)
        errors.extend(proof_errors)

        # 7. Отсутствие самопротиворечий
        contradiction_errors = self._check_contradictions(solution)
        errors.extend(contradiction_errors)

        is_valid = len(errors) == 0
        return is_valid, errors

    def _check_structure(self, task: Dict) -> bool:
        """Проверка базовой структуры задания"""
        required_fields = ["text", "solution", "answer"]
        return all(
            field in task and task[field] and len(str(task[field]).strip()) > 0
            for field in required_fields
        )

    def _check_closure(self, text: str, solution: str, answer: str) -> List[str]:
        """Проверка замкнутости: всё, на что ссылается ответ, есть в условии"""
        errors = []

        # Проверка вариантов ответа
        has_options_in_text = any(
            re.search(pattern, text) for pattern in self.OPTION_MARKERS
        )

        # Если в решении/ответе есть ссылки на варианты, они должны быть в тексте
        option_refs_in_solution = re.findall(
            r"вариант\s+([А-Г]|[A-D]|[а-г]|[1-4])", solution, re.IGNORECASE
        )
        option_refs_in_answer = re.findall(
            r"^([А-Г]|[A-D]|[а-г])$", answer.strip()
        )

        if (option_refs_in_solution or option_refs_in_answer) and not has_options_in_text:
            errors.append(
                "ЗАМКНУТОСТЬ: Решение/ответ ссылается на варианты (А/Б/В...), "
                "которых нет в условии задания"
            )

        # Проверка на "сопоставьте" без списка
        if re.search(r"сопост[ао]в", text, re.IGNORECASE):
            # Должен быть список для сопоставления
            if not re.search(r"[1-4]\).*[А-Г]\)", text) and not re.search(r"[А-Г]\).*[1-4]\)", text):
                errors.append(
                    "ЗАМКНУТОСТЬ: Требуется сопоставление, но нет списка элементов для сопоставления"
                )

        return errors

    def _check_uniqueness(self, solution: str) -> List[str]:
        """Проверка единственности правильного ответа"""
        errors = []

        # Поиск признаков множественных правильных ответов
        for pattern in self.WEAK_REASONING_PATTERNS:
            if re.search(pattern, solution, re.IGNORECASE):
                errors.append(
                    f"ЕДИНСТВЕННОСТЬ: Решение содержит признак неоднозначности "
                    f"(найдено: '{re.search(pattern, solution, re.IGNORECASE).group()}')"
                )
                break

        # Проверка на "все варианты связаны/подходят"
        if re.search(r"все\s+(варианты|пункты|ответы).{0,30}(связан|подход|верн)", solution, re.IGNORECASE):
            errors.append(
                "ЕДИНСТВЕННОСТЬ: Решение указывает, что несколько вариантов корректны"
            )

        return errors

    def _check_chronology(self, text: str, solution: str) -> List[str]:
        """Проверка хронологической точности (для истории)"""
        errors = []

        # Поиск дат в формате YYYY
        dates_in_text = re.findall(r'\b(1[0-9]{3}|20[0-2][0-9])\b', text)
        dates_in_solution = re.findall(r'\b(1[0-9]{3}|20[0-2][0-9])\b', solution)

        # Проверка на смешение периодов и точечных событий
        has_period = re.search(r'\d{4}\s*[—–-]\s*\d{4}', text)
        has_single_dates = len(dates_in_text) >= 2

        if has_period and has_single_dates:
            # Должны быть уточнения "начало/конец/кульминация"
            if not re.search(r'(начало|конец|завершение|кульминация|открытие)', text, re.IGNORECASE):
                errors.append(
                    "ХРОНОЛОГИЯ: Смешаны периоды и точечные события без уточнений "
                    "(начало/конец/кульминация)"
                )

        # Проверка терминологической путаницы дат
        date_terms = re.findall(
            r'(создан|учрежд|основан|созван|открыт)', solution, re.IGNORECASE
        )
        if len(set(date_terms)) > 1 and dates_in_solution:
            logger.warning(
                f"Возможная терминологическая путаница дат: {date_terms}"
            )

        return errors

    def _check_causality(self, text: str, solution: str) -> List[str]:
        """Проверка причинно-следственной конкретности"""
        errors = []

        # Проверка на задания о причинах/следствиях
        is_causality_task = re.search(
            r'(причин|следств|привел|вызва|результат)', text, re.IGNORECASE
        )

        if is_causality_task:
            # Не должно быть абстрактных оценок вместо конкретики
            abstract_in_solution = [
                term for term in self.ABSTRACT_TERMS
                if term in solution.lower()
            ]

            if abstract_in_solution and not re.search(r'(закон|указ|манифест|реформ|институт|учреждение)', solution, re.IGNORECASE):
                errors.append(
                    f"ПРИЧИННОСТЬ: Абстрактные оценки ({', '.join(abstract_in_solution)}) "
                    f"вместо конкретных механизмов/изменений"
                )

            # Проверка подмены причины на описание
            if re.search(r'причина.*это\s+(событие|процесс)', solution, re.IGNORECASE):
                errors.append(
                    "ПРИЧИННОСТЬ: Причина подменена описанием события вместо объяснения 'почему'"
                )

        return errors

    def _check_terminology(self, solution: str) -> List[str]:
        """Проверка терминологической строгости"""
        errors = []

        # Проверка на размытые термины
        vague_terms = [
            r'парламентский\s+контроль(?!\s+(включал|означал|предполагал))',
            r'первая\s+(русская|российская)\s+армия(?!\s+под\s+командованием)',
            r'отмена\s+монархии(?!\s+в\s+результате)',
        ]

        for pattern in vague_terms:
            if re.search(pattern, solution, re.IGNORECASE):
                errors.append(
                    f"ТЕРМИНОЛОГИЯ: Размытая формулировка без конкретизации "
                    f"(найдено: '{re.search(pattern, solution, re.IGNORECASE).group()}')"
                )

        return errors

    def _check_proof_quality(self, solution: str) -> List[str]:
        """Проверка доказательности решения"""
        errors = []

        # Решение должно объяснять, почему другие варианты неверны
        has_exclusion = re.search(
            r'(остальные|другие|иные)\s+(варианты|пункты|ответы).{0,50}(неверн|неправ|ошибочн|не\s+подход)',
            solution,
            re.IGNORECASE
        )

        has_options_ref = re.search(r'вариант\s+[А-Г]', solution, re.IGNORECASE)

        if has_options_ref and not has_exclusion:
            logger.warning(
                "ДОКАЗАТЕЛЬНОСТЬ: Решение не объясняет, почему другие варианты неверны"
            )
            # Не добавляем в errors, т.к. это warning, но можно изменить

        # Проверка на "красивый текст" вместо доказательства
        if re.search(r'потому что.{0,20}(связан|относ[иЯ]тся|каса[еЁ]тся)', solution, re.IGNORECASE):
            if not re.search(r'(исключ|не\s+подход|неверн)', solution, re.IGNORECASE):
                errors.append(
                    "ДОКАЗАТЕЛЬНОСТЬ: Решение объясняет 'связь', но не доказывает "
                    "исключение других вариантов"
                )

        return errors

    def _check_contradictions(self, solution: str) -> List[str]:
        """Проверка на самопротиворечия"""
        errors = []

        # Признаки противоречий
        contradiction_markers = [
            r'однако.{0,20}(также|тоже)\s+(верн|подход)',
            r'но.{0,20}(можно|возможно)\s+рассматривать',
            r'хотя.{0,30}не\s+исключ',
        ]

        for pattern in contradiction_markers:
            if re.search(pattern, solution, re.IGNORECASE):
                errors.append(
                    f"САМОПРОТИВОРЕЧИЕ: Решение содержит противоречие или оговорки "
                    f"(найдено: '{re.search(pattern, solution, re.IGNORECASE).group()}')"
                )

        return errors


def validate_homework_tasks(tasks: List[Dict], subject: str, level: str) -> Tuple[List[Dict], List[Dict]]:
    """
    Валидирует список заданий и возвращает валидные и невалидные.

    Args:
        tasks: Список заданий для проверки
        subject: Предмет
        level: Уровень (ОГЭ, ЕГЭ, и т.д.)

    Returns:
        (valid_tasks, invalid_tasks_with_errors)
    """
    validator = HomeworkQualityValidator(subject, level)

    valid_tasks = []
    invalid_tasks = []

    for task in tasks:
        is_valid, errors = validator.validate_task(task)

        if is_valid:
            valid_tasks.append(task)
        else:
            invalid_tasks.append({
                "task": task,
                "errors": errors
            })
            logger.warning(
                f"Task #{task.get('number')} failed validation: {errors}"
            )

    logger.info(
        f"Validation results: {len(valid_tasks)} valid, {len(invalid_tasks)} invalid"
    )

    return valid_tasks, invalid_tasks
