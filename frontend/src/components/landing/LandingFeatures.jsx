import {
  Users,
  Calendar,
  CreditCard,
  Sparkles,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import { LandingCard } from './LandingCard';

const features = [
  {
    icon: Users,
    title: 'Управление учениками',
    description:
      'Полный CRUD для учеников с информацией о родителях, контактах и изучаемых предметах. Храните всю важную информацию в одном месте.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Calendar,
    title: 'Календарь занятий',
    description:
      'Визуальное планирование расписания с отслеживанием статуса оплаты. Никогда не пропускайте важные занятия.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Учёт платежей',
    description:
      'Отслеживание доходов, детальная статистика и автоматический список должников. Контролируйте финансы легко.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Sparkles,
    title: 'AI-генератор заданий',
    description:
      'Автоматическое создание уникальных учебных задач через OpenAI API. Экономьте часы на подготовку материалов.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: MessageCircle,
    title: 'Telegram интеграция',
    description:
      'Готовые поля для подключения Telegram-бота. Отправляйте уведомления и задания прямо в мессенджер.',
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    icon: BarChart3,
    title: 'Аналитика и отчёты',
    description:
      'Подробная статистика по занятиям, доходам и успеваемости учеников. Принимайте решения на основе данных.',
    color: 'bg-pink-100 text-pink-600',
  },
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Всё необходимое для успешного обучения
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Мощная CRM-система, созданная специально для репетиторов.
            Управляйте бизнесом эффективно с помощью современных технологий.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <LandingCard key={index} className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </LandingCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
