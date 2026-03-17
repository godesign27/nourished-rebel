import { Container } from '../../components/shared/Container';
import { H1 } from '../../components/shared/Heading';
import { Button } from '../../components/shared/Button';
import { Calendar } from 'lucide-react';

export function SessionManagementPage() {
  return (
    <div className="min-h-screen py-8 px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <H1 className="mb-2">Sessions</H1>
          <p className="text-text-secondary">View and manage bookings</p>
        </div>
        <Button>
          <Calendar size={20} className="mr-2" />
          Calendar View
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <p className="text-text-secondary text-center">
          No sessions booked yet. Sessions will appear here when clients book appointments.
        </p>
      </div>
    </div>
  );
}
