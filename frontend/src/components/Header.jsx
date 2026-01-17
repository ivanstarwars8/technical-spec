import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white border-b-2 border-gray-200 px-8 flex items-center justify-between shadow-sm">
      <div className="flex-1"></div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-base bg-gray-50 px-4 py-2 rounded-lg">
          <User className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
          <span className="font-semibold text-gray-900">{user?.name}</span>
          <span className="text-gray-400">•</span>
          <span className="text-blue-600 font-bold">
            {user?.ai_credits_left} кредитов
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium border-2 border-transparent hover:border-red-200"
          title="Выйти"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
          <span>Выйти</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
