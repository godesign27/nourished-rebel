import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserMenuProps {
  isTransparent?: boolean;
}

export function UserMenu({ isTransparent = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const userEmail = user.email || '';
  const displayName = userEmail.split('@')[0];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-fast ${
          isTransparent
            ? 'hover:bg-white/10'
            : 'hover:bg-background-secondary'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <span className={`font-medium hidden md:block ${
          isTransparent ? 'text-white' : 'text-text-primary'
        }`}>
          {displayName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-background-secondary py-2">
          <div className="px-4 py-3 border-b border-background-secondary">
            <p className="text-sm font-medium text-text-primary truncate">
              {userEmail}
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-background-secondary transition-colors"
            >
              <LayoutDashboard size={18} />
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-primary hover:bg-error-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
