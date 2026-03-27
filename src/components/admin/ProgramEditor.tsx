import { useState, useEffect, useCallback } from 'react';
import { Button } from '../shared/Button';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Program, ProgramVariant } from '../../types';
import ImageUpload from '../blog/ImageUpload';
import TiptapEditor from '../blog/TiptapEditor';

interface ProgramEditorProps {
  program: Program | null;
  onClose: () => void;
  onSave: () => void;
}

type ActiveTab = 'general' | string;

interface VariantFormData {
  name: string;
  description: string;
  detailed_description: string;
  price: string;
  billing_frequency: string;
  session_count: string;
  duration_weeks: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

function createVariantFormData(variant?: ProgramVariant | null): VariantFormData {
  return {
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
  };
}

export function ProgramEditor({ program: initialProgram, onClose, onSave }: ProgramEditorProps) {
  const [currentProgram, setCurrentProgram] = useState<Program | null>(initialProgram);
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [formData, setFormData] = useState({
    name: initialProgram?.name || '',
    category: initialProgram?.category || '',
    summary: initialProgram?.summary || '',
    description: initialProgram?.description || '',
    ideal_participant: initialProgram?.ideal_participant || '',
    duration: initialProgram?.duration || '',
    price: initialProgram?.price || '',
    cta_label: initialProgram?.cta_label || 'Learn More',
    image_url: initialProgram?.image_url || '',
    display_order: initialProgram?.display_order || 0,
    is_active: initialProgram?.is_active ?? true,
    booking_link: initialProgram?.booking_link || '',
    intake_form_link: initialProgram?.intake_form_link || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [variants, setVariants] = useState<ProgramVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [variantForms, setVariantForms] = useState<Record<string, VariantFormData>>({});
  const [isNewVariant, setIsNewVariant] = useState(false);
  const [newVariantForm, setNewVariantForm] = useState<VariantFormData>(createVariantFormData());

  useEffect(() => {
    if (currentProgram?.id) {
      loadVariants();
    }
  }, [currentProgram?.id]);

  const loadVariants = async () => {
    if (!currentProgram?.id) return;
    setIsLoadingVariants(true);
    try {
      const { data, error } = await supabase
        .from('program_variants')
        .select('*')
        .eq('program_id', currentProgram.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const loaded = data || [];
      setVariants(loaded);

      const forms: Record<string, VariantFormData> = {};
      loaded.forEach((v) => {
        forms[v.id] = createVariantFormData(v);
      });
      setVariantForms(forms);
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const handleSaveProgram = async () => {
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

      if (currentProgram) {
        const { error } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', currentProgram.id);
        if (error) throw error;
        onSave();
        onClose();
      } else {
        const { data, error } = await supabase
          .from('programs')
          .insert([programData])
          .select()
          .maybeSingle();
        if (error) throw error;
        onSave();
        if (data) {
          setCurrentProgram(data);
        }
      }
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVariant = async (variantId: string) => {
    const form = variantForms[variantId];
    if (!form || !currentProgram?.id) return;

    setIsSaving(true);
    try {
      const variantData = {
        program_id: currentProgram.id,
        name: form.name,
        description: form.description || null,
        detailed_description: form.detailed_description || null,
        price: parseFloat(form.price.toString()),
        billing_frequency: form.billing_frequency || null,
        session_count: form.session_count ? parseInt(form.session_count.toString()) : null,
        duration_weeks: form.duration_weeks ? parseInt(form.duration_weeks.toString()) : null,
        is_featured: form.is_featured,
        display_order: parseInt(form.display_order.toString()) || 0,
        is_active: form.is_active,
      };

      const { error } = await supabase
        .from('program_variants')
        .update(variantData)
        .eq('id', variantId);
      if (error) throw error;
      await loadVariants();
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Failed to save variant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateVariant = async () => {
    if (!currentProgram?.id) return;

    setIsSaving(true);
    try {
      const variantData = {
        program_id: currentProgram.id,
        name: newVariantForm.name,
        description: newVariantForm.description || null,
        detailed_description: newVariantForm.detailed_description || null,
        price: parseFloat(newVariantForm.price.toString()),
        billing_frequency: newVariantForm.billing_frequency || null,
        session_count: newVariantForm.session_count
          ? parseInt(newVariantForm.session_count.toString())
          : null,
        duration_weeks: newVariantForm.duration_weeks
          ? parseInt(newVariantForm.duration_weeks.toString())
          : null,
        is_featured: newVariantForm.is_featured,
        display_order: parseInt(newVariantForm.display_order.toString()) || 0,
        is_active: newVariantForm.is_active,
      };

      const { data, error } = await supabase
        .from('program_variants')
        .insert([variantData])
        .select()
        .maybeSingle();
      if (error) throw error;

      setIsNewVariant(false);
      setNewVariantForm(createVariantFormData());
      await loadVariants();
      if (data) setActiveTab(data.id);
    } catch (error) {
      console.error('Error creating variant:', error);
      alert('Failed to create variant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase.from('program_variants').delete().eq('id', variantId);
      if (error) throw error;
      setActiveTab('general');
      await loadVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const handleAddVariantTab = () => {
    setNewVariantForm(createVariantFormData());
    setIsNewVariant(true);
    setActiveTab('new');
  };

  const handleCancelNewVariant = () => {
    setIsNewVariant(false);
    setActiveTab('general');
  };

  const updateVariantForm = useCallback(
    (variantId: string, updates: Partial<VariantFormData>) => {
      setVariantForms((prev) => ({
        ...prev,
        [variantId]: { ...prev[variantId], ...updates },
      }));
    },
    []
  );

  const coverImage = formData.image_url
    ? { url: formData.image_url, alt_text: formData.name || 'Program image' }
    : null;

  const isOnGeneralTab = activeTab === 'general';
  const isOnNewVariant = activeTab === 'new' && isNewVariant;
  const activeVariantId = !isOnGeneralTab && !isOnNewVariant ? activeTab : null;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center">
          <div className="flex-1 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                isOnGeneralTab
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }`}
            >
              General
            </button>

            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setActiveTab(variant.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 flex items-center gap-2 ${
                  activeTab === variant.id
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                {variant.name || 'Untitled'}
                {variant.is_featured && (
                  <span className="px-1.5 py-0.5 bg-accent-100 text-accent-700 text-[10px] font-semibold rounded leading-none">
                    Featured
                  </span>
                )}
                {!variant.is_active && (
                  <span className="w-2 h-2 rounded-full bg-gray-400" title="Inactive" />
                )}
              </button>
            ))}

            {isNewVariant && (
              <button
                onClick={() => setActiveTab('new')}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  isOnNewVariant
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                New Variant
              </button>
            )}
          </div>

          {!isNewVariant && (
            <div className="flex-shrink-0 px-5">
              <Button
                onClick={() => {
                  if (!currentProgram?.id) {
                    alert('Please save the program first before adding variants.');
                    return;
                  }
                  handleAddVariantTab();
                }}
                className="!py-2 !px-4 !text-sm flex items-center gap-1.5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Variant
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isOnGeneralTab && (
          <GeneralTab
            formData={formData}
            setFormData={setFormData}
            coverImage={coverImage}
          />
        )}

        {activeVariantId && variantForms[activeVariantId] && (
          <VariantTab
            key={activeVariantId}
            variantId={activeVariantId}
            form={variantForms[activeVariantId]}
            onChange={(updates) => updateVariantForm(activeVariantId, updates)}
          />
        )}

        {isOnNewVariant && (
          <VariantTab
            key="new"
            variantId="new"
            form={newVariantForm}
            onChange={(updates) =>
              setNewVariantForm((prev) => ({ ...prev, ...updates }))
            }
          />
        )}
      </div>

      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
        <div>
          {activeVariantId && (
            <button
              type="button"
              onClick={() => handleDeleteVariant(activeVariantId)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-error-700 hover:bg-error-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete Variant
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={isOnNewVariant ? handleCancelNewVariant : onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {isOnGeneralTab && (
            <Button type="button" onClick={handleSaveProgram} disabled={isSaving}>
              {isSaving ? 'Saving...' : currentProgram ? 'Update Program' : 'Create Program'}
            </Button>
          )}
          {activeVariantId && (
            <Button
              type="button"
              onClick={() => handleSaveVariant(activeVariantId)}
              disabled={isSaving || !variantForms[activeVariantId]?.name || !variantForms[activeVariantId]?.price}
            >
              {isSaving ? 'Saving...' : 'Save Variant'}
            </Button>
          )}
          {isOnNewVariant && (
            <Button
              type="button"
              onClick={handleCreateVariant}
              disabled={isSaving || !newVariantForm.name || !newVariantForm.price}
            >
              {isSaving ? 'Saving...' : 'Create Variant'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface GeneralTabProps {
  formData: {
    name: string;
    category: string;
    summary: string;
    description: string;
    ideal_participant: string;
    duration: string;
    price: string | number;
    cta_label: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
    booking_link: string;
    intake_form_link: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<typeof formData & Record<string, unknown>>>;
  coverImage: { url: string; alt_text: string } | null;
}

function GeneralTab({ formData, setFormData, coverImage }: GeneralTabProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Program Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, name: e.target.value }))}
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
            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, category: e.target.value }))}
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
          onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, summary: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Brief overview of the program"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Full Description
        </label>
        <div className="[&_.ProseMirror]:min-h-[120px]">
          <TiptapEditor
            content={formData.description || ''}
            onChange={(content) => setFormData((prev: typeof formData) => ({ ...prev, description: content }))}
            placeholder="Brief program overview (detailed content goes on each variant tab)"
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
            setFormData((prev: typeof formData) => ({ ...prev, ideal_participant: e.target.value }))
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
            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, duration: e.target.value }))}
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
            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, price: e.target.value }))}
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
              setFormData((prev: typeof formData) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))
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
            onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, booking_link: e.target.value }))}
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
              setFormData((prev: typeof formData) => ({ ...prev, intake_form_link: e.target.value }))
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
          onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, cta_label: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <ImageUpload
        label="Program Image"
        value={coverImage}
        onChange={(img) => setFormData((prev: typeof formData) => ({ ...prev, image_url: img?.url || '' }))}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-text-primary">
          Program is active and visible to users
        </label>
      </div>
    </div>
  );
}

interface VariantTabProps {
  variantId: string;
  form: VariantFormData;
  onChange: (updates: Partial<VariantFormData>) => void;
}

function VariantTab({ form, onChange }: VariantTabProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Variant Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
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
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Short Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Brief overview shown on variant cards"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Billing Frequency
          </label>
          <select
            value={form.billing_frequency}
            onChange={(e) => onChange({ billing_frequency: e.target.value })}
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
            value={form.session_count}
            onChange={(e) => onChange({ session_count: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Duration (weeks)
          </label>
          <input
            type="number"
            value={form.duration_weeks}
            onChange={(e) => onChange({ duration_weeks: e.target.value })}
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
          value={form.display_order}
          onChange={(e) => onChange({ display_order: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent w-32"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="variant_is_featured"
            checked={form.is_featured}
            onChange={(e) => onChange({ is_featured: e.target.checked })}
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
            checked={form.is_active}
            onChange={(e) => onChange({ is_active: e.target.checked })}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <label htmlFor="variant_is_active" className="ml-2 text-sm text-text-primary">
            Active
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <label className="block text-sm font-medium text-text-primary mb-1">
          Detailed Description
        </label>
        <p className="text-xs text-text-secondary mb-3">
          Rich content displayed on the program page when a visitor selects this variant
        </p>
        <div className="[&_.ProseMirror]:min-h-[300px]">
          <TiptapEditor
            content={form.detailed_description || ''}
            onChange={(content) => onChange({ detailed_description: content })}
            placeholder="Describe what's included, outcomes, process details..."
          />
        </div>
      </div>
    </div>
  );
}
