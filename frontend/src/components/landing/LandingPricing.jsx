import { Link } from 'react-router-dom';
import { Check, Sparkles, Info } from 'lucide-react';
import { LandingCard } from './LandingCard';
import { landingButtonClasses } from './LandingButton';

const plans = [
  {
    name: 'Бесплатный',
    priceRub: null,
    credits: '10 AI кредитов/мес',
    students: 'До 5 учеников',
    features: ['Базовые функции', 'Управление учениками', 'Календарь занятий', 'Учёт платежей'],
    buttonText: 'Начать бесплатно',
    buttonVariant: 'outline',
    popular: false,
  },
  {
    name: 'Базовый',
    priceRub: 990,
    credits: '100 AI кредитов/мес',
    students: 'До 20 учеников',
    features: [
      'Все функции',
      'Неограниченный календарь',
      'Подробная статистика',
      'Telegram интеграция',
      'Приоритетная поддержка',
    ],
    buttonText: 'Выбрать план',
    buttonVariant: 'default',
    popular: true,
  },
  {
    name: 'Премиум',
    priceRub: 1990,
    credits: '1000 AI кредитов/мес',
    students: 'Неограниченно учеников',
    features: [
      'Все функции',
      'VIP поддержка',
      'Ранний доступ к новым функциям',
      'Персональный менеджер',
      'Приоритет в AI-генерации',
    ],
    buttonText: 'Выбрать план',
    buttonVariant: 'default',
    popular: false,
  },
];

export const LandingPricing = () => {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Выберите подходящий тариф</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Начните бесплатно и масштабируйте по мере роста вашего бизнеса
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <LandingCard
              key={index}
              className={`relative p-8 ${
                plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Популярный
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.priceRub ? `${plan.priceRub} ₽` : 'Бесплатно'}
                  </span>
                  {plan.priceRub && <span className="text-gray-600">/мес</span>}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>{plan.credits}</span>
                  </div>
                  <p className="text-gray-600">{plan.students}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className={landingButtonClasses({
                  variant: plan.buttonVariant,
                  size: 'lg',
                  className: `w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' : ''}`,
                })}
              >
                {plan.buttonText}
              </Link>
            </LandingCard>
          ))}
        </div>

        <div className="text-center text-sm text-gray-600 max-w-3xl mx-auto mb-12">
          Важно: Дош-ло не принимает оплату между репетитором и учеником.
          Оплата взимается только за использование CRM, если выбран платный тариф.
        </div>

        <LandingCard className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Как работают AI кредиты?</h3>
                <p className="text-gray-600 mb-4">
                  AI кредиты используются только для генерации домашних заданий через ChatGPT
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Расчёт кредитов</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>
                      <strong>1 задание (до 5 задач)</strong> = 1 AI кредит
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>
                      <strong>От 5 задач в задании</strong> = 2+ AI кредита
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Расчёт виден при составлении задания</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Выбор версии GPT влияет на количество кредитов</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Дополнительные кредиты</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Закончились кредиты? Докупите дополнительные по выгодной цене
                  </p>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-1">Цена зависит от выбранной модели GPT</p>
                    <p className="text-2xl font-bold text-gray-900">
                      От 50 ₽ <span className="text-base font-normal text-gray-600">за 1 AI кредит</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    * Более мощные модели GPT требуют больше кредитов
                  </p>
                </div>
              </div>
            </div>
          </div>
        </LandingCard>
      </div>
    </section>
  );
};
