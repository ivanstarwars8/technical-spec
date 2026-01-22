import { useState, useEffect } from 'react';
import { studentsAPI, homeworkAPI, featuresAPI } from '../services/api';
import HomeworkGenerator from '../components/HomeworkGenerator';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Homework = () => {
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiReason, setAiReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, historyRes] = await Promise.all([
        studentsAPI.getAll(),
        homeworkAPI.getHistory(),
      ]);

      setStudents(studentsRes.data);
      setHistory(historyRes.data);
      try {
        const featuresRes = await featuresAPI.get();
        setAiEnabled(Boolean(featuresRes.data?.ai_homework));
        setAiReason(featuresRes.data?.ai_homework_reason || '');
      } catch (featureError) {
        console.error('Error loading features:', featureError);
        setAiEnabled(false);
        setAiReason('Не удалось проверить доступность AI генератора');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-600 dark:text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-slate-100">Домашние задания</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">AI-генератор задач для учеников</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          {aiEnabled ? (
            <HomeworkGenerator students={students} />
          ) : (
            <div className="card">
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-slate-100">AI-генератор отключен</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                {aiReason || 'Для включения добавьте OPENAI_API_KEY в .env и перезапустите backend.'}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">История генераций</h2>
          {history.length > 0 ? (
            <div className="space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
              {history.map((hw) => {
                const student = students.find((s) => s.id === hw.student_id);
                return (
                  <div key={hw.id} className="border-l-4 border-primary-500 dark:border-primary-400 pl-3 sm:pl-4 py-2 sm:py-3 bg-gray-50 dark:bg-slate-700/50 rounded-r">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-1">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-slate-100">{hw.topic}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">{student?.name || 'Ученик'}</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-500">
                        {format(new Date(hw.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                        {hw.subject}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded">
                        {hw.difficulty.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-gray-600 dark:text-slate-400">{hw.tasks_count} задач</span>
                    </div>
                    {hw.sent_via_telegram && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Отправлено в Telegram
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-500 py-12">
              Нет истории генераций
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homework;
