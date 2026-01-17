import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="card w-full max-w-lg shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">TutorAI CRM</h1>
          <p className="text-lg text-gray-700">Войдите в свой аккаунт</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6 text-base font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              className="input"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center gap-3 text-lg"
            disabled={loading}
          >
            {loading ? (
              <span>Вход...</span>
            ) : (
              <>
                <LogIn className="w-6 h-6" strokeWidth={2.5} />
                <span>Войти</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-base border-t-2 border-gray-200 pt-6">
          <span className="text-gray-700">Нет аккаунта? </span>
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold underline">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
