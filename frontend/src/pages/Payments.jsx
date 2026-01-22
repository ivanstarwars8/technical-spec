import { useState, useEffect } from 'react';
import { paymentsAPI, studentsAPI, lessonsAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DollarSign, TrendingUp, AlertCircle, Plus, X } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total_amount: 0 });
  const [debtors, setDebtors] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBulk, setIsBulk] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  const [formData, setFormData] = useState({
    student_id: '',
    lesson_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const getLessonRemaining = (lesson) => {
    const remaining = lesson.remaining_amount ?? lesson.amount ?? 0;
    const parsed = Number(remaining);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const selectedLessons = lessons.filter((lesson) => selectedLessonIds.includes(lesson.id));
  const selectedRemainingTotal = selectedLessons.reduce((sum, lesson) => sum + getLessonRemaining(lesson), 0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, statsRes, debtorsRes, studentsRes] = await Promise.all([
        paymentsAPI.getAll(),
        paymentsAPI.getStats(),
        paymentsAPI.getDebtors(),
        studentsAPI.getAll(),
      ]);

      setPayments(paymentsRes.data);
      setStats(statsRes.data);
      setDebtors(debtorsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonsForStudent = async (studentId) => {
    if (!studentId) {
      setLessons([]);
      return;
    }
    setLoadingLessons(true);
    try {
      const lessonsRes = await lessonsAPI.getAll({ student_id: studentId });
      // Only lessons with remaining amount
      const filtered = lessonsRes.data.filter((lesson) => lesson.remaining_amount === null || Number(lesson.remaining_amount) > 0);
      setLessons(filtered);
    } catch (error) {
      console.error('Error loading lessons:', error);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isBulk) {
        if (!selectedLessonIds.length) {
          alert('Выберите хотя бы один урок для массовой оплаты');
          return;
        }
        await paymentsAPI.bulkCreate({
          student_id: formData.student_id,
          lesson_ids: selectedLessonIds,
          amount: formData.amount,
          payment_method: formData.payment_method,
          payment_date: formData.payment_date,
        });
      } else {
        await paymentsAPI.create(formData);
      }
      setShowModal(false);
      setFormData({
        student_id: '',
        lesson_id: '',
        amount: '',
        payment_method: 'cash',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
      });
      setSelectedLessonIds([]);
      setIsBulk(false);
      loadData();
    } catch (error) {
      alert('Ошибка создания платежа: ' + (error.response?.data?.detail || error.message));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-slate-100">Платежи</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">Учёт доходов и должников</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          <span>Добавить платёж</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-green-500 p-2.5 sm:p-3 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{parseFloat(stats.total_amount).toFixed(0)} ₽</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Доход за месяц</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-blue-500 p-2.5 sm:p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{payments.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Платежей всего</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-red-500 p-2.5 sm:p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{debtors.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Должников</div>
            </div>
          </div>
        </div>
      </div>

      {/* Debtors */}
      {debtors.length > 0 && (
        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-slate-100">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Должники
          </h2>
          <div className="space-y-2">
            {debtors.map((debtor) => (
              <div
                key={debtor.student_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg gap-2"
              >
                <div>
                  <div className="font-semibold text-gray-900 dark:text-slate-100">{debtor.student_name}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    Неоплаченных занятий: {debtor.unpaid_lessons_count}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                    {parseFloat(debtor.total_debt).toFixed(2)} ₽
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments History */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">История платежей</h2>
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => {
              const student = students.find((s) => s.id === payment.student_id);
              return (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg gap-2"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-slate-100">{student?.name || 'Ученик'}</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      {format(new Date(payment.payment_date), 'd MMMM yyyy', { locale: ru })} •{' '}
                      {payment.payment_method === 'cash' ? 'Наличные' :
                       payment.payment_method === 'card' ? 'Карта' : 'Перевод'}
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                    +{parseFloat(payment.amount).toFixed(2)} ₽
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-slate-500 py-12">
            Нет платежей
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Новый платёж</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="bulk-payment"
                  type="checkbox"
                  checked={isBulk}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setIsBulk(enabled);
                    setSelectedLessonIds([]);
                    setFormData({ ...formData, lesson_id: '' });
                  }}
                  className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                />
                <label htmlFor="bulk-payment" className="text-sm text-gray-700 dark:text-slate-300">
                  Массовая оплата нескольких уроков
                </label>
              </div>

              <div>
                <label className="label">Ученик *</label>
                <select
                  className="input"
                  value={formData.student_id}
                  onChange={(e) => {
                    const studentId = e.target.value;
                    setFormData({ ...formData, student_id: studentId, lesson_id: '' });
                    setSelectedLessonIds([]);
                    loadLessonsForStudent(studentId);
                  }}
                  required
                >
                  <option value="">Выберите ученика</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {!isBulk && (
                <div>
                  <label className="label">Урок *</label>
                  <select
                    className="input"
                    value={formData.lesson_id}
                    onChange={(e) => {
                      const lessonId = e.target.value;
                      const lesson = lessons.find((item) => item.id === lessonId);
                      const remaining = lesson?.remaining_amount ?? lesson?.amount ?? '';
                      setFormData({ ...formData, lesson_id: lessonId, amount: remaining ? String(remaining) : formData.amount });
                    }}
                    required
                    disabled={!formData.student_id || loadingLessons}
                  >
                    <option value="">
                      {loadingLessons ? 'Загрузка...' : 'Выберите урок'}
                    </option>
                    {lessons.map((lesson) => {
                      const remaining = lesson.remaining_amount ?? lesson.amount;
                      const amountText = remaining !== null && remaining !== undefined
                        ? `${parseFloat(remaining).toFixed(2)} ₽`
                        : '—';
                      return (
                        <option key={lesson.id} value={lesson.id}>
                          {format(new Date(lesson.datetime_start), 'd MMMM yyyy, HH:mm', { locale: ru })} • Остаток {amountText}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {isBulk && (
                <div>
                  <label className="label">Уроки *</label>
                  <div className="space-y-2 max-h-56 overflow-auto border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                    {loadingLessons && (
                      <div className="text-sm text-gray-500 dark:text-slate-500">Загрузка...</div>
                    )}
                    {!loadingLessons && lessons.length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-slate-500">Нет уроков для оплаты</div>
                    )}
                    {!loadingLessons && lessons.map((lesson) => {
                      const remaining = getLessonRemaining(lesson);
                      return (
                        <label key={lesson.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={selectedLessonIds.includes(lesson.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedLessonIds((prev) => {
                                if (checked) {
                                  return [...prev, lesson.id];
                                }
                                return prev.filter((id) => id !== lesson.id);
                              });
                            }}
                            disabled={!formData.student_id}
                            className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                          />
                          <span>
                            {format(new Date(lesson.datetime_start), 'd MMMM yyyy, HH:mm', { locale: ru })} • Остаток {remaining.toFixed(2)} ₽
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    Остаток по выбранным: {selectedRemainingTotal.toFixed(2)} ₽
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary mt-2 w-full sm:w-auto"
                    disabled={selectedLessonIds.length === 0}
                    onClick={() => setFormData({ ...formData, amount: selectedRemainingTotal ? String(selectedRemainingTotal) : '' })}
                  >
                    Заполнить на весь остаток
                  </button>
                </div>
              )}

              <div>
                <label className="label">Сумма (₽) *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="1000"
                  required
                />
              </div>

              <div>
                <label className="label">Способ оплаты *</label>
                <select
                  className="input"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                </select>
              </div>

              <div>
                <label className="label">Дата платежа *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button type="submit" className="btn btn-primary flex-1 order-1">
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1 order-2"
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

export default Payments;
