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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Дашборд</h1>
        <p className="text-gray-600">Обзор вашей работы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming Lessons */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Ближайшие занятия</h2>
        {stats.upcomingLessons.length > 0 ? (
          <div className="space-y-3">
            {stats.upcomingLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {format(new Date(lesson.datetime_start), 'EEEE, d MMMM', { locale: ru })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(lesson.datetime_start), 'HH:mm')} -{' '}
                    {format(new Date(lesson.datetime_end), 'HH:mm')}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
          <div className="text-center text-gray-500 py-8">
            Нет запланированных занятий
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/students?action=create" className="card hover:shadow-md transition-shadow text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <div className="font-medium">Добавить ученика</div>
        </Link>
        <Link to="/calendar?action=create" className="card hover:shadow-md transition-shadow text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <div className="font-medium">Создать занятие</div>
        </Link>
        <Link to="/homework" className="card hover:shadow-md transition-shadow text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <div className="font-medium">Сгенерировать ДЗ</div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
