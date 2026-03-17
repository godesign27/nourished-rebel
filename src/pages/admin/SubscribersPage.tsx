import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Container } from '../../components/shared/Container';
import { H1 } from '../../components/shared/Heading';
import { Button } from '../../components/shared/Button';
import { Download, Search, Filter } from 'lucide-react';

interface Subscriber {
  id: string;
  customer_name: string;
  customer_email: string;
  program_title: string;
  variant_name: string | null;
  amount: number;
  currency: string;
  status: string;
  completed_at: string;
  created_at: string;
}

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('program_purchases')
        .select(`
          id,
          customer_name,
          customer_email,
          amount,
          currency,
          status,
          completed_at,
          created_at,
          program_snapshot,
          programs (name),
          program_variants (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(purchase => {
        const snapshot = purchase.program_snapshot as { program_name?: string; variant_name?: string } | null;
        return {
          id: purchase.id,
          customer_name: purchase.customer_name || 'N/A',
          customer_email: purchase.customer_email,
          program_title: purchase.programs?.name || snapshot?.program_name || 'Unknown Program',
          variant_name: purchase.program_variants?.name || snapshot?.variant_name || null,
          amount: purchase.amount,
          currency: purchase.currency,
          status: purchase.status,
          completed_at: purchase.completed_at,
          created_at: purchase.created_at,
        };
      }) || [];

      setSubscribers(formattedData);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch =
      sub.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.program_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Program', 'Variant', 'Amount', 'Status', 'Purchase Date'];
    const rows = filteredSubscribers.map(sub => [
      sub.customer_name,
      sub.customer_email,
      sub.program_title,
      sub.variant_name || 'N/A',
      `${sub.currency.toUpperCase()} ${Number(sub.amount).toFixed(2)}`,
      sub.status,
      new Date(sub.completed_at || sub.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <H1>Subscribers</H1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <H1>Subscribers</H1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {filteredSubscribers.length} {filteredSubscribers.length === 1 ? 'subscriber' : 'subscribers'}
            </p>
          </div>
          <Button onClick={exportToCSV} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {subscriber.customer_name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {subscriber.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {subscriber.program_title}
                        </div>
                        {subscriber.variant_name && (
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {subscriber.variant_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                        ${Number(subscriber.amount).toFixed(2)} {subscriber.currency.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscriber.status)}`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(subscriber.completed_at || subscriber.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  );
}
