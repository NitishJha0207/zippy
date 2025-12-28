import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageSquare, Mail, Link as LinkIcon, FileDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getRazorpayConfig, createPaymentLink } from '../../lib/razorpay';
import { generateAndUploadInvoicePDF, getInvoiceHTML } from '../../lib/pdfService';
import toast from 'react-hot-toast';

interface ShareInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  onStatusUpdate: () => void;
}

export function ShareInvoiceModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerName,
  amount,
  onStatusUpdate
}: ShareInvoiceModalProps) {
  const [shareMethod, setShareMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomerDetails();
    }
  }, [isOpen, invoiceId]);


  const loadCustomerDetails = async () => {
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*, user_id')
        .eq('id', invoiceId)
        .single();

      if (!invoice) return;

      if (invoice.customer_id) {
        const { data: customer } = await supabase
          .from('customers')
          .select('phone, email')
          .eq('id', invoice.customer_id)
          .single();

        if (customer) {
          setPhoneNumber(customer.phone);
          setEmail(customer.email);
        }
      }

      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('item_order');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, company_address, gstin, company_logo_url, upi_id')
        .eq('id', invoice.user_id)
        .single();

      let generatedPdfUrl = '';
      if (items && profile) {
        const htmlContent = getInvoiceHTML(invoice, items, profile);
        const pdfPublicUrl = await generateAndUploadInvoicePDF({
          invoiceId,
          userId: invoice.user_id,
          invoiceNumber,
          htmlContent
        });

        if (pdfPublicUrl) {
          setPdfUrl(pdfPublicUrl);
          generatedPdfUrl = pdfPublicUrl;
        }
      }

      const invoiceUrl = `${window.location.origin}/invoice/${invoice.share_token}`;
      const pdfDownloadText = generatedPdfUrl ? `\n\nDownload PDF: ${generatedPdfUrl}` : '';

      if (invoice.payment_link) {
        setPaymentLink(invoice.payment_link);
        setMessage(
          `Hi ${customerName},\n\nYour invoice ${invoiceNumber} for ₹${amount.toFixed(2)} is ready.\n\nView Invoice: ${invoiceUrl}${pdfDownloadText}\n\nPay now: ${invoice.payment_link}\n\nThank you for your business!`
        );
      } else {
        setMessage(
          `Hi ${customerName},\n\nYour invoice ${invoiceNumber} for ₹${amount.toFixed(2)} is ready.\n\nView Invoice: ${invoiceUrl}${pdfDownloadText}\n\nThank you for your business!`
        );
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  const handleGeneratePaymentLink = async () => {
    const config = getRazorpayConfig();
    if (!config) {
      toast.error('Please configure Razorpay in settings first');
      return;
    }

    setGeneratingPaymentLink(true);
    try {
      const result = await createPaymentLink(config, {
        amount: amount,
        currency: 'INR',
        description: `Payment for Invoice ${invoiceNumber}`,
        customer: {
          name: customerName,
          email: email,
          contact: phoneNumber.replace(/\D/g, '')
        },
        notify: {
          sms: false,
          email: false
        }
      });

      if (result) {
        await supabase
          .from('invoices')
          .update({ payment_link: result.short_url, payment_id: result.id })
          .eq('id', invoiceId);

        setPaymentLink(result.short_url);
        setMessage(
          `Hi ${customerName},\n\nPlease find your invoice ${invoiceNumber} for ₹${amount.toFixed(2)}.\n\nPay now: ${result.short_url}\n\nThank you for your business!`
        );
        toast.success('Payment link generated successfully');
      } else {
        toast.error('Failed to generate payment link');
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast.error('Failed to generate payment link');
    } finally {
      setGeneratingPaymentLink(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('invoices')
        .update({ status: 'sent', sent_date: new Date().toISOString() })
        .eq('id', invoiceId);

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(message);

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile
        ? `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`
        : `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      window.location.href = whatsappUrl;

      setTimeout(() => {
        toast.success('Opening WhatsApp...');
        onStatusUpdate();
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast.error('Failed to share via WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailShare = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    try {
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Invoice ${invoiceNumber}</h2>
              <div style="white-space: pre-wrap;">${message}</div>
              ${paymentLink ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
                  <p style="margin: 0 0 10px 0;">You can pay online using the link below:</p>
                  <a href="${paymentLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Pay Now</a>
                </div>
              ` : ''}
              <p style="margin-top: 20px; color: #666; font-size: 14px;">Thank you for your business!</p>
            </div>
          </body>
        </html>
      `;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject: `Invoice ${invoiceNumber}`,
            html: emailHtml,
            invoiceNumber
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      await supabase
        .from('invoices')
        .update({ status: 'sent', sent_date: new Date().toISOString() })
        .eq('id', invoiceId);

      toast.success('Email sent successfully');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error sharing via email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Invoice">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Your invoice includes your UPI ID for easy payments. Customers can scan the QR code or use your UPI ID to pay directly.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">PDF Invoice</p>
              <p className="text-xs text-gray-500">
                {pdfUrl ? 'Ready to share' : 'Generating PDF...'}
              </p>
            </div>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <FileDown className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        </div>

        {paymentLink && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-1">Payment Link:</p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {paymentLink}
            </a>
          </div>
        )}

        {!paymentLink && (
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Advanced: Generate Online Payment Link (Optional)
            </summary>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-600 mb-3">
                Requires Razorpay account setup. Customers can pay with UPI, cards, or net banking.
              </p>
              <Button
                onClick={handleGeneratePaymentLink}
                loading={generatingPaymentLink}
                variant="outline"
                size="sm"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Generate Payment Link
              </Button>
            </div>
          </details>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShareMethod('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              shareMethod === 'whatsapp'
                ? 'border-green-600 bg-green-50 text-green-900'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">WhatsApp</span>
          </button>
          <button
            onClick={() => setShareMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              shareMethod === 'email'
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email</span>
          </button>
        </div>

        {shareMethod === 'whatsapp' && (
          <>
            <Input
              label="Customer Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="10-digit number"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleWhatsAppShare} loading={loading} className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send via WhatsApp
            </Button>
          </>
        )}

        {shareMethod === 'email' && (
          <>
            <Input
              label="Customer Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <Input
                value={`Invoice ${invoiceNumber}`}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleEmailShare} loading={loading} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send via Email
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
