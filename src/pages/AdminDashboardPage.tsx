import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminMode } from '../contexts/AdminModeContext';
import { H1, H2, H3 } from '../components/shared/Heading';
import { Card } from '../components/shared/Card';
import {
  FileText,
  BookOpen,
  Calendar,
  Users,
  Settings,
  Info
} from 'lucide-react';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  useEffect(() => {
    if (!isAdminMode) {
      toggleAdminMode();
    }
  }, [isAdminMode, toggleAdminMode]);

  const adminSections = [
    {
      title: 'About Page',
      description: 'Edit about page content and image',
      icon: Info,
      link: '/admin/about',
      color: 'text-brand-primary',
    },
    {
      title: 'The Nourished Life',
      description: 'Create and manage blog content',
      icon: FileText,
      link: '/admin/blog',
      color: 'text-accent-primary',
    },
    {
      title: 'Programs',
      description: 'Manage coaching programs and offerings',
      icon: BookOpen,
      link: '/admin/programs',
      color: 'text-success-primary',
    },
    {
      title: 'Sessions',
      description: 'View and manage bookings',
      icon: Calendar,
      link: '/admin/sessions',
      color: 'text-warning-primary',
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      link: '/admin/users',
      color: 'text-error-primary',
    },
    {
      title: 'Settings',
      description: 'Site configuration and preferences',
      icon: Settings,
      link: '/admin/settings',
      color: 'text-text-secondary',
    },
  ];

  return (
    <div className="min-h-screen py-8 px-8">
      <div className="mb-12">
        <H1 className="mb-4">Admin Dashboard</H1>
        <p className="text-text-secondary text-lg">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.link} to={section.link}>
              <Card className="h-full bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-background-secondary ${section.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <H3 className="mb-2">{section.title}</H3>
                    <p className="text-text-secondary text-sm">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-brand-primary-light rounded-xl">
        <H2 className="mb-4">Quick Tips</H2>
        <ul className="space-y-2 text-text-secondary">
          <li>• Use the sidebar to navigate between different admin sections</li>
          <li>• Click on any section card to go directly to that management area</li>
          <li>• Your changes are automatically saved to the database</li>
        </ul>
      </div>
    </div>
  );
}
