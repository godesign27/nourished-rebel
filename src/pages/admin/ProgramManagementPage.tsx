import { useState, useEffect } from 'react';
import { Button } from '../../components/shared/Button';
import { Drawer } from '../../components/shared/Drawer';
import { Plus, CreditCard as Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Program } from '../../types';
import { ProgramEditor } from '../../components/admin/ProgramEditor';

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
        size="full"
      >
        <ProgramEditor
          program={editingProgram}
          onClose={closeDrawer}
          onSave={loadPrograms}
        />
      </Drawer>
    </div>
  );
}
