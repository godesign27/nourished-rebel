import { useState, useEffect } from 'react';
import { Button } from '../../components/shared/Button';
import { Drawer } from '../../components/shared/Drawer';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Program, ProgramVariant } from '../../types';
import ImageUpload from '../../components/blog/ImageUpload';
import TiptapEditor from '../../components/blog/TiptapEditor';

export function ProgramManagementPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
      loadPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const toggleActive = async (program: Program) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({ is_active: !program.is_active })
        .eq('id', program.id);

      if (error) throw error;
      loadPrograms();
    } catch (error) {
      console.error('Error toggling program status:', error);
    }
  };

  const openDrawer = (program?: Program) => {
    setEditingProgram(program || null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProgram(null);
  };

  return (
    <div className="min-h-screen py-8 px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 font-bold text-text-heading mb-2">Programs</h1>
          <p className="text-text-secondary">Manage coaching programs and offerings</p>
        </div>
        <Button onClick={() => openDrawer()}>
          <Plus size={20} className="mr-2" />
          New Program
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <p className="text-text-secondary text-center">Loading programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <p className="text-text-secondary text-center">
            No programs yet. Click "New Program" to create your first coaching program.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-lg border border-gray-200 p-6 flex items-start gap-6"
            >
              {program.image_url && (
                <img
                  src={program.image_url}
                  alt={program.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-heading-3 font-semibold text-text-heading">
                      {program.name}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {program.category} • {program.duration}
                      {program.price && ` • $${program.price}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(program)}
                      className={`p-2 rounded-lg transition-colors ${
                        program.is_active
                          ? 'bg-success-100 text-success-700 hover:bg-success-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={program.is_active ? 'Active' : 'Inactive'}
                    >
                      {program.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    <button
                      onClick={() => openDrawer(program)}
                      className="p-2 rounded-lg bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="p-2 rounded-lg bg-error-100 text-error-700 hover:bg-error-200 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-text-primary mb-2">{program.summary}</p>
                {program.ideal_participant && (
                  <p className="text-sm text-text-secondary italic">
                    Ideal for: {program.ideal_participant}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingProgram ? 'Edit Program' : 'New Program'}
        size="xl"
      >
        <ProgramForm program={editingProgram} onClose={closeDrawer} onSave={loadPrograms} />
      </Drawer>
    </div>
  );
}

interface ProgramFormProps {
  program: Program | null;
  onClose: () => void;
  onSave: () => void;
}

function ProgramForm({ program, onClose, onSave }: ProgramFormProps) {
  const [formData, setFormData] = useState({
    name: program?.name || '',
    category: program?.category || '',
    summary: program?.summary || '',
    description: program?.description || '',
    ideal_participant: program?.ideal_participant || '',
    duration: program?.duration || '',
    price: program?.price || '',
    cta_label: program?.cta_label || 'Learn More',
    image_url: program?.image_url || '',
    display_order: program?.display_order || 0,
    is_active: program?.is_active ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [variants, setVariants] = useState<ProgramVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  useEffect(() => {
    if (program?.id) {
      loadVariants();
    }
  }, [program?.id]);

  const loadVariants = async () => {
    if (!program?.id) return;
    setIsLoadingVariants(true);
    try {
      const { data, error } = await supabase
        .from('program_variants')
        .select('*')
        .eq('program_id', program.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const programData = {
        ...formData,
        slug,
        price: formData.price ? parseFloat(formData.price.toString()) : null,
        display_order: parseInt(formData.display_order.toString()) || 0,
      };

      if (program) {
        const { error } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', program.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('programs').insert([programData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase.from('program_variants').delete().eq('id', id);
      if (error) throw error;
      loadVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const coverImage = formData.image_url
    ? { url: formData.image_url, alt_text: formData.name || 'Program image' }
    : null;

  return (
    <>
      <div className="space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Program Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="e.g., 1:1 Coaching, Group Program"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Summary *
          </label>
          <textarea
            required
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Brief overview of the program"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Full Description
          </label>
          <div className="[&_.ProseMirror]:min-h-[400px]">
            <TiptapEditor
              content={formData.description || ''}
              onChange={(content) => setFormData({ ...formData, description: content })}
              placeholder="Describe what participants will learn, the process, outcomes, and anything else relevant..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Ideal Participant
          </label>
          <textarea
            value={formData.ideal_participant || ''}
            onChange={(e) => setFormData({ ...formData, ideal_participant: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Who is this program best suited for?"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Duration *
            </label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="e.g., 3-6 months"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Base Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Optional"
            />
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
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            CTA Button Label
          </label>
          <input
            type="text"
            value={formData.cta_label}
            onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <ImageUpload
          label="Program Image"
          value={coverImage}
          onChange={(img) => setFormData({ ...formData, image_url: img?.url || '' })}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-text-primary">
            Program is active and visible to users
          </label>
        </div>

        {program?.id && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-heading">Purchase Variants</h3>
                <p className="text-sm text-text-secondary">
                  Different pricing options for this program
                </p>
              </div>
              <VariantModal programId={program.id} onSave={loadVariants} />
            </div>

            {isLoadingVariants ? (
              <p className="text-text-secondary text-sm">Loading variants...</p>
            ) : variants.length === 0 ? (
              <p className="text-text-secondary text-sm">No variants yet. Add one to get started.</p>
            ) : (
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-heading">{variant.name}</h4>
                        {variant.is_featured && (
                          <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded">
                            Featured
                          </span>
                        )}
                        {!variant.is_active && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {variant.description && (
                        <p className="text-sm text-text-secondary mt-1">{variant.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                        <span className="font-medium text-brand-600">${variant.price}</span>
                        {variant.billing_frequency && <span>{variant.billing_frequency}</span>}
                        {variant.session_count && <span>{variant.session_count} sessions</span>}
                        {variant.duration_weeks && <span>{variant.duration_weeks} weeks</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <VariantModal
                        programId={program.id}
                        variant={variant}
                        onSave={loadVariants}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-2 rounded-lg bg-error-100 text-error-700 hover:bg-error-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <VariantModal programId={program.id} onSave={loadVariants} variant={undefined} isBottomButton />
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 bg-white shadow-lg flex justify-end gap-4 z-[55]">
        <Button type="button" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" onClick={() => handleSubmit()} disabled={isSaving}>
          {isSaving ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
        </Button>
      </div>
    </>
  );
}

interface VariantModalProps {
  programId: string;
  variant?: ProgramVariant;
  onSave: () => void;
  isBottomButton?: boolean;
}

function VariantModal({ programId, variant, onSave, isBottomButton }: VariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: variant?.name || '',
    description: variant?.description || '',
    price: variant?.price || '',
    billing_frequency: variant?.billing_frequency || '',
    session_count: variant?.session_count || '',
    duration_weeks: variant?.duration_weeks || '',
    is_featured: variant?.is_featured ?? false,
    display_order: variant?.display_order || 0,
    is_active: variant?.is_active ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const variantData = {
        program_id: programId,
        name: formData.name,
        description: formData.description || null,
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
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Failed to save variant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          isBottomButton
            ? 'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-text-secondary hover:border-brand-400 hover:text-brand-600 transition-colors'
            : `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                variant
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  : 'bg-brand-500 text-white hover:bg-brand-600'
              }`
        }
      >
        {variant && !isBottomButton ? <Edit2 size={16} /> : <Plus size={isBottomButton ? 18 : 16} />}
        {variant && !isBottomButton ? '' : 'Add Variant'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-text-heading">
                {variant ? 'Edit Variant' : 'New Variant'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="What's included in this variant?"
                />
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

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="is_featured" className="ml-2 text-sm text-text-primary">
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

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <Button type="button" onClick={() => setIsOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
