import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentsAPI, lessonsAPI, paymentsAPI } from '../services/api';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Users, Calendar, DollarSign, FileText, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    upcomingLessons: [],
    monthlyIncome: 0,
    debtorsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [studentsRes, lessonsRes, statsRes, debtorsRes] = await Promise.all([
        studentsAPI.getAll(),
        lessonsAPI.getAll({
          start_date: format(new Date(), 'yyyy-MM-dd'),
          end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        }),
        paymentsAPI.getStats(),
        paymentsAPI.getDebtors(),
      ]);

      setStats({
        studentsCount: studentsRes.data.length,
        upcomingLessons: lessonsRes.data.slice(0, 5),
        monthlyIncome: parseFloat(statsRes.data.total_amount),
        debtorsCount: debtorsRes.data.length,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const statCards = [
    {
      icon: Users,
      label: 'Учеников',
      value: stats.studentsCount,
      color: 'bg-blue-500',
      link: '/students',
    },
    {
      icon: Calendar,
      label: 'Занятий на неделе',
      value: stats.upcomingLessons.length,
      color: 'bg-green-500',
      link: '/calendar',
    },
    {
      icon: DollarSign,
      label: 'Доход за месяц',
      value: `${stats.monthlyIncome.toFixed(0)} ₽`,
      color: 'bg-purple-500',
      link: '/payments',
    },
    {
      icon: AlertCircle,
      label: 'Должников',
      value: stats.debtorsCount,
      color: 'bg-red-500',
      link: '/payments',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-3 text-gray-900">Главная страница</h1>
        <p className="text-lg text-gray-600">Обзор вашей работы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link} className="card hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-5">
              <div className={`${stat.color} p-4 rounded-xl shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-base text-gray-600 font-medium mt-1">{stat.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming Lessons */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Ближайшие занятия</h2>
        {stats.upcomingLessons.length > 0 ? (
          <div className="space-y-4">
            {stats.upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="font-bold text-lg text-gray-900">
                    {format(new Date(lesson.datetime_start), 'EEEE, d MMMM', { locale: ru })}
                  </div>
                  <div className="text-base text-gray-600 mt-1 font-medium">
                    {format(new Date(lesson.datetime_start), 'HH:mm')} -{' '}
                    {format(new Date(lesson.datetime_end), 'HH:mm')}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      lesson.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                        : 'bg-red-100 text-red-700 border-2 border-red-200'
                    }`}
                  >
                    {lesson.payment_status === 'paid' ? 'Оплачено' : 'Не оплачено'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12 text-lg">
            Нет запланированных занятий на эту неделю
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/students?action=create" className="card hover:shadow-xl transition-all hover:scale-105 text-center cursor-pointer border-2 border-transparent hover:border-blue-300">
            <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" strokeWidth={2.5} />
            <div className="font-bold text-lg text-gray-900">Добавить ученика</div>
            <p className="text-sm text-gray-600 mt-2">Создать карточку нового ученика</p>
          </Link>
          <Link to="/calendar?action=create" className="card hover:shadow-xl transition-all hover:scale-105 text-center cursor-pointer border-2 border-transparent hover:border-green-300">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-green-600" strokeWidth={2.5} />
            <div className="font-bold text-lg text-gray-900">Создать занятие</div>
            <p className="text-sm text-gray-600 mt-2">Запланировать новое занятие</p>
          </Link>
          <Link to="/homework" className="card hover:shadow-xl transition-all hover:scale-105 text-center cursor-pointer border-2 border-transparent hover:border-purple-300">
            <FileText className="w-12 h-12 mx-auto mb-4 text-purple-600" strokeWidth={2.5} />
            <div className="font-bold text-lg text-gray-900">Сгенерировать ДЗ</div>
            <p className="text-sm text-gray-600 mt-2">Создать задания через AI</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
