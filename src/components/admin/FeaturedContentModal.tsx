import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface FeaturedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeaturedSettings {
  blogPosts: boolean;
  programs: boolean;
  resources: boolean;
}

export default function FeaturedContentModal({ isOpen, onClose }: FeaturedContentModalProps) {
  const [settings, setSettings] = useState<FeaturedSettings>({
    blogPosts: false,
    programs: false,
    resources: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('status', 'published')
        .eq('featured_on_home', true)
        .limit(1)
        .maybeSingle();

      const { data: programData } = await supabase
        .from('programs')
        .select('id')
        .eq('is_active', true)
        .eq('featured_on_home', true)
        .limit(1)
        .maybeSingle();

      const { data: resourceData } = await supabase
        .from('resources')
        .select('id')
        .eq('featured_on_home', true)
        .limit(1)
        .maybeSingle();

      setSettings({
        blogPosts: !!blogData,
        programs: !!programData,
        resources: !!resourceData,
      });
    } catch (error) {
      console.error('Error loading featured content settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (type: keyof FeaturedSettings) => {
    setSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await supabase
        .from('blog_posts')
        .update({ featured_on_home: settings.blogPosts })
        .eq('status', 'published');

      await supabase
        .from('programs')
        .update({ featured_on_home: settings.programs })
        .eq('is_active', true);

      await supabase
        .from('resources')
        .update({ featured_on_home: settings.resources });

      onClose();
    } catch (error) {
      console.error('Error saving featured content settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Featured Content on Home Page</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 mb-6">
                Select which content types should be featured on the home page. When enabled, the 3 latest items from each type will display before the footer. If multiple types are enabled, visitors can switch between them using tabs.
              </p>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.blogPosts}
                    onChange={() => handleToggle('blogPosts')}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div>
                    <p className="font-semibold">Blog Posts</p>
                    <p className="text-sm text-gray-600">Display the 3 latest published blog posts</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.programs}
                    onChange={() => handleToggle('programs')}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div>
                    <p className="font-semibold">Programs</p>
                    <p className="text-sm text-gray-600">Display the 3 latest active programs</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.resources}
                    onChange={() => handleToggle('resources')}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div>
                    <p className="font-semibold">Resources</p>
                    <p className="text-sm text-gray-600">Display the 3 latest resources</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="secondary" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
