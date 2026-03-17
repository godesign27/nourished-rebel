import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useAuth } from '../../contexts/AuthContext';
import { AdminModeToggle } from '../shared/AdminModeToggle';
import { UserMenu } from '../shared/UserMenu';
import type { NavigationLink } from '../../types';

const navigationLinks: NavigationLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Programs', path: '/programs' },
  { label: 'The Nourished Life', path: '/resources' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Book a Session', path: '/book-session' },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isScrolled = scrollPosition > 50;
  const isHomePage = location.pathname === '/';

  const shouldBeTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-slow ${
        shouldBeTransparent
          ? 'bg-transparent'
          : 'bg-background-white shadow-md'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className={`text-heading-3 font-bold transition-colors duration-slow ${
              shouldBeTransparent ? 'text-white' : 'text-text-heading'
            }`}
          >
            Nourished Rebel
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-fast hover:text-brand-primary ${
                  shouldBeTransparent
                    ? 'text-white hover:text-text-inverse'
                    : 'text-text-primary'
                } ${location.pathname === link.path ? 'text-brand-primary' : ''}`}
              >
                {link.label}
              </Link>
            ))}

            {!user ? (
              <Link
                to="/login"
                className={`flex items-center gap-2 font-medium transition-colors duration-fast hover:text-brand-primary ${
                  shouldBeTransparent
                    ? 'text-white hover:text-text-inverse'
                    : 'text-text-primary'
                }`}
              >
                <LogIn size={18} />
                Log In
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                {isAdmin && <AdminModeToggle />}
                <UserMenu isTransparent={shouldBeTransparent} />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-fast ${
              shouldBeTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-text-primary hover:bg-background-secondary'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background-white border-t border-background-secondary">
          <div className="px-4 py-6 space-y-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 font-medium transition-colors duration-fast hover:text-brand-primary ${
                  location.pathname === link.path
                    ? 'text-brand-primary'
                    : 'text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 font-medium text-text-primary hover:text-brand-primary transition-colors duration-fast"
              >
                <LogIn size={18} />
                Log In
              </Link>
            ) : (
              <div className="space-y-4 pt-4 border-t border-background-secondary">
                {isAdmin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-secondary">View Mode</span>
                    <AdminModeToggle />
                  </div>
                )}
                <UserMenu />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
