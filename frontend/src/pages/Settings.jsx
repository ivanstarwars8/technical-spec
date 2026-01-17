import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscriptionAPI } from '../services/api';
import { User, CreditCard, Sparkles } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.getCurrent();
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier) => {
    try {
      const response = await subscriptionAPI.upgrade(tier);
      window.location.href = response.data.confirmation_url;
    } catch (error) {
      alert('Ошибка оплаты: ' + (error.response?.data?.detail || error.message));
    }
  };

  const tierInfo = {
    free: {
      name: 'Бесплатный',
      credits: 10,
      features: ['10 AI кредитов', 'До 5 учеников', 'Базовые функции'],
    },
    basic: {
      name: 'Базовый',
      credits: 100,
      price: subscription?.prices?.basic || 990,
      features: ['100 AI кредитов', 'До 20 учеников', 'Все функции', 'Приоритетная поддержка'],
    },
    premium: {
      name: 'Премиум',
      credits: 1000,
      price: subscription?.prices?.premium || 1990,
      features: ['1000 AI кредитов', 'Неограниченно учеников', 'Все функции', 'VIP поддержка', 'Ранний доступ к новым функциям'],
    },
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const currentTier = user?.subscription_tier || 'free';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Настройки</h1>
        <p className="text-gray-600">Управление профилем и подпиской</p>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-gray-600 mb-1">Телефон</div>
            <div className="font-medium">{user?.phone || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Дата регистрации</div>
            <div className="font-medium">
              {new Date(user?.created_at).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <CreditCard className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold">Текущий тариф</h2>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {tierInfo[currentTier].name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Осталось AI кредитов: <span className="font-bold">{user?.ai_credits_left}</span>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tierInfo).map(([tier, info]) => {
            const isCurrent = tier === currentTier;
            const isDowngrade = ['basic', 'premium'].indexOf(tier) < ['basic', 'premium'].indexOf(currentTier);

            return (
              <div
                key={tier}
                className={`border rounded-lg p-6 ${
                  isCurrent ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{info.name}</h3>
                  {info.price ? (
                    <div className="text-3xl font-bold text-primary-600">
                      {info.price} ₽<span className="text-sm text-gray-600">/мес</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-gray-600">Бесплатно</div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button className="btn btn-secondary w-full" disabled>
                    Текущий тариф
                  </button>
                ) : isDowngrade ? (
                  <button className="btn btn-secondary w-full" disabled>
                    Недоступно
                  </button>
                ) : tier !== 'free' ? (
                  subscription?.payment_enabled ? (
                    <button
                      onClick={() => handleUpgrade(tier)}
                      className="btn btn-primary w-full"
                    >
                      Перейти
                    </button>
                  ) : (
                    <button className="btn btn-secondary w-full" disabled>
                      Скоро доступно
                    </button>
                  )
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
