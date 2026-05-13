import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from './Badge';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📈', managerOnly: false },
  { to: '/sales',    label: 'Sales',      icon: '🛒', managerOnly: false },
  { to: '/customers',label: 'Customers',  icon: '👥', managerOnly: false },
  { to: '/returns',  label: 'Returns',    icon: '↩️',  managerOnly: false },
  { to: '/reports',  label: 'Reports',    icon: '📊', managerOnly: false },
  { to: '/products', label: 'Products',   icon: '📦', managerOnly: true  },
];

export default function Navbar() {
  const location          = useLocation();
  const { user, logout, isManager } = useAuth();

  return (
    <nav className="bg-white border-b-4 border-primary-700 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏪</span>
        <span className="font-bold text-primary-700 text-lg">SalesERP</span>
      </div>

      {/* Navigation links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          if (link.managerOnly && !isManager) return null;

          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* User info and logout */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {user?.full_name || user?.username}
          </p>
          <Badge
            variant={
              user?.role === 'admin'   ? 'primary'  :
              user?.role === 'manager' ? 'accent' : 'gray'
            }
          >
            {user?.role}
          </Badge>
        </div>

        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}