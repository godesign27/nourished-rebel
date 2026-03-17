import { Container } from '../../components/shared/Container';
import { H1 } from '../../components/shared/Heading';
import { Button } from '../../components/shared/Button';
import { UserPlus } from 'lucide-react';

export function UserManagementPage() {
  return (
    <div className="min-h-screen py-8 px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <H1 className="mb-2">Users</H1>
          <p className="text-text-secondary">Manage user accounts</p>
        </div>
        <Button>
          <UserPlus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <p className="text-text-secondary text-center">
          User management interface coming soon.
        </p>
      </div>
    </div>
  );
}
