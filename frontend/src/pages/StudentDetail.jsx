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
    return <div>Загрузка...</div>;
  }

  const totalDebt = lessons
    .filter((l) => l.payment_status !== 'paid')
    .reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к ученикам
        </button>
        <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Удалить
        </button>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {student.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {student.phone}
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {student.subject} - {student.level?.replace('_', ' ').toUpperCase()}
              </div>
              {student.telegram_id && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  Подключен к Telegram
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {['info', 'lessons', 'payments', 'homework'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {{
                info: 'Общее',
                lessons: 'Занятия',
                payments: 'Платежи',
                homework: 'Задания',
              }[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Родитель</div>
                <div className="font-medium">{student.parent_name || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Телефон родителя</div>
                <div className="font-medium">{student.parent_phone || '—'}</div>
              </div>
            </div>

            {student.notes && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Заметки</div>
                <div className="font-medium">{student.notes}</div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Telegram интеграция</h3>
              {student.telegram_id ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  Ученик подключен к Telegram боту
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Сгенерируйте код для привязки ученика к Telegram боту
                  </p>
                  <button onClick={handleGenerateLinkCode} className="btn btn-primary">
                    Сгенерировать код
                  </button>
                  {linkCode && (
                    <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Код привязки:</div>
                      <div className="text-3xl font-bold text-primary-600 tracking-wider">
                        {linkCode}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
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
            <h3 className="font-bold mb-4">История занятий ({lessons.length})</h3>
            {lessons.length > 0 ? (
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {format(new Date(lesson.datetime_start), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </div>
                      <div className="text-sm text-gray-600">{lesson.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{lesson.amount} ₽</div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          lesson.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {lesson.payment_status === 'paid' ? 'Оплачено' : 'Не оплачено'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Нет занятий</div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Платежи ({payments.length})</h3>
              {totalDebt > 0 && (
                <div className="text-red-600 font-bold">Долг: {totalDebt.toFixed(2)} ₽</div>
              )}
            </div>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {format(new Date(payment.payment_date), 'd MMMM yyyy', { locale: ru })}
                      </div>
                      <div className="text-sm text-gray-600">{payment.payment_method}</div>
                    </div>
                    <div className="font-bold">{payment.amount} ₽</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Нет платежей</div>
            )}
          </div>
        )}

        {activeTab === 'homework' && (
          <div>
            <h3 className="font-bold mb-4">Домашние задания ({homeworks.length})</h3>
            {homeworks.length > 0 ? (
              <div className="space-y-4">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{hw.topic}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(hw.created_at), 'd MMMM yyyy', { locale: ru })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {hw.subject} • {hw.difficulty.replace('_', ' ').toUpperCase()} • {hw.tasks_count} задач
                    </div>
                    {hw.sent_via_telegram && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Отправлено в Telegram
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Нет заданий</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
