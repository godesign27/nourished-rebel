import { useState, useEffect, useRef } from 'react';
import { Button } from '../shared/Button';
import { Plus, CreditCard as Edit2, Trash2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Program, ProgramVariant } from '../../types';
import ImageUpload from '../blog/ImageUpload';
import TiptapEditor from '../blog/TiptapEditor';
import { VariantEditorDrawer } from './VariantEditorDrawer';
import { sanitizeHtml } from '../../utils/sanitize';

interface ProgramEditorProps {
  program: Program | null;
  onClose: () => void;
  onSave: () => void;
}

export function ProgramEditor({ program, onClose, onSave }: ProgramEditorProps) {
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
    booking_link: program?.booking_link || '',
    intake_form_link: program?.intake_form_link || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [variants, setVariants] = useState<ProgramVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [activeVariantTab, setActiveVariantTab] = useState<string | null>(null);
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProgramVariant | null>(null);
  const variantContentRef = useRef<HTMLDivElement>(null);

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

      if (data && data.length > 0 && !activeVariantTab) {
        setActiveVariantTab(data[0].id);
      }
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const handleSubmit = async () => {
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
        booking_link: formData.booking_link || null,
        intake_form_link: formData.intake_form_link || null,
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
      if (activeVariantTab === id) {
        setActiveVariantTab(variants.find((v) => v.id !== id)?.id || null);
      }
      loadVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const openVariantEditor = (variant?: ProgramVariant) => {
    setEditingVariant(variant || null);
    setVariantDrawerOpen(true);
  };

  const handleVariantSaved = () => {
    loadVariants();
  };

  const handleVariantTabClick = (variantId: string) => {
    setActiveVariantTab(variantId);
    variantContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeVariant = variants.find((v) => v.id === activeVariantTab);

  const coverImage = formData.image_url
    ? { url: formData.image_url, alt_text: formData.name || 'Program image' }
    : null;

  return (
    <>
      <div className="flex h-[calc(100vh-65px)]">
        <VariantPreviewPanel
          variants={variants}
          activeVariantTab={activeVariantTab}
          activeVariant={activeVariant}
          isLoadingVariants={isLoadingVariants}
          programId={program?.id}
          variantContentRef={variantContentRef}
          onTabClick={handleVariantTabClick}
          onEditVariant={openVariantEditor}
        />

        <div className="flex-1 overflow-y-auto border-l border-gray-200">
          <div className="p-6 space-y-6 pb-24">
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
              <div className="[&_.ProseMirror]:min-h-[300px]">
                <TiptapEditor
                  content={formData.description || ''}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Describe what participants will learn, the process, outcomes..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Ideal Participant
              </label>
              <textarea
                value={formData.ideal_participant || ''}
                onChange={(e) =>
                  setFormData({ ...formData, ideal_participant: e.target.value })
                }
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Booking Link
                </label>
                <input
                  type="url"
                  value={formData.booking_link}
                  onChange={(e) => setFormData({ ...formData, booking_link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="https://calendly.com/..."
                />
                <p className="text-xs text-text-secondary mt-1">
                  Included in purchase confirmation emails
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Intake Form Link
                </label>
                <input
                  type="url"
                  value={formData.intake_form_link}
                  onChange={(e) =>
                    setFormData({ ...formData, intake_form_link: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="https://forms.google.com/..."
                />
                <p className="text-xs text-text-secondary mt-1">
                  Included in purchase confirmation emails
                </p>
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
                    <h3 className="text-lg font-semibold text-text-heading">
                      Purchase Variants
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Different pricing options for this program
                    </p>
                  </div>
                  <Button onClick={() => openVariantEditor()}>
                    <Plus size={16} className="mr-1" />
                    Add Variant
                  </Button>
                </div>

                {isLoadingVariants ? (
                  <p className="text-text-secondary text-sm">Loading variants...</p>
                ) : variants.length === 0 ? (
                  <p className="text-text-secondary text-sm">
                    No variants yet. Add one to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                          activeVariantTab === variant.id
                            ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => handleVariantTabClick(variant.id)}
                      >
                        <div className="flex-1 min-w-0">
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
                            {variant.detailed_description && (
                              <FileText size={14} className="text-brand-500" title="Has detailed description" />
                            )}
                          </div>
                          {variant.description && (
                            <p className="text-sm text-text-secondary mt-1 truncate">
                              {variant.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                            <span className="font-medium text-brand-600">
                              ${variant.price}
                            </span>
                            {variant.billing_frequency && (
                              <span>{variant.billing_frequency}</span>
                            )}
                            {variant.session_count && (
                              <span>{variant.session_count} sessions</span>
                            )}
                            {variant.duration_weeks && (
                              <span>{variant.duration_weeks} weeks</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVariantEditor(variant);
                            }}
                            className="p-2 rounded-lg bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVariant(variant.id);
                            }}
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
                  <button
                    type="button"
                    onClick={() => openVariantEditor()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-text-secondary hover:border-brand-400 hover:text-brand-600 transition-colors"
                  >
                    <Plus size={18} />
                    Add Variant
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-white shadow-lg flex justify-end gap-4 z-[55]">
            <Button type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
            </Button>
          </div>
        </div>
      </div>

      {program?.id && (
        <VariantEditorDrawer
          isOpen={variantDrawerOpen}
          onClose={() => {
            setVariantDrawerOpen(false);
            setEditingVariant(null);
          }}
          programId={program.id}
          variant={editingVariant}
          onSave={handleVariantSaved}
        />
      )}
    </>
  );
}

interface VariantPreviewPanelProps {
  variants: ProgramVariant[];
  activeVariantTab: string | null;
  activeVariant: ProgramVariant | undefined;
  isLoadingVariants: boolean;
  programId: string | undefined;
  variantContentRef: React.RefObject<HTMLDivElement>;
  onTabClick: (id: string) => void;
  onEditVariant: (variant: ProgramVariant) => void;
}

function VariantPreviewPanel({
  variants,
  activeVariantTab,
  activeVariant,
  isLoadingVariants,
  programId,
  variantContentRef,
  onTabClick,
  onEditVariant,
}: VariantPreviewPanelProps) {
  if (!programId) {
    return (
      <div className="w-[440px] flex-shrink-0 bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-text-secondary text-sm">
            Save this program first, then add variants to see their content previews here.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingVariants) {
    return (
      <div className="w-[440px] flex-shrink-0 bg-gray-50 flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading variants...</p>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="w-[440px] flex-shrink-0 bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-text-heading font-medium mb-1">No variants yet</p>
          <p className="text-text-secondary text-sm">
            Add purchase variants to preview their detailed descriptions here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[440px] flex-shrink-0 bg-gray-50 flex flex-col">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 pt-4 pb-0">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            Variant Content Preview
          </p>
        </div>
        <div className="flex overflow-x-auto px-4 gap-1 scrollbar-thin">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => onTabClick(variant.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                activeVariantTab === variant.id
                  ? 'border-brand-600 text-brand-700 bg-brand-50'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }`}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>

      <div ref={variantContentRef as React.RefObject<HTMLDivElement>} className="flex-1 overflow-y-auto p-6">
        {activeVariant ? (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-heading">
                  {activeVariant.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                  <span className="font-semibold text-brand-600">
                    ${activeVariant.price}
                  </span>
                  {activeVariant.billing_frequency && (
                    <span>{activeVariant.billing_frequency}</span>
                  )}
                  {activeVariant.session_count && (
                    <span>{activeVariant.session_count} sessions</span>
                  )}
                  {activeVariant.duration_weeks && (
                    <span>{activeVariant.duration_weeks} weeks</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEditVariant(activeVariant)}
                className="p-2 rounded-lg text-brand-600 hover:bg-brand-100 transition-colors"
                title="Edit this variant"
              >
                <Edit2 size={16} />
              </button>
            </div>

            {activeVariant.description && (
              <p className="text-sm text-text-secondary mb-4 pb-4 border-b border-gray-200">
                {activeVariant.description}
              </p>
            )}

            {activeVariant.detailed_description ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(activeVariant.detailed_description),
                }}
              />
            ) : (
              <div className="text-center py-12">
                <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-text-secondary text-sm mb-3">
                  No detailed description yet
                </p>
                <button
                  type="button"
                  onClick={() => onEditVariant(activeVariant)}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Add detailed description
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center mt-8">
            Select a variant to preview its content
          </p>
        )}
      </div>
    </div>
  );
}
