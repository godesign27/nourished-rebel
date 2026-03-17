import { useState, useEffect } from 'react';
import { X, Facebook, Instagram, Twitter, Linkedin, Youtube, Music } from 'lucide-react';
import { Button } from '../shared/Button';
import type { SocialMediaLink, SocialMediaPlatform } from '../../types';
import { createSocialMediaLink, updateSocialMediaLink, deleteSocialMediaLink, getAllSocialMediaLinks } from '../../lib/api';

interface SocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORM_OPTIONS: { value: SocialMediaPlatform; label: string; icon: any }[] = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'tiktok', label: 'TikTok', icon: Music },
];

export default function SocialMediaModal({ isOpen, onClose }: SocialMediaModalProps) {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<SocialMediaLink> | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLinks();
    }
  }, [isOpen]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await getAllSocialMediaLinks();
      setLinks(data);
    } catch (error) {
      console.error('Error loading social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingLink({
      platform: 'facebook',
      url: '',
      display_order: links.length,
      is_active: true,
    });
  };

  const handleEdit = (link: SocialMediaLink) => {
    setEditingLink(link);
  };

  const handleSave = async () => {
    if (!editingLink || !editingLink.url) return;

    try {
      setSaving(true);
      if (editingLink.id) {
        await updateSocialMediaLink(editingLink.id, editingLink);
      } else {
        await createSocialMediaLink(editingLink);
      }
      await loadLinks();
      setEditingLink(null);
    } catch (error) {
      console.error('Error saving social media link:', error);
      alert('Failed to save social media link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social media link?')) return;

    try {
      setSaving(true);
      await deleteSocialMediaLink(id);
      await loadLinks();
    } catch (error) {
      console.error('Error deleting social media link:', error);
      alert('Failed to delete social media link');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (link: SocialMediaLink) => {
    try {
      setSaving(true);
      await updateSocialMediaLink(link.id, { is_active: !link.is_active });
      await loadLinks();
    } catch (error) {
      console.error('Error toggling link status:', error);
      alert('Failed to update link status');
    } finally {
      setSaving(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const option = PLATFORM_OPTIONS.find(opt => opt.value === platform);
    return option?.icon || Facebook;
  };

  const getPlatformLabel = (platform: string) => {
    const option = PLATFORM_OPTIONS.find(opt => opt.value === platform);
    return option?.label || platform;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Social Media Links</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {editingLink ? (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingLink.id ? 'Edit' : 'Add'} Social Media Link
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform
                      </label>
                      <select
                        value={editingLink.platform}
                        onChange={(e) => setEditingLink({ ...editingLink, platform: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        {PLATFORM_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL
                      </label>
                      <input
                        type="url"
                        value={editingLink.url}
                        onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={saving || !editingLink.url}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingLink(null)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <Button onClick={handleAddNew}>
                    Add Social Media Link
                  </Button>
                </div>
              )}

              {links.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-3">Your Social Media Links</h3>
                  {links.map((link) => {
                    const Icon = getPlatformIcon(link.platform);
                    return (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Icon size={24} className="text-gray-600" />
                          <div>
                            <p className="font-medium">{getPlatformLabel(link.platform)}</p>
                            <p className="text-sm text-gray-500 truncate max-w-md">{link.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.is_active}
                              onChange={() => handleToggleActive(link)}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600">Active</span>
                          </label>
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(link)}
                            disabled={saving}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleDelete(link.id)}
                            disabled={saving}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No social media links yet. Add one to get started!
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
