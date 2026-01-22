import { useState, useEffect } from 'react';
import { lessonsAPI, studentsAPI, paymentsAPI } from '../services/api';
import Calendar from '../components/Calendar';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X } from 'lucide-react';

const CalendarPage = () => {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [filters, setFilters] = useState({
    student_id: '',
    payment_status: '',
    only_with_debt: false,
  });

  const [formData, setFormData] = useState({
    student_id: '',
    datetime_start: '',
    datetime_end: '',
    amount: '',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const now = new Date();
      const start = startOfWeek(now, { locale: ru, weekStartsOn: 1 });
      const end = endOfWeek(now, { locale: ru, weekStartsOn: 1 });

      const [lessonsRes, studentsRes] = await Promise.all([
        lessonsAPI.getCalendar({
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
        }),
        studentsAPI.getAll(),
      ]);

      setLessons(lessonsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedLesson(null);
    setPaymentError('');
    setFormData({
      student_id: '',
      datetime_start: format(date, "yyyy-MM-dd'T'10:00"),
      datetime_end: format(date, "yyyy-MM-dd'T'11:00"),
      amount: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setPaymentError('');
    setFormData({
      student_id: lesson.student_id,
      datetime_start: format(new Date(lesson.datetime_start), "yyyy-MM-dd'T'HH:mm"),
      datetime_end: format(new Date(lesson.datetime_end), "yyyy-MM-dd'T'HH:mm"),
      amount: lesson.amount || '',
      notes: lesson.notes || '',
    });
    const remaining = lesson.remaining_amount ?? lesson.amount ?? '';
    setPaymentForm({
      amount: remaining ? String(remaining) : '',
      payment_method: 'cash',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLesson) {
        await lessonsAPI.update(selectedLesson.id, formData);
      } else {
        await lessonsAPI.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      alert('Ошибка сохранения: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить занятие?')) return;

    try {
      await lessonsAPI.delete(selectedLesson.id);
      setShowModal(false);
      loadData();
    } catch (error) {
      alert('Ошибка удаления: ' + error.message);
    }
  };

  const handleQuickPayment = async (e) => {
    e.preventDefault();
    if (!selectedLesson) return;

    setSavingPayment(true);
    setPaymentError('');
    try {
      await paymentsAPI.create({
        student_id: selectedLesson.student_id,
        lesson_id: selectedLesson.id,
        amount: paymentForm.amount,
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
      });
      await loadData();
      setShowModal(false);
    } catch (error) {
      setPaymentError(error.response?.data?.detail || error.message);
    } finally {
      setSavingPayment(false);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (filters.student_id && lesson.student_id !== filters.student_id) return false;
    if (filters.payment_status && lesson.payment_status !== filters.payment_status) return false;
    if (filters.only_with_debt) {
      const remaining = lesson.remaining_amount ?? lesson.amount ?? null;
      if (!remaining || Number(remaining) <= 0) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-slate-100">Календарь</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">Планирование занятий</p>
      </div>

      <Calendar
        lessons={lessons}
        onDayClick={handleDayClick}
        onLessonClick={handleLessonClick}
      />

      {/* Lessons Table */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Список занятий</h2>
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">
            <select
              className="input w-full sm:w-auto text-sm"
              value={filters.student_id}
              onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
            >
              <option value="">Все ученики</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <select
              className="input w-full sm:w-auto text-sm"
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
            >
              <option value="">Все статусы</option>
              <option value="paid">Оплачено</option>
              <option value="unpaid">Не оплачено</option>
              <option value="partial">Частично</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={filters.only_with_debt}
                onChange={(e) => setFilters({ ...filters, only_with_debt: e.target.checked })}
                className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700"
              />
              Только с остатком
            </label>
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-slate-500 py-8">
            Нет занятий по выбранным фильтрам
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="text-left text-gray-500 dark:text-slate-500">
                <tr>
                  <th className="py-2 px-4 sm:px-0">Дата</th>
                  <th className="py-2">Ученик</th>
                  <th className="py-2">Статус оплаты</th>
                  <th className="py-2">Стоимость</th>
                  <th className="py-2 pr-4 sm:pr-0">Остаток</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => {
                  const student = students.find((s) => s.id === lesson.student_id);
                  const remaining = lesson.remaining_amount ?? lesson.amount ?? null;
                  return (
                    <tr key={lesson.id} className="border-t border-gray-200 dark:border-slate-700">
                      <td className="py-2 px-4 sm:px-0 text-gray-900 dark:text-slate-100">
                        {format(new Date(lesson.datetime_start), 'd MMMM yyyy, HH:mm', { locale: ru })}
                      </td>
                      <td className="py-2 text-gray-900 dark:text-slate-100">{student?.name || '—'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lesson.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : lesson.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {lesson.payment_status === 'paid' ? 'Оплачено' :
                           lesson.payment_status === 'partial' ? 'Частично' : 'Не оплачено'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-900 dark:text-slate-100">{lesson.amount ? `${parseFloat(lesson.amount).toFixed(2)} ₽` : '—'}</td>
                      <td className="py-2 pr-4 sm:pr-0 text-gray-900 dark:text-slate-100">
                        {remaining === null ? 'Без цены' : `${parseFloat(remaining).toFixed(2)} ₽`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                {selectedLesson ? 'Редактировать занятие' : 'Новое занятие'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Ученик *</label>
                <select
                  className="input"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">Выберите ученика</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Начало *</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.datetime_start}
                    onChange={(e) => setFormData({ ...formData, datetime_start: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Конец *</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.datetime_end}
                    onChange={(e) => setFormData({ ...formData, datetime_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Стоимость (₽)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="1000"
                />
              </div>
              {!formData.amount && (
                <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-2 text-sm text-amber-700 dark:text-amber-400">
                  Внимание: у урока не указана стоимость. Платежи и долги учитывать не будут.
                </div>
              )}
              {selectedLesson && (
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  Остаток по уроку:{' '}
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {selectedLesson.remaining_amount ?? selectedLesson.amount ?? '—'} ₽
                  </span>
                </div>
              )}

              {selectedLesson && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-slate-100">Быстрый платёж</h3>
                  {paymentError && (
                    <div className="mb-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-2 text-sm text-red-700 dark:text-red-400">
                      {paymentError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Сумма (₽)</label>
                      <input
                        type="number"
                        className="input"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Дата платежа</label>
                      <input
                        type="date"
                        className="input"
                        value={paymentForm.payment_date}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Способ оплаты</label>
                      <select
                        className="input"
                        value={paymentForm.payment_method}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                      >
                        <option value="cash">Наличные</option>
                        <option value="card">Карта</option>
                        <option value="transfer">Перевод</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary mt-4 w-full sm:w-auto"
                    disabled={savingPayment}
                    onClick={handleQuickPayment}
                  >
                    {savingPayment ? 'Сохранение...' : 'Оплатить урок'}
                  </button>
                </div>
              )}

              <div>
                <label className="label">Заметки</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Дополнительная информация..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {selectedLesson ? 'Сохранить' : 'Создать'}
                </button>
                {selectedLesson && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
