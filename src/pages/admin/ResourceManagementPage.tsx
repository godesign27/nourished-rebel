import { Container } from '../../components/shared/Container';
import { H1 } from '../../components/shared/Heading';
import { Button } from '../../components/shared/Button';
import { Plus } from 'lucide-react';

export function ResourceManagementPage() {
  return (
    <div className="min-h-screen py-8 px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <H1 className="mb-2">Resources</H1>
          <p className="text-text-secondary">Update free resources and downloads</p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          New Resource
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <p className="text-text-secondary text-center">
          No resources yet. Click "New Resource" to add your first free resource.
        </p>
      </div>
    </div>
  );
}
