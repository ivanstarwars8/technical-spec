import { Clock, TrendingUp, Brain, Zap, Monitor, Smartphone } from 'lucide-react';
import { LandingCard } from './LandingCard';

const benefits = [
  {
    icon: Clock,
    value: '15 часов/неделю',
    title: 'Экономия времени',
    description: 'AI создаёт задания за секунды. Забудьте о 30-минутной подготовке каждого упражнения.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    value: '+3-5 учеников',
    title: 'Больше учеников',
    description: 'Освободите время для новых занятий. Автоматизация позволяет принять больше студентов.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Brain,
    value: '0 забытых оплат',
    title: 'Контроль финансов',
    description: 'Автоматические напоминания о платежах. Система сама отслеживает должников.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    value: 'В 360 раз быстрее',
    title: 'Мгновенная генерация',
    description: '5 секунд вместо 30 минут на создание домашнего задания с помощью ChatGPT.',
    color: 'from-orange-500 to-red-500',
  },
];

export const LandingBenefits = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Почему репетиторы выбирают Дош-ло?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Реальные результаты, которые вы получите уже в первую неделю использования
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <LandingCard key={index} className="p-6 text-center hover:shadow-xl transition-all border-2 hover:-translate-y-2">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{benefit.value}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </LandingCard>
            );
          })}
        </div>

        <LandingCard className="p-8 sm:p-10 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                <Monitor className="w-4 h-4" />
                <span className="text-sm font-medium">Работает везде</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Максимальное удобство на любом устройстве
              </h3>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Адаптивный интерфейс для ПК, планшетов и мобильных устройств.
                Работайте откуда удобно — дома за компьютером, в дороге с телефона
                или между занятиями с планшета.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Полная версия на ПК</p>
                    <p className="text-sm text-gray-600">Все функции и возможности</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Мобильное приложение</p>
                    <p className="text-sm text-gray-600">Управление на ходу</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg transform rotate-3">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-32 rounded-lg mb-2"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-2 rounded"></div>
                    <div className="bg-gray-200 h-2 rounded w-3/4"></div>
                  </div>
                  <p className="text-xs text-center mt-3 font-semibold text-gray-600">Мобильный</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-lg transform -rotate-3 mt-8">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-32 rounded-lg mb-2"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-2 rounded"></div>
                    <div className="bg-gray-200 h-2 rounded w-3/4"></div>
                  </div>
                  <p className="text-xs text-center mt-3 font-semibold text-gray-600">Планшет</p>
                </div>
              </div>

              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full">
                <div className="bg-white p-6 rounded-2xl shadow-2xl">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 h-24 rounded-lg mb-3"></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-200 h-2 rounded"></div>
                    <div className="bg-gray-200 h-2 rounded"></div>
                    <div className="bg-gray-200 h-2 rounded"></div>
                  </div>
                  <p className="text-xs text-center mt-3 font-semibold text-gray-600">Десктоп</p>
                </div>
              </div>
            </div>
          </div>
        </LandingCard>
      </div>
    </section>
  );
};
