import { useState } from 'react';
import { useInvoices } from '../../hooks/useInvoices';
import { useCurrency } from '../../hooks/useCurrency';
import { Button } from '../ui/Button';
import { Eye, Download, Trash2, Filter, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { InvoicePreview } from './InvoicePreview';
import { StatusBadge } from '../ui/StatusBadge';
import { ExportModal } from './ExportModal';
import { InvoiceStatus } from '../../types/database.types';

export function InvoiceList() {
  const { invoices, loading, deleteInvoice, updateInvoiceStatus } = useInvoices();
  const { format: formatAmount } = useCurrency();
  const [previewInvoice, setPreviewInvoice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading invoices...</div>;
  }

  const filteredInvoices = statusFilter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === statusFilter);

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.grand_total, 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grand_total, 0),
    outstanding: invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.grand_total, 0)
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No invoices yet. Create your first invoice!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Total Invoiced</p>
          <p className="text-2xl font-bold text-blue-900">{formatAmount(stats.total)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-900">{formatAmount(stats.paid)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-orange-900">{formatAmount(stats.outstanding)}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2 items-center overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${statusFilter === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Draft
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${statusFilter === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Sent
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${statusFilter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${statusFilter === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Overdue
          </button>
        </div>
        <Button onClick={() => setIsExportModalOpen(true)} variant="outline" size="sm" className="w-full sm:w-auto">
          <FileDown className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {invoice.customer_name}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {formatAmount(invoice.grand_total)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setPreviewInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewInvoice && (
        <InvoicePreview
          invoiceId={previewInvoice}
          isOpen={true}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        invoices={invoices}
      />
    </>
  );
}
