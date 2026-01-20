import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
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
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
      <div className="card w-full max-w-lg shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">TutorAI CRM</h1>
          <p className="text-lg text-gray-700">Создайте свой аккаунт</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6 text-base font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Ваше имя</label>
            <input
              type="text"
              className="input"
              placeholder="Иван Иванов"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Телефон (необязательно)</label>
            <input
              type="tel"
              className="input"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Пароль (минимум 6 символов)</label>
            <input
              type="password"
              className="input"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center gap-3 text-lg mt-6"
            disabled={loading}
          >
            {loading ? (
              <span>Регистрация...</span>
            ) : (
              <>
                <UserPlus className="w-6 h-6" strokeWidth={2.5} />
                <span>Зарегистрироваться</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-base border-t-2 border-gray-200 pt-6">
          <span className="text-gray-700">Уже есть аккаунт? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold underline">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
