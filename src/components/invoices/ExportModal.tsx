import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, FileText, Calendar } from 'lucide-react';
import { downloadCSV, downloadTxtReport, InvoiceExportData } from '../../lib/exportUtils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceExportData[];
}

export function ExportModal({ isOpen, onClose, invoices }: ExportModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportType, setExportType] = useState<'csv' | 'summary'>('csv');

  const getFilteredInvoices = () => {
    if (!startDate && !endDate) return invoices;

    return invoices.filter(inv => {
      const invDate = new Date(inv.invoice_date);
      if (startDate && invDate < new Date(startDate)) return false;
      if (endDate && invDate > new Date(endDate)) return false;
      return true;
    });
  };

  const handleExport = () => {
    const filtered = getFilteredInvoices();

    if (filtered.length === 0) {
      toast.error('No invoices found for the selected date range');
      return;
    }

    const dateRange = startDate && endDate
      ? `_${format(new Date(startDate), 'yyyy-MM-dd')}_to_${format(new Date(endDate), 'yyyy-MM-dd')}`
      : '';

    if (exportType === 'csv') {
      downloadCSV(filtered, `invoices${dateRange}.csv`);
      toast.success(`Exported ${filtered.length} invoices to CSV`);
    } else {
      downloadTxtReport(filtered, `invoice-summary${dateRange}.txt`);
      toast.success('Summary report exported');
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Invoices">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setExportType('csv')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                exportType === 'csv'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">CSV Export</span>
            </button>
            <button
              onClick={() => setExportType('summary')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                exportType === 'summary'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Summary Report</span>
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Leave empty to export all invoices
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {getFilteredInvoices().length} invoice{getFilteredInvoices().length !== 1 ? 's' : ''} will be exported
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export {exportType === 'csv' ? 'CSV' : 'Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
