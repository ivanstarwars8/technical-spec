import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { homeworkAPI } from '../services/api';
import { Loader2, Copy, Check } from 'lucide-react';

const HomeworkGenerator = ({ students }) => {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    topic: '',
    student_problem: '',
    difficulty: 'oge',
    tasks_count: 5,
    ai_provider: 'gpt_nano',
    student_context: '',
    last_mistakes: '',
    teaching_goal: 'practice',
    extra_instructions: '',
    difficulty_mix: 'balanced',
    show_solutions: true,
    textbook_mode: 'none',
    textbook_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculateCredits = (tasksCount) => {
    const count = Number(tasksCount) || 0;
    const base = count <= 5 ? 1 : Math.ceil(count / 5);
    
    if (formData.ai_provider === 'claude_sonnet') return base * 5;
    if (formData.ai_provider === 'gpt_mini') return base * 2;
    return base; // gpt_nano = 1x
  };

  const buildTopicPrompt = () => {
    const parts = [formData.topic.trim()];

    // Проблема ученика (ключевое поле!)
    if (formData.student_problem.trim()) {
      parts.push(`\nПРОБЛЕМА УЧЕНИКА: ${formData.student_problem.trim()}`);
    }

    // Учебник
    if (formData.textbook_mode !== 'none' && formData.textbook_name.trim()) {
      if (formData.textbook_mode === 'from_textbook') {
        parts.push(`УЧЕБНИК: ${formData.textbook_name.trim()}`);
        parts.push('ВАЖНО: Составь задания СТРОГО из этого учебника. Используй номера заданий, формулировки и примеры из учебника. Задачи должны быть узнаваемы учеником как задания из его учебника.');
      } else if (formData.textbook_mode === 'textbook_inspired') {
        parts.push(`УЧЕБНИК-ОРИЕНТИР: ${formData.textbook_name.trim()}`);
        parts.push('Генерируй новые задания, но в стиле и формате этого учебника. Используй похожую терминологию, типы задач и уровень сложности как в указанном учебнике.');
      }
    }

    if (formData.student_context.trim()) {
      parts.push(`Контекст ученика: ${formData.student_context.trim()}`);
    }
    if (formData.last_mistakes.trim()) {
      parts.push(`Последние ошибки: ${formData.last_mistakes.trim()}`);
    }
    if (formData.teaching_goal) {
      const goalLabel =
        formData.teaching_goal === 'practice'
          ? 'Закрепление темы'
          : formData.teaching_goal === 'exam'
          ? 'Подготовка к экзамену'
          : 'Разбор ошибок и пробелов';
      parts.push(`Цель урока: ${goalLabel}`);
    }
    if (formData.difficulty_mix) {
      const mixLabel =
        formData.difficulty_mix === 'easy'
          ? 'Больше простых задач'
          : formData.difficulty_mix === 'hard'
          ? 'Больше сложных задач'
          : 'Сбалансированная сложность';
      parts.push(`Сложность: ${mixLabel}`);
    }
    if (formData.show_solutions) {
      parts.push('Покажи решения по шагам');
    } else {
      parts.push('Без подробных решений, только ответы');
    }
    if (formData.extra_instructions.trim()) {
      parts.push(`Доп. инструкции: ${formData.extra_instructions.trim()}`);
    }
    return parts.filter(Boolean).join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        topic: buildTopicPrompt(),
      };
      const response = await homeworkAPI.generate(payload);
      setResult(response.data);
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      alert('Ошибка генерации: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const data = result.generated_tasks;
    let text = '';

    // Поддержка нового формата с блоками
    if (data.blocks && Array.isArray(data.blocks)) {
      text = data.worksheet_title ? `# ${data.worksheet_title}\n\n` : '';
      data.blocks.forEach((block) => {
        text += `## ${block.block_name}\n`;
        if (block.block_description) text += `${block.block_description}\n`;
        text += '\n';
        block.tasks.forEach((task) => {
          text += `${task.number}. ${task.text}\n`;
          if (task.solution) text += `Решение: ${task.solution}\n`;
          text += `Ответ: ${task.answer}\n\n`;
        });
        text += '---\n\n';
      });
    } else {
      // Старый формат
      text = data.tasks
        .map((task) => `${task.number}. ${task.text}\n\nРешение: ${task.solution}\n\nОтвет: ${task.answer}\n`)
        .join('\n---\n\n');
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTasks = () => {
    const data = result.generated_tasks;

    // Новый формат с блоками
    if (data.blocks && Array.isArray(data.blocks)) {
      return (
        <div className="space-y-6">
          {data.worksheet_title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{data.worksheet_title}</h3>
          )}
          {data.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="space-y-3">
              <div className="border-b border-gray-200 dark:border-slate-700 pb-2">
                <h4 className="font-bold text-gray-800 dark:text-slate-200">{block.block_name}</h4>
                {block.block_description && (
                  <p className="text-sm text-gray-600 dark:text-slate-400">{block.block_description}</p>
                )}
              </div>
              {block.tasks.map((task) => (
                <div key={task.number} className="border-l-4 border-primary-500 dark:border-primary-400 pl-3 sm:pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-slate-100">№{task.number}</span>
                    {task.type && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-slate-400">
                        {task.type}
                      </span>
                    )}
                  </div>
                  <div className="mb-2 text-gray-800 dark:text-slate-200 whitespace-pre-wrap">{task.text}</div>
                  {task.solution && (
                    <details className="text-sm text-gray-600 dark:text-slate-400">
                      <summary className="cursor-pointer font-medium hover:text-gray-900 dark:hover:text-slate-200 transition-colors">
                        Решение
                      </summary>
                      <div className="mt-2 whitespace-pre-wrap">{task.solution}</div>
                    </details>
                  )}
                  <div className="text-sm font-medium mt-2">
                    <span className="text-gray-600 dark:text-slate-400">Ответ:</span>{' '}
                    <span className="text-gray-900 dark:text-slate-100">{task.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Старый формат
    return (
      <div className="space-y-4">
        {data.tasks.map((task) => (
          <div key={task.number} className="border-l-4 border-primary-500 dark:border-primary-400 pl-3 sm:pl-4 py-2">
            <div className="font-semibold mb-2 text-gray-900 dark:text-slate-100">Задача {task.number}</div>
            <div className="mb-2 text-gray-800 dark:text-slate-200">{task.text}</div>
            <details className="text-sm text-gray-600 dark:text-slate-400">
              <summary className="cursor-pointer font-medium hover:text-gray-900 dark:hover:text-slate-200 transition-colors">Решение</summary>
              <div className="mt-2">{task.solution}</div>
            </details>
            <div className="text-sm font-medium mt-2">
              <span className="text-gray-600 dark:text-slate-400">Ответ:</span>{' '}
              <span className="text-gray-900 dark:text-slate-100">{task.answer}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Сгенерировать домашнее задание</h2>

        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="font-semibold">Расчёт AI кредитов</div>
          <div className="mt-1">GPT-5 Nano = 1 кредит (самый дешёвый)</div>
          <div>GPT-5 Mini = 2 кредита</div>
          <div>Claude Sonnet 4.5 = 5 кредитов (сложная подготовка)</div>
        </div>

        <div>
          <label className="label">AI модель</label>
          <select
            className="input"
            value={formData.ai_provider}
            onChange={(e) => setFormData({ ...formData, ai_provider: e.target.value })}
          >
            <option value="gpt_nano">GPT-5 Nano (дешевле)</option>
            <option value="gpt_mini">GPT-5 Mini (средне)</option>
            <option value="claude_sonnet">Claude Sonnet 4.5 (топ)</option>
          </select>
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Claude и GPT работают через прокси.
          </div>
        </div>

        <div>
          <label className="label">Ученик</label>
          <select
            className="input"
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            required
          >
            <option value="">Выберите ученика</option>
            {students?.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Предмет</label>
          <input
            type="text"
            className="input"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Математика"
            required
          />
        </div>

        <div>
          <label className="label">Тема</label>
          <input
            type="text"
            className="input"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Квадратные уравнения"
            required
          />
        </div>

        {/* Проблема ученика - ключевое поле */}
        <div className="rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4">
          <label className="label text-amber-800 dark:text-amber-300">
            🎯 Проблема ученика (что именно не получается?)
          </label>
          <textarea
            className="input bg-white dark:bg-slate-800"
            rows="2"
            value={formData.student_problem}
            onChange={(e) => setFormData({ ...formData, student_problem: e.target.value })}
            placeholder="Напр.: постоянно забывает окончание -s, путает когда применять теорему Виета, не понимает разницу между Present Simple и Continuous"
          />
          <div className="text-xs text-amber-700 dark:text-amber-400 mt-2">
            Опиши конкретную проблему — AI создаст задания с ловушками на эту ошибку и упражнения для её устранения
          </div>
        </div>

        {/* Блок учебника */}
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">📚 Использование учебника</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.textbook_mode === 'none'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}>
              <input
                type="radio"
                name="textbook_mode"
                value="none"
                checked={formData.textbook_mode === 'none'}
                onChange={(e) => setFormData({ ...formData, textbook_mode: e.target.value })}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">Без учебника</div>
                <div className="text-xs text-gray-500 dark:text-slate-500">Свободная генерация</div>
              </div>
            </label>

            <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.textbook_mode === 'from_textbook'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}>
              <input
                type="radio"
                name="textbook_mode"
                value="from_textbook"
                checked={formData.textbook_mode === 'from_textbook'}
                onChange={(e) => setFormData({ ...formData, textbook_mode: e.target.value })}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">Из учебника</div>
                <div className="text-xs text-gray-500 dark:text-slate-500">Задания из книги</div>
              </div>
            </label>

            <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              formData.textbook_mode === 'textbook_inspired'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}>
              <input
                type="radio"
                name="textbook_mode"
                value="textbook_inspired"
                checked={formData.textbook_mode === 'textbook_inspired'}
                onChange={(e) => setFormData({ ...formData, textbook_mode: e.target.value })}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">По стилю</div>
                <div className="text-xs text-gray-500 dark:text-slate-500">Новые в стиле учебника</div>
              </div>
            </label>
          </div>

          {formData.textbook_mode !== 'none' && (
            <div>
              <label className="label">Название учебника</label>
              <input
                type="text"
                className="input"
                value={formData.textbook_name}
                onChange={(e) => setFormData({ ...formData, textbook_name: e.target.value })}
                placeholder="Напр.: Мордкович 10 класс, Атанасян Геометрия 7-9"
                required={formData.textbook_mode !== 'none'}
              />
              <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                {formData.textbook_mode === 'from_textbook'
                  ? 'AI составит задания, максимально похожие на задачи из этого учебника'
                  : 'AI сгенерирует новые задания в стиле и формате указанного учебника'
                }
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Сложность</label>
          <select
            className="input"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          >
            <option value="oge">ОГЭ</option>
            <option value="ege_base">ЕГЭ База</option>
            <option value="ege_profile">ЕГЭ Профиль</option>
            <option value="olympiad">Олимпиада</option>
          </select>
        </div>

        <div>
          <label className="label">Количество задач (3-10)</label>
          <input
            type="number"
            className="input"
            min="3"
            max="10"
            value={formData.tasks_count}
            onChange={(e) => setFormData({ ...formData, tasks_count: parseInt(e.target.value) })}
            required
          />
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            Примерный расход: <span className="font-semibold">{calculateCredits(formData.tasks_count)}</span> AI кредитов
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Цель занятия</label>
            <select
              className="input"
              value={formData.teaching_goal}
              onChange={(e) => setFormData({ ...formData, teaching_goal: e.target.value })}
            >
              <option value="practice">Закрепление темы</option>
              <option value="exam">Подготовка к экзамену</option>
              <option value="gaps">Разбор ошибок и пробелов</option>
            </select>
          </div>
          <div>
            <label className="label">Контекст ученика</label>
            <input
              type="text"
              className="input"
              value={formData.student_context}
              onChange={(e) => setFormData({ ...formData, student_context: e.target.value })}
              placeholder="Класс, сильные стороны, темп, формат"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Распределение сложности</label>
            <select
              className="input"
              value={formData.difficulty_mix}
              onChange={(e) => setFormData({ ...formData, difficulty_mix: e.target.value })}
            >
              <option value="balanced">Сбалансированно</option>
              <option value="easy">Больше простых</option>
              <option value="hard">Больше сложных</option>
            </select>
          </div>
          <div className="flex items-center gap-3 mt-6 sm:mt-0">
            <input
              id="show-solutions"
              type="checkbox"
              className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700"
              checked={formData.show_solutions}
              onChange={(e) => setFormData({ ...formData, show_solutions: e.target.checked })}
            />
            <label htmlFor="show-solutions" className="text-sm text-gray-700 dark:text-slate-300">
              Решения по шагам
            </label>
          </div>
        </div>

        <div>
          <label className="label">Последние ошибки ученика</label>
          <textarea
            className="input"
            rows="2"
            value={formData.last_mistakes}
            onChange={(e) => setFormData({ ...formData, last_mistakes: e.target.value })}
            placeholder="Напр.: путает формулы, теряет знаки, ошибки в дробях"
          />
        </div>

        <div>
          <label className="label">Дополнительные инструкции</label>
          <textarea
            className="input"
            rows="2"
            value={formData.extra_instructions}
            onChange={(e) => setFormData({ ...formData, extra_instructions: e.target.value })}
            placeholder="Напр.: добавь 1 задачу на логику, избегай сложных терминов"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Генерация...
            </>
          ) : (
            'Сгенерировать'
          )}
        </button>
      </form>

      {result && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Рабочий лист</h3>
              {result.generated_tasks.total_tasks && (
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {result.generated_tasks.total_tasks} заданий
                </p>
              )}
            </div>
            <button onClick={copyToClipboard} className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Копировать всё
                </>
              )}
            </button>
          </div>

          {renderTasks()}
        </div>
      )}
    </div>
  );
};

export default HomeworkGenerator;
