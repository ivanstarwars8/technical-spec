import { useState, useEffect } from 'react';
import { studentsAPI, homeworkAPI } from '../services/api';
import HomeworkGenerator from '../components/HomeworkGenerator';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Homework = () => {
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Домашние задания</h1>
        <p className="text-gray-600">AI-генератор задач для учеников</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <HomeworkGenerator students={students} />
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">История генераций</h2>
          {history.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.map((hw) => {
                const student = students.find((s) => s.id === hw.student_id);
                return (
                  <div key={hw.id} className="border-l-4 border-primary-500 pl-4 py-3 bg-gray-50 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{hw.topic}</div>
                        <div className="text-sm text-gray-600">{student?.name || 'Ученик'}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(hw.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">
                        {hw.subject}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        {hw.difficulty.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-gray-600">{hw.tasks_count} задач</span>
                    </div>
                    {hw.sent_via_telegram && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Отправлено в Telegram
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Нет истории генераций
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homework;
