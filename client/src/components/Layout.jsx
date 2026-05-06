import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-medium">Task Manager</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.username}</p>
          <span className="text-xs text-gray-300">{user.role}</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/projects" label="Projects" />
          {user.role === 'ADMIN' && (
            <NavItem to="/register" label="Add user" />
          )}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block text-sm px-2 py-1.5 rounded transition-colors ${
          isActive
            ? 'bg-gray-100 text-gray-900 font-medium'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`
      }
    >
      {label}
    </NavLink>
  );
}