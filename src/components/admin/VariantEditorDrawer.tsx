import { useState, useEffect } from 'react';
import { Drawer } from '../shared/Drawer';
import { Button } from '../shared/Button';
import TiptapEditor from '../blog/TiptapEditor';
import { supabase } from '../../lib/supabase';
import type { ProgramVariant } from '../../types';

interface VariantEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  variant?: ProgramVariant | null;
  onSave: () => void;
}

export function VariantEditorDrawer({
  isOpen,
  onClose,
  programId,
  variant,
  onSave,
}: VariantEditorDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    detailed_description: '',
    price: '',
    billing_frequency: '',
    session_count: '',
    duration_weeks: '',
    is_featured: false,
    display_order: 0,
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: variant?.name || '',
        description: variant?.description || '',
        detailed_description: variant?.detailed_description || '',
        price: variant?.price?.toString() || '',
        billing_frequency: variant?.billing_frequency || '',
        session_count: variant?.session_count?.toString() || '',
        duration_weeks: variant?.duration_weeks?.toString() || '',
        is_featured: variant?.is_featured ?? false,
        display_order: variant?.display_order || 0,
        is_active: variant?.is_active ?? true,
      });
    }
  }, [isOpen, variant]);

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      const variantData = {
        program_id: programId,
        name: formData.name,
        description: formData.description || null,
        detailed_description: formData.detailed_description || null,
        price: parseFloat(formData.price.toString()),
        billing_frequency: formData.billing_frequency || null,
        session_count: formData.session_count
          ? parseInt(formData.session_count.toString())
          : null,
        duration_weeks: formData.duration_weeks
          ? parseInt(formData.duration_weeks.toString())
          : null,
        is_featured: formData.is_featured,
        display_order: parseInt(formData.display_order.toString()) || 0,
        is_active: formData.is_active,
      };

      if (variant) {
        const { error } = await supabase
          .from('program_variants')
          .update(variantData)
          .eq('id', variant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('program_variants').insert([variantData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Failed to save variant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={variant ? 'Edit Variant' : 'New Variant'}
      size="xl"
    >
      <div className="space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Variant Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="e.g., 6-Week Package"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Short Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Brief overview shown on variant cards"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Detailed Description
          </label>
          <p className="text-xs text-text-secondary mb-2">
            Rich content displayed on the program page when this variant is selected
          </p>
          <div className="[&_.ProseMirror]:min-h-[250px]">
            <TiptapEditor
              content={formData.detailed_description || ''}
              onChange={(content) =>
                setFormData({ ...formData, detailed_description: content })
              }
              placeholder="Describe what's included, outcomes, process details..."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Billing Frequency
            </label>
            <select
              value={formData.billing_frequency}
              onChange={(e) =>
                setFormData({ ...formData, billing_frequency: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Session Count
            </label>
            <input
              type="number"
              value={formData.session_count}
              onChange={(e) => setFormData({ ...formData, session_count: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Duration (weeks)
            </label>
            <input
              type="number"
              value={formData.duration_weeks}
              onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Display Order
          </label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="variant_is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="variant_is_featured" className="ml-2 text-sm text-text-primary">
              Featured variant (recommended)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="variant_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="variant_is_active" className="ml-2 text-sm text-text-primary">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 bg-white shadow-lg flex justify-end gap-4 z-[65]">
        <Button type="button" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving || !formData.name || !formData.price}>
          {isSaving ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
        </Button>
      </div>
    </Drawer>
  );
}
