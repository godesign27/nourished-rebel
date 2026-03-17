import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H1 } from '../../components/shared/Heading';
import { Card } from '../../components/shared/Card';
import { Settings, Palette, Mail, Globe, Share2, Star } from 'lucide-react';
import SocialMediaModal from '../../components/admin/SocialMediaModal';
import FeaturedContentModal from '../../components/admin/FeaturedContentModal';

export function SettingsPage() {
  const navigate = useNavigate();
  const [socialMediaModalOpen, setSocialMediaModalOpen] = useState(false);
  const [featuredContentModalOpen, setFeaturedContentModalOpen] = useState(false);

  const settingsSections = [
    {
      title: 'Site Settings',
      description: 'General site configuration and branding',
      icon: Settings,
      path: null,
      action: null,
    },
    {
      title: 'Theme & Design',
      description: 'Customize colors, fonts, and layout',
      icon: Palette,
      path: '/admin/settings/theme',
      action: null,
    },
    {
      title: 'Social Media',
      description: 'Manage social media links displayed in the footer',
      icon: Share2,
      path: null,
      action: () => setSocialMediaModalOpen(true),
    },
    {
      title: 'Featured Content',
      description: 'Toggle which content types appear on the home page',
      icon: Star,
      path: null,
      action: () => setFeaturedContentModalOpen(true),
    },
    {
      title: 'Email Settings',
      description: 'Configure email notifications and templates',
      icon: Mail,
      path: null,
      action: null,
    },
    {
      title: 'SEO & Meta',
      description: 'Search engine optimization settings',
      icon: Globe,
      path: null,
      action: null,
    },
  ];

  const handleCardClick = (path: string | null, action: (() => void) | null) => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <div className="min-h-screen py-8 px-8">
        <div className="mb-8">
          <H1 className="mb-2">Settings</H1>
          <p className="text-text-secondary">Site configuration and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isClickable = section.path || section.action;
            return (
              <Card
                key={section.title}
                className={`bg-white ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'} transition-shadow duration-200`}
                onClick={() => handleCardClick(section.path, section.action)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-background-secondary text-brand-primary">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-2">
                      {section.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SocialMediaModal
        isOpen={socialMediaModalOpen}
        onClose={() => setSocialMediaModalOpen(false)}
      />

      <FeaturedContentModal
        isOpen={featuredContentModalOpen}
        onClose={() => setFeaturedContentModalOpen(false)}
      />
    </>
  );
}
