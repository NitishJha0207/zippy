import { useEffect, useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../hooks/useProfile';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { printInvoice } from '../../lib/pdfGenerator';

interface InvoicePreviewProps {
  invoiceId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceDetail {
  invoice_number: string;
  invoice_date: string;
  transport_mode: string;
  vehicle_number: string | null;
  reverse_charge: boolean;
  place_of_supply: string;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_gstin: string | null;
  bill_to_state: string;
  bill_to_state_code: string | null;
  ship_to_name: string;
  ship_to_address: string;
  ship_to_gstin: string | null;
  ship_to_state: string;
  ship_to_state_code: string | null;
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  total_tax: number;
  grand_total: number;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  terms_conditions: string | null;
}

interface InvoiceItem {
  product_description: string;
  students_staff: string | null;
  hsn_code: string | null;
  rate: number;
  quantity: number;
  amount: number;
  gst_rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
}

function numberToWords(num: number): string {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

  if (num === 0) return 'ZERO';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  let words = '';

  if (crore > 0) {
    words += (crore < 10 ? ones[crore] : tens[Math.floor(crore / 10)] + ' ' + ones[crore % 10]) + ' CRORE ';
  }

  if (lakh > 0) {
    words += (lakh < 10 ? ones[lakh] : tens[Math.floor(lakh / 10)] + ' ' + ones[lakh % 10]) + ' LAKH ';
  }

  if (thousand > 0) {
    words += (thousand < 10 ? ones[thousand] : tens[Math.floor(thousand / 10)] + ' ' + ones[thousand % 10]) + ' THOUSAND ';
  }

  if (hundred > 0) {
    words += ones[hundred] + ' HUNDRED ';
  }

  if (remainder >= 20) {
    words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
  } else if (remainder >= 10) {
    words += teens[remainder - 10];
  } else if (remainder > 0) {
    words += ones[remainder];
  }

  return words.trim() + ' ONLY';
}

export function InvoicePreview({ invoiceId, isOpen, onClose }: InvoicePreviewProps) {
  const { profile } = useProfile();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice();
    }
  }, [isOpen, invoiceId]);

  const loadInvoice = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('item_order');

      if (itemsError) throw itemsError;

      setInvoice(invoiceData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice || !profile) return;

    setDownloading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoice,
            items,
            profile
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice. Please try print instead.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!invoice || !profile) return;

    try {
      printInvoice({
        invoice,
        items,
        profile
      });
    } catch (error) {
      console.error('Error opening print window:', error);
      toast.error('Failed to open print window');
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Invoice Preview">
        <div className="text-center py-8">Loading...</div>
      </Modal>
    );
  }

  if (!invoice || !profile) {
    return null;
  }

  const amountInWords = numberToWords(Math.floor(invoice.grand_total));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GST Invoice Preview" size="large">
      <div className="invoice-preview-container">
        <div className="mb-6 flex justify-end gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} loading={downloading}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <div ref={invoiceRef} className="invoice-content bg-white border-2 border-black text-xs">
          <div className="border-b-2 border-black p-2 text-center">
            <h1 className="text-lg font-bold uppercase">{profile.company_name}</h1>
            <p className="text-xs mt-0.5">{profile.company_address}</p>
            <p className="text-xs">GSTN: {profile.gstin || 'N/A'}</p>
          </div>

          <div className="border-b-2 border-black p-1.5 text-center bg-gray-100">
            <h2 className="text-base font-bold">Original Tax Invoice</h2>
          </div>

          <div className="grid grid-cols-2 border-b-2 border-black text-xs">
            <div className="border-r-2 border-black p-1.5">
              <p className="leading-tight"><strong>Invoice No:</strong> {invoice.invoice_number}</p>
              <p className="leading-tight"><strong>Invoice date:</strong> {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</p>
              <p className="leading-tight"><strong>Reverse Charge (Y/N):</strong> {invoice.reverse_charge ? 'YES' : 'NO'}</p>
              <p className="leading-tight"><strong>State:</strong> {profile.gstin?.substring(0, 2) || ''}</p>
            </div>
            <div className="p-1.5">
              <p className="leading-tight"><strong>Transport Mode:</strong> {invoice.transport_mode}</p>
              <p className="leading-tight"><strong>Vehicle number:</strong> {invoice.vehicle_number || 'N/A'}</p>
              <p className="leading-tight"><strong>Reverse Charge:</strong> {invoice.reverse_charge ? 'YES' : 'NO'}</p>
              <p className="leading-tight"><strong>Place of Supply:</strong> {invoice.place_of_supply}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b-2 border-black text-xs">
            <div className="border-r-2 border-black p-1.5">
              <h3 className="font-bold mb-0.5">Bill To Party</h3>
              <p className="leading-tight"><strong>Name:</strong> {invoice.bill_to_name}</p>
              <p className="leading-tight"><strong>Address:</strong> {invoice.bill_to_address}</p>
              <p className="leading-tight"><strong>GSTIN:</strong> {invoice.bill_to_gstin || 'N/A'}</p>
              <p className="leading-tight"><strong>State:</strong> {invoice.bill_to_state} <strong>Code:</strong> {invoice.bill_to_state_code || 'N/A'}</p>
            </div>
            <div className="p-1.5">
              <h3 className="font-bold mb-0.5">Ship to Party</h3>
              <p className="leading-tight"><strong>Name:</strong> {invoice.ship_to_name}</p>
              <p className="leading-tight"><strong>Address:</strong> {invoice.ship_to_address}</p>
              <p className="leading-tight"><strong>GSTIN:</strong> {invoice.ship_to_gstin || 'N/A'}</p>
              <p className="leading-tight"><strong>State:</strong> {invoice.ship_to_state} <strong>Code:</strong> {invoice.ship_to_state_code || 'N/A'}</p>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b-2 border-black">
                <th className="border-r-2 border-black p-1 text-left w-8">S. No.</th>
                <th className="border-r-2 border-black p-1 text-left">Product Description</th>
                <th className="border-r-2 border-black p-1 text-left w-20">Students/Staff</th>
                <th className="border-r-2 border-black p-1 text-right w-16">Rate</th>
                <th className="border-r-2 border-black p-1 text-right w-16">Amount</th>
                <th className="border-r-2 border-black p-1 text-center w-16">HSN CODE</th>
                <th className="border-r-2 border-black p-1 text-right w-20">Taxable Value</th>
                <th className="border-r-2 border-black p-1 text-center" colSpan={2}>GST</th>
                <th className="border-black p-1 text-right w-20">Total</th>
              </tr>
              <tr className="border-b border-black bg-gray-50">
                <th className="border-r-2 border-black"></th>
                <th className="border-r-2 border-black"></th>
                <th className="border-r-2 border-black"></th>
                <th className="border-r-2 border-black"></th>
                <th className="border-r-2 border-black"></th>
                <th className="border-r-2 border-black"></th>
                <th className="border-r-2 border-black"></th>
                <th className="border-r border-black p-1 text-center text-xs">Rate</th>
                <th className="border-r-2 border-black p-1 text-center text-xs">Amount</th>
                <th className="border-black"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r-2 border-black p-1 text-center">{index + 1}</td>
                  <td className="border-r-2 border-black p-1">{item.product_description}</td>
                  <td className="border-r-2 border-black p-1 text-center">{item.students_staff || '-'}</td>
                  <td className="border-r-2 border-black p-1 text-right">{item.rate.toFixed(2)}</td>
                  <td className="border-r-2 border-black p-1 text-right">{item.amount.toFixed(2)}</td>
                  <td className="border-r-2 border-black p-1 text-center">{item.hsn_code || '-'}</td>
                  <td className="border-r-2 border-black p-1 text-right">{item.taxable_value.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-center">{item.gst_rate}%</td>
                  <td className="border-r-2 border-black p-1 text-right">{(item.cgst + item.sgst).toFixed(2)}</td>
                  <td className="border-black p-1 text-right font-medium">{(item.taxable_value + item.cgst + item.sgst).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-black font-bold bg-gray-50">
                <td colSpan={4} className="border-r-2 border-black p-1 text-right">Total</td>
                <td className="border-r-2 border-black p-1 text-right">{invoice.subtotal.toFixed(2)}</td>
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black p-1 text-right">{invoice.subtotal.toFixed(2)}</td>
                <td className="border-r border-black"></td>
                <td className="border-r-2 border-black p-1 text-right">{invoice.total_tax.toFixed(2)}</td>
                <td className="border-black p-1 text-right">{invoice.grand_total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 border-b-2 border-black text-xs">
            <div className="border-r-2 border-black p-1.5">
              <p className="font-bold mb-0.5">Total Invoice amount in words</p>
              <p className="text-xs leading-tight">{amountInWords}</p>
            </div>
            <div className="p-1.5">
              <div className="space-y-0.5">
                <div className="flex justify-between leading-tight">
                  <span>Total Amount before Tax</span>
                  <span className="font-medium">{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between leading-tight">
                  <span>CGST 2.5%</span>
                  <span className="font-medium">{invoice.cgst_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between leading-tight">
                  <span>SGST 2.5%</span>
                  <span className="font-medium">{invoice.sgst_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between leading-tight">
                  <span>Total Tax Amount</span>
                  <span className="font-medium">{invoice.total_tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-0.5 leading-tight">
                  <span>Total Amount after Tax:</span>
                  <span>{invoice.grand_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between leading-tight">
                  <span>GST on Reverse Charge</span>
                  <span className="font-medium">{invoice.reverse_charge ? invoice.total_tax.toFixed(2) : '0'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b-2 border-black min-h-[80px] text-xs">
            <div className="border-r-2 border-black p-1.5">
              <h3 className="font-bold mb-0.5">Bank Details</h3>
              {invoice.bank_name && (
                <>
                  <p className="leading-tight"><strong>Bank Name:</strong> {invoice.bank_name}</p>
                  {invoice.account_number && <p className="leading-tight"><strong>Bank A/C:</strong> {invoice.account_number}</p>}
                  {invoice.ifsc_code && <p className="leading-tight"><strong>Bank IFSC:</strong> {invoice.ifsc_code}</p>}
                </>
              )}
              {invoice.terms_conditions && (
                <>
                  <h3 className="font-bold mt-1 mb-0.5">Terms & conditions</h3>
                  <p className="text-xs whitespace-pre-wrap leading-tight">{invoice.terms_conditions}</p>
                </>
              )}
            </div>
            <div className="p-1.5 flex flex-col justify-end items-end">
              <p className="font-bold">For {profile.company_name}</p>
              <div className="mt-6">
                <p className="text-xs">Authorised signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body * {
            visibility: hidden;
          }

          .invoice-preview-container,
          .invoice-preview-container * {
            visibility: visible;
          }

          .invoice-preview-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          .invoice-content {
            border: 2px solid black !important;
            font-size: 9pt !important;
            max-width: 100%;
            page-break-inside: avoid;
          }

          .invoice-content table {
            page-break-inside: auto;
          }

          .invoice-content tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Hide modal overlay and backdrop */
          [role="dialog"] {
            position: static !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Remove modal styling for print */
          .fixed, .inset-0, .bg-black, .bg-opacity-50 {
            position: static !important;
            background: transparent !important;
          }
        }

        @media screen {
          .invoice-content {
            max-height: 80vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </Modal>
  );
}
