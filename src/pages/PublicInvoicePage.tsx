import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Download, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  status: string;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_gstin: string | null;
  bill_to_state: string;
  ship_to_name: string;
  ship_to_address: string;
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  total_tax: number;
  grand_total: number;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  payment_link: string | null;
  user_id: string;
}

interface ProfileData {
  company_name: string;
  company_address: string;
  company_logo_url: string | null;
  gstin: string | null;
  mobile_number: string;
  email: string;
  upi_id: string | null;
}

interface InvoiceItem {
  product_description: string;
  hsn_code: string | null;
  rate: number;
  quantity: number;
  amount: number;
  gst_rate: number;
  cgst: number;
  sgst: number;
}

export function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadInvoice();
    }
  }, [token]);

  const loadInvoice = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('share_token', token)
        .maybeSingle();

      if (invoiceError) {
        console.error('Invoice error:', invoiceError);
        throw new Error('Invoice not found');
      }

      if (!invoiceData) {
        throw new Error('Invoice not found');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_name, company_address, company_logo_url, gstin, mobile_number, email, upi_id')
        .eq('id', invoiceData.user_id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error('Profile not found');
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceData.id)
        .order('item_order');

      if (itemsError) {
        console.error('Items error:', itemsError);
        throw itemsError;
      }

      console.log('Loaded invoice:', invoiceData);
      console.log('Loaded profile:', profileData);
      console.log('Loaded items:', itemsData);

      setInvoice(invoiceData);
      setProfile(profileData);
      setItems(itemsData || []);
    } catch (err: any) {
      console.error('Load invoice error:', err);
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">This invoice link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
            <p className="text-sm text-gray-600">Issued by {profile.company_name}</p>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>

        {!isPaid && (invoice.payment_link || profile.upi_id) && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 print:hidden">
            <h2 className="text-lg font-bold text-blue-900 mb-3">Pay Now</h2>
            <p className="text-2xl font-bold text-blue-900 mb-4">₹{invoice.grand_total.toFixed(2)}</p>

            {invoice.payment_link && (
              <a
                href={invoice.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mb-3"
              >
                Pay with Card/UPI
              </a>
            )}

            {profile.upi_id && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Or pay directly via UPI:</p>
                <p className="text-lg font-mono font-bold text-gray-900 mb-2">{profile.upi_id}</p>
                <a
                  href={`upi://pay?pa=${profile.upi_id}&pn=${encodeURIComponent(profile.company_name)}&am=${invoice.grand_total}&cu=INR&tn=${encodeURIComponent(`Payment for ${invoice.invoice_number}`)}`}
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Pay via UPI App
                </a>
              </div>
            )}
          </div>
        )}

        {isPaid && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 print:hidden">
            <p className="text-green-800 font-medium">This invoice has been paid</p>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-2 border-black">
          <div className="p-4 sm:p-6 border-b-2 border-black">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {profile.company_logo_url && (
                <img
                  src={profile.company_logo_url}
                  alt={profile.company_name}
                  className="h-16 object-contain"
                />
              )}
              <div className={`${profile.company_logo_url ? 'text-center sm:text-right' : 'text-center flex-1'}`}>
                <h1 className="text-xl sm:text-2xl font-bold">{profile.company_name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{profile.company_address}</p>
                {profile.gstin && <p className="text-xs sm:text-sm text-gray-600">GSTIN: {profile.gstin}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-3 border-b-2 border-black text-center">
            <h2 className="text-lg sm:text-xl font-bold">TAX INVOICE</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 border-b-2 border-black">
            <div className="p-4 sm:border-r-2 border-black border-b sm:border-b-0">
              <p className="text-sm"><strong>Invoice #:</strong> {invoice.invoice_number}</p>
              <p className="text-sm"><strong>Date:</strong> {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</p>
              <p className="text-sm"><strong>Status:</strong> <span className="uppercase">{invoice.status}</span></p>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">Bill To:</h3>
              <p className="text-sm font-medium">{invoice.bill_to_name}</p>
              <p className="text-sm text-gray-600">{invoice.bill_to_address}</p>
              <p className="text-sm text-gray-600">{invoice.bill_to_state}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="p-3 text-left border-r border-black">Item</th>
                  <th className="p-3 text-right border-r border-black">Rate</th>
                  <th className="p-3 text-right border-r border-black">Qty</th>
                  <th className="p-3 text-right border-r border-black">Amount</th>
                  <th className="p-3 text-right">Tax</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-black">
                    <td className="p-3 border-r border-black">
                      <p className="font-medium">{item.product_description}</p>
                      {item.hsn_code && <p className="text-xs text-gray-500">HSN: {item.hsn_code}</p>}
                    </td>
                    <td className="p-3 text-right border-r border-black">₹{item.rate.toFixed(2)}</td>
                    <td className="p-3 text-right border-r border-black">{item.quantity}</td>
                    <td className="p-3 text-right border-r border-black">₹{item.amount.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <p className="text-xs text-gray-600">GST {item.gst_rate}%</p>
                      <p>₹{(item.cgst + item.sgst).toFixed(2)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-black">
            <div className="p-4 sm:border-r-2 border-black border-b sm:border-b-0">
              {invoice.bank_name && (
                <>
                  <h3 className="font-bold mb-2">Payment Details</h3>
                  <p className="text-sm"><strong>Bank:</strong> {invoice.bank_name}</p>
                  {invoice.account_number && <p className="text-sm"><strong>Account:</strong> {invoice.account_number}</p>}
                  {invoice.ifsc_code && <p className="text-sm"><strong>IFSC:</strong> {invoice.ifsc_code}</p>}
                  {profile.upi_id && (
                    <p className="text-sm mt-2"><strong>UPI:</strong> {profile.upi_id}</p>
                  )}
                </>
              )}
            </div>
            <div className="p-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CGST:</span>
                  <span>₹{invoice.cgst_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST:</span>
                  <span>₹{invoice.sgst_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span>₹{invoice.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t-2 border-black bg-gray-50 print:hidden">
            <h3 className="font-bold mb-2">Contact Seller</h3>
            <div className="flex gap-4 text-sm">
              <a href={`tel:${profile.mobile_number}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                <Phone className="w-4 h-4" />
                {profile.mobile_number}
              </a>
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                <Mail className="w-4 h-4" />
                {profile.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-white.shadow-lg {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .bg-white.shadow-lg * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
