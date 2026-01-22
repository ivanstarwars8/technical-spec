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
    difficulty: 'oge',
    tasks_count: 5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await homeworkAPI.generate(formData);
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
    const text = result.generated_tasks.tasks
      .map((task) => `${task.number}. ${task.text}\n\nРешение: ${task.solution}\n\nОтвет: ${task.answer}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Сгенерировать домашнее задание</h2>

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
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Результат</h3>
            <button onClick={copyToClipboard} className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Копировать
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {result.generated_tasks.tasks.map((task) => (
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
        </div>
      )}
    </div>
  );
};

export default HomeworkGenerator;
