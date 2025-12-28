import { InvoiceStatus } from '../../types/database.types';

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    draft: {
      color: 'bg-gray-100 text-gray-800',
      label: 'Draft'
    },
    sent: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Sent'
    },
    paid: {
      color: 'bg-green-100 text-green-800',
      label: 'Paid'
    },
    overdue: {
      color: 'bg-red-100 text-red-800',
      label: 'Overdue'
    }
  };

  const { color, label } = config[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
