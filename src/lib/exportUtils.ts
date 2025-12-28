import { format } from 'date-fns';

export interface InvoiceExportData {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  grand_total: number;
  status: string;
  payment_date?: string | null;
}

export function generateCSV(invoices: InvoiceExportData[]): string {
  const headers = ['Invoice Number', 'Date', 'Customer', 'Amount', 'Status', 'Payment Date'];
  const rows = invoices.map(inv => [
    inv.invoice_number,
    format(new Date(inv.invoice_date), 'dd/MM/yyyy'),
    inv.customer_name,
    `₹${inv.grand_total.toFixed(2)}`,
    inv.status.toUpperCase(),
    inv.payment_date ? format(new Date(inv.payment_date), 'dd/MM/yyyy') : '-'
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

export function downloadCSV(invoices: InvoiceExportData[], filename: string = 'invoices.csv') {
  const csv = generateCSV(invoices);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateSummaryReport(invoices: InvoiceExportData[]): string {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  const report = `
INVOICE SUMMARY REPORT
Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}

==================================

OVERVIEW:
- Total Invoices: ${invoices.length}
- Total Invoiced: ₹${totalInvoiced.toFixed(2)}
- Total Paid: ₹${totalPaid.toFixed(2)}
- Total Outstanding: ₹${totalOutstanding.toFixed(2)}

STATUS BREAKDOWN:
- Draft: ${invoices.filter(inv => inv.status === 'draft').length}
- Sent: ${invoices.filter(inv => inv.status === 'sent').length}
- Paid: ${paidInvoices.length}
- Overdue: ${invoices.filter(inv => inv.status === 'overdue').length}

==================================

DETAILED INVOICE LIST:

${invoices.map(inv => `
Invoice: ${inv.invoice_number}
Date: ${format(new Date(inv.invoice_date), 'dd/MM/yyyy')}
Customer: ${inv.customer_name}
Amount: ₹${inv.grand_total.toFixed(2)}
Status: ${inv.status.toUpperCase()}
${inv.payment_date ? `Payment Date: ${format(new Date(inv.payment_date), 'dd/MM/yyyy')}` : ''}
-----------------------------------
`).join('')}

End of Report
`;

  return report;
}

export function downloadTxtReport(invoices: InvoiceExportData[], filename: string = 'invoice-summary.txt') {
  const report = generateSummaryReport(invoices);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
