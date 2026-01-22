import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsAPI, lessonsAPI, paymentsAPI, homeworkAPI } from '../services/api';
import { ArrowLeft, Phone, User, BookOpen, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [lessons, setLessons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    try {
      const studentRes = await studentsAPI.getById(id);
      setStudent(studentRes.data);

      const [lessonsRes, paymentsRes, homeworkRes] = await Promise.all([
        lessonsAPI.getAll({ student_id: id }),
        paymentsAPI.getAll(),
        homeworkAPI.getHistory(),
      ]);

      setLessons(lessonsRes.data.filter((l) => l.student_id === id));
      setPayments(paymentsRes.data.filter((p) => p.student_id === id));
      setHomeworks(homeworkRes.data.filter((h) => h.student_id === id));
    } catch (error) {
      console.error('Error loading student:', error);
      alert('Ученик не найден');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLinkCode = async () => {
    try {
      const response = await studentsAPI.generateLinkCode(id);
      setLinkCode(response.data.link_code);
    } catch (error) {
      alert('Ошибка генерации кода: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого ученика?')) {
      return;
    }

    try {
      await studentsAPI.delete(id);
      navigate('/students');
    } catch (error) {
      alert('Ошибка удаления: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-600 dark:text-slate-400">Загрузка...</div>
      </div>
    );
  }

  const totalDebt = lessons
    .filter((l) => l.payment_status !== 'paid')
    .reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);

  const tabs = [
    { id: 'info', label: 'Общее' },
    { id: 'lessons', label: 'Занятия' },
    { id: 'payments', label: 'Платежи' },
    { id: 'homework', label: 'Задания' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к ученикам
        </button>
        <button onClick={handleDelete} className="btn btn-danger flex items-center justify-center gap-2 w-full sm:w-auto">
          <Trash2 className="w-4 h-4" />
          Удалить
        </button>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-slate-100 truncate">{student.name}</h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 dark:text-slate-400">
              {student.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{student.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span>{student.subject} - {student.level?.replace('_', ' ').toUpperCase()}</span>
              </div>
              {student.telegram_id && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                  Подключен к Telegram
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 sm:gap-4 min-w-max px-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 font-medium'
                  : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Родитель</div>
                <div className="font-medium text-gray-900 dark:text-slate-100">{student.parent_name || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Телефон родителя</div>
                <div className="font-medium text-gray-900 dark:text-slate-100">{student.parent_phone || '—'}</div>
              </div>
            </div>

            {student.notes && (
              <div>
                <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Заметки</div>
                <div className="font-medium text-gray-900 dark:text-slate-100">{student.notes}</div>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-slate-100">Telegram интеграция</h3>
              {student.telegram_id ? (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                  Ученик подключен к Telegram боту
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    Сгенерируйте код для привязки ученика к Telegram боту
                  </p>
                  <button onClick={handleGenerateLinkCode} className="btn btn-primary">
                    Сгенерировать код
                  </button>
                  {linkCode && (
                    <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Код привязки:</div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 tracking-wider">
                        {linkCode}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                        Передайте этот код ученику для ввода в Telegram боте
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div>
            <h3 className="font-bold mb-4 text-gray-900 dark:text-slate-100">История занятий ({lessons.length})</h3>
            {lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg gap-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-slate-100">
                        {format(new Date(lesson.datetime_start), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">{lesson.status}</div>
                    </div>
                    <div className="flex items-center gap-2 sm:text-right">
                      <div className="font-medium text-gray-900 dark:text-slate-100">{lesson.amount} ₽</div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          lesson.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {lesson.payment_status === 'paid' ? 'Оплачено' : 'Не оплачено'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-slate-500 py-8">Нет занятий</div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">Платежи ({payments.length})</h3>
              {totalDebt > 0 && (
                <div className="text-red-600 dark:text-red-400 font-bold">Долг: {totalDebt.toFixed(2)} ₽</div>
              )}
            </div>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg gap-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-slate-100">
                        {format(new Date(payment.payment_date), 'd MMMM yyyy', { locale: ru })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">{payment.payment_method}</div>
                    </div>
                    <div className="font-bold text-green-600 dark:text-green-400">{payment.amount} ₽</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-slate-500 py-8">Нет платежей</div>
            )}
          </div>
        )}

        {activeTab === 'homework' && (
          <div>
            <h3 className="font-bold mb-4 text-gray-900 dark:text-slate-100">Домашние задания ({homeworks.length})</h3>
            {homeworks.length > 0 ? (
              <div className="space-y-4">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="border-l-4 border-primary-500 dark:border-primary-400 pl-4 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                      <div className="font-semibold text-gray-900 dark:text-slate-100">{hw.topic}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-500">
                        {format(new Date(hw.created_at), 'd MMMM yyyy', { locale: ru })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      {hw.subject} • {hw.difficulty.replace('_', ' ').toUpperCase()} • {hw.tasks_count} задач
                    </div>
                    {hw.sent_via_telegram && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Отправлено в Telegram
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-slate-500 py-8">Нет заданий</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
