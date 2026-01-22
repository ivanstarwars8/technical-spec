import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { UserPlus, Sun, Moon } from 'lucide-react';

const getRegisterErrorMessage = (err) => {
  // Network / CORS / wrong API URL (no response object)
  if (!err?.response) {
    return 'Не удалось соединиться с сервером. Проверьте адрес API/интернет и попробуйте ещё раз.';
  }

  const data = err.response?.data;
  const detail = data?.detail;

  // FastAPI validation errors often come as a list of objects: [{loc, msg, type}, ...]
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => d?.msg)
      .filter(Boolean);
    return msgs.length ? msgs.join(', ') : 'Проверьте корректность заполнения полей.';
  }

  if (typeof detail === 'string' && detail.trim()) {
    // Friendly RU mapping for common backend messages
    const normalized = detail.trim();
    if (normalized === 'Email already registered') return 'Этот email уже зарегистрирован.';
    return normalized;
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  return 'Ошибка регистрации';
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      alert('Регистрация успешна! Теперь войдите в свой аккаунт.');
      navigate('/login');
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 p-4 theme-transition">
      {/* Кнопка переключения темы */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Переключить тему"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="card w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">Дош-ло</h1>
          <p className="text-gray-600 dark:text-slate-400">Создайте аккаунт</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Имя</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Телефон</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (xxx) xxx-xx-xx"
            />
          </div>

          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? 'Регистрация...' : (
              <>
                <UserPlus className="w-5 h-5" />
                Зарегистрироваться
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-slate-400">Уже есть аккаунт? </span>
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
