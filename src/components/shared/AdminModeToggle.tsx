import { Settings, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminMode } from '../../contexts/AdminModeContext';
import { useAuth } from '../../contexts/AuthContext';

export function AdminModeToggle() {
  const { isAdmin } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) return null;

  const handleAdminClick = () => {
    if (!isAdminMode) {
      toggleAdminMode();
    }
    navigate('/admin/dashboard');
  };

  const handlePublicClick = () => {
    if (isAdminMode) {
      toggleAdminMode();
    }
    if (location.pathname.startsWith('/admin')) {
      navigate('/');
    }
  };

  const isOnAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex items-center gap-0 bg-background-secondary rounded-full p-1">
      <button
        onClick={handleAdminClick}
        className={`p-2 rounded-full transition-all duration-200 ${
          isOnAdminPage
            ? 'bg-brand-primary text-white shadow-sm'
            : 'hover:bg-background-primary text-text-secondary'
        }`}
        aria-label="Admin Dashboard"
        title="Admin Dashboard"
      >
        <Settings className="w-5 h-5" />
      </button>
      <button
        onClick={handlePublicClick}
        className={`p-2 rounded-full transition-all duration-200 ${
          !isOnAdminPage
            ? 'bg-brand-primary text-white shadow-sm'
            : 'hover:bg-background-primary text-text-secondary'
        }`}
        aria-label="Public View"
        title="Public View"
      >
        <Eye className="w-5 h-5" />
      </button>
    </div>
  );
}
