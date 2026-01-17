import { useState, useEffect } from 'react';
import { paymentsAPI, studentsAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total_amount: 0 });
  const [debtors, setDebtors] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_method: 'cash',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentsAPI.create(formData);
      setShowModal(false);
      setFormData({
        student_id: '',
        amount: '',
        payment_method: 'cash',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
      });
      loadData();
    } catch (error) {
      alert('Ошибка создания платежа: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Платежи</h1>
          <p className="text-gray-600">Учёт доходов и должников</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить платёж
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{parseFloat(stats.total_amount).toFixed(0)} ₽</div>
              <div className="text-sm text-gray-600">Доход за месяц</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{payments.length}</div>
              <div className="text-sm text-gray-600">Платежей всего</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{debtors.length}</div>
              <div className="text-sm text-gray-600">Должников</div>
            </div>
          </div>
        </div>
      </div>

      {/* Debtors */}
      {debtors.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Должники
          </h2>
          <div className="space-y-2">
            {debtors.map((debtor) => (
              <div
                key={debtor.student_id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div>
                  <div className="font-semibold">{debtor.student_name}</div>
                  <div className="text-sm text-gray-600">
                    Неоплаченных занятий: {debtor.unpaid_lessons_count}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600">
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
        <h2 className="text-xl font-bold mb-4">История платежей</h2>
        {payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => {
              const student = students.find((s) => s.id === payment.student_id);
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{student?.name || 'Ученик'}</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(payment.payment_date), 'd MMMM yyyy', { locale: ru })} •{' '}
                      {payment.payment_method === 'cash' ? 'Наличные' :
                       payment.payment_method === 'card' ? 'Карта' : 'Перевод'}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    +{parseFloat(payment.amount).toFixed(2)} ₽
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            Нет платежей
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">Новый платёж</h2>
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
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
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
