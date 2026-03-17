import { useState, useEffect } from 'react';
import { H1, H2 } from '../../components/shared/Heading';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import TiptapEditor from '../../components/blog/TiptapEditor';
import ImageUpload from '../../components/blog/ImageUpload';
import { supabase } from '../../lib/supabase';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import type { CoverImage } from '../../types';

interface AboutPageContent {
  id: string;
  image_url: string;
  content: string;
  updated_at: string;
}

export default function AboutPageManagementPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [heroImage, setHeroImage] = useState<CoverImage | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('about_page_content')
        .select('*')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setContent(data);
        setHeroImage(data.image_url ? { url: data.image_url, alt_text: 'About page hero' } : null);
        setEditorContent(data.content);
      }
    } catch (err: any) {
      console.error('Error fetching about page content:', err);
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const payload = {
        image_url: heroImage?.url || '',
        content: editorContent,
        updated_at: new Date().toISOString(),
      };

      if (content?.id) {
        const { error: updateError } = await supabase
          .from('about_page_content')
          .update(payload)
          .eq('id', content.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('about_page_content')
          .insert([payload]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchContent();
    } catch (err: any) {
      console.error('Error saving about page content:', err);
      setError(err.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <H1 className="mb-2">About Page Management</H1>
          <p className="text-text-secondary">
            Edit the content and image that appears on your About page
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-light border border-error-primary rounded-lg flex items-center gap-3">
            <AlertCircle className="text-error-primary flex-shrink-0" size={20} />
            <p className="text-error-primary">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-success-light border border-success-primary rounded-lg flex items-center gap-3">
            <CheckCircle className="text-success-primary flex-shrink-0" size={20} />
            <p className="text-success-primary">Changes saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="p-6">
            <H2 className="mb-4">Hero Image</H2>
            <ImageUpload
              value={heroImage}
              onChange={setHeroImage}
              label="Upload Hero Image"
            />
          </Card>

          <Card className="p-6">
            <H2 className="mb-4">About Content</H2>
            <TiptapEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Write your about page content here..."
            />
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {content?.updated_at && (
          <p className="mt-6 text-sm text-text-secondary text-right">
            Last updated: {new Date(content.updated_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
