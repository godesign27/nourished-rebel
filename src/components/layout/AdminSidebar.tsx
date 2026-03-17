import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminModeToggle } from '../shared/AdminModeToggle';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  Users,
  Settings,
  Info,
  LogOut,
  ShoppingBag
} from 'lucide-react';

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { title: 'About Page', icon: Info, path: '/admin/about' },
  { title: 'The Nourished Life', icon: FileText, path: '/admin/blog' },
  { title: 'Programs', icon: BookOpen, path: '/admin/programs' },
  { title: 'Subscribers', icon: ShoppingBag, path: '/admin/subscribers' },
  { title: 'Sessions', icon: Calendar, path: '/admin/sessions' },
  { title: 'Users', icon: Users, path: '/admin/users' },
  { title: 'Settings', icon: Settings, path: '/admin/settings' },
];

export function AdminSidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Admin Profile Section */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-lg">
            {user?.email?.[0].toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary text-sm truncate">
              Admin
            </h3>
            <p className="text-xs text-text-secondary truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <AdminModeToggle />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-primary text-white font-semibold'
                        : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-text-secondary hover:bg-error-light hover:text-error-primary transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
