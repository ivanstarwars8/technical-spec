import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { subscriptionAPI, featuresAPI, homeworkAPI } from '../services/api';
import { User, CreditCard, Sparkles, ShieldCheck, Sun, Moon, Monitor } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [billingReason, setBillingReason] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiReason, setAiReason] = useState('');
  const [aiTestLoading, setAiTestLoading] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);
  const [aiTestError, setAiTestError] = useState('');

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.getCurrent();
      setSubscription(response.data);
      try {
        const featuresRes = await featuresAPI.get();
        setBillingEnabled(Boolean(featuresRes.data?.billing));
        setBillingReason(featuresRes.data?.billing_reason || '');
        setAiEnabled(Boolean(featuresRes.data?.ai_homework));
        setAiReason(featuresRes.data?.ai_homework_reason || '');
      } catch (featureError) {
        console.error('Error loading features:', featureError);
        setBillingEnabled(false);
        setBillingReason('Не удалось проверить доступность оплаты');
        setAiEnabled(false);
        setAiReason('Не удалось проверить доступность AI');
      }
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

  const handleAiTest = async () => {
    setAiTestError('');
    setAiTestResult(null);
    setAiTestLoading(true);
    try {
      const response = await homeworkAPI.testConnection();
      setAiTestResult(response.data);
    } catch (error) {
      setAiTestError(error.response?.data?.detail || error.message);
    } finally {
      setAiTestLoading(false);
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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-600 dark:text-slate-400">Загрузка...</div>
      </div>
    );
  }

  const currentTier = user?.subscription_tier || 'free';
  const savedTheme = localStorage.getItem('theme');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-slate-100">Настройки</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">Управление профилем и подпиской</p>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{user?.name}</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div>
            <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Телефон</div>
            <div className="font-medium text-gray-900 dark:text-slate-100">{user?.phone || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Дата регистрации</div>
            <div className="font-medium text-gray-900 dark:text-slate-100">
              {new Date(user?.created_at).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <Sun className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Оформление</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={setLightTheme}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'light' && savedTheme === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="font-medium text-gray-900 dark:text-slate-100">Светлая</div>
          </button>
          <button
            onClick={setDarkTheme}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'dark' && savedTheme === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
            <div className="font-medium text-gray-900 dark:text-slate-100">Тёмная</div>
          </button>
          <button
            onClick={setSystemTheme}
            className={`p-4 rounded-lg border-2 transition-all ${
              !savedTheme
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500 dark:text-slate-400" />
            <div className="font-medium text-gray-900 dark:text-slate-100">Системная</div>
          </button>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Текущий тариф</h2>
        </div>

        {!billingEnabled && (
          <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-3 text-sm text-amber-700 dark:text-amber-400">
            {billingReason || 'Оплата временно отключена. Добавьте ключи ЮKassa в .env и перезапустите backend.'}
          </div>
        )}

        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                {tierInfo[currentTier].name}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Осталось AI кредитов: <span className="font-bold text-gray-900 dark:text-slate-100">{user?.ai_credits_left}</span>
              </div>
            </div>
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
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
                className={`border rounded-lg p-4 sm:p-6 ${
                  isCurrent 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600' 
                    : 'border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-slate-100">{info.name}</h3>
                  {info.price ? (
                    <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {info.price} ₽<span className="text-sm text-gray-600 dark:text-slate-400">/мес</span>
                    </div>
                  ) : (
                    <div className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-slate-400">Бесплатно</div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button className="btn btn-secondary w-full" disabled>
                    Текущий тариф
                  </button>
                ) : !billingEnabled && tier !== 'free' ? (
                  <button className="btn btn-secondary w-full" disabled>
                    Оплата отключена
                  </button>
                ) : isDowngrade ? (
                  <button className="btn btn-secondary w-full" disabled>
                    Недоступно
                  </button>
                ) : tier !== 'free' ? (
                  <button
                    onClick={() => handleUpgrade(tier)}
                    className="btn btn-primary w-full"
                  >
                    Перейти
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Connection Test */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Проверка GPT</h2>
        </div>

        {!aiEnabled && (
          <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-3 text-sm text-amber-700 dark:text-amber-400">
            {aiReason || 'AI недоступен. Проверьте OPENAI_API_KEY и прокси.'}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={handleAiTest}
            className="btn btn-primary w-full sm:w-auto"
            disabled={!aiEnabled || aiTestLoading}
          >
            {aiTestLoading ? 'Проверка...' : 'Проверить подключение'}
          </button>
          {aiTestResult && (
            <div className="text-sm text-green-700 dark:text-green-400">
              OK · {aiTestResult.model} · {aiTestResult.latency_ms} ms · прокси: {aiTestResult.proxy_enabled ? 'включён' : 'нет'}
            </div>
          )}
          {aiTestError && (
            <div className="text-sm text-red-700 dark:text-red-400">
              {aiTestError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
