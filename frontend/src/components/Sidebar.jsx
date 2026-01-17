import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/students', icon: Users, label: 'Ученики' },
    { to: '/calendar', icon: Calendar, label: 'Календарь' },
    { to: '/payments', icon: DollarSign, label: 'Платежи' },
    { to: '/homework', icon: FileText, label: 'Домашние задания' },
    { to: '/settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <aside className="w-72 bg-white border-r-2 border-gray-200 shadow-sm">
      <div className="h-20 flex items-center px-6 border-b-2 border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">TutorAI CRM</h1>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border-2 border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm font-medium'
              }`
            }
          >
            <item.icon className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-base">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
