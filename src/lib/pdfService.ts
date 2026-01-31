import html2pdf from 'html2pdf.js';
import { supabase } from './supabase';

interface UPIPaymentInfo {
  upiId: string;
  name: string;
  amount: number;
  invoiceNumber: string;
}

async function generateQRCode(paymentInfo: UPIPaymentInfo): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-qr-code`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentInfo),
  });

  if (!response.ok) {
    throw new Error('Failed to generate QR code');
  }

  const { qrCodeDataUrl } = await response.json();
  return qrCodeDataUrl;
}

interface GeneratePDFOptions {
  invoiceId: string;
  userId: string;
  invoiceNumber: string;
  htmlContent: string;
}

export async function generateAndUploadInvoicePDF(options: GeneratePDFOptions): Promise<string | null> {
  const { invoiceId, userId, invoiceNumber, htmlContent } = options;

  try {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '800px';
    element.style.background = 'white';
    element.style.padding = '20px';
    document.body.appendChild(element);

    const images = element.getElementsByTagName('img');
    if (images.length > 0) {
      await Promise.all(
        Array.from(images).map(img => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
              setTimeout(() => resolve(true), 3000);
            }
          });
        })
      );
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
      margin: 10,
      filename: `invoice-${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

    document.body.removeChild(element);

    const fileName = `${userId}/${invoiceId}/invoice-${invoiceNumber}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('invoice-pdfs')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('invoice-pdfs')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

export async function getInvoiceHTMLWithQR(invoice: any, items: any[], profile: any): Promise<string> {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  let qrCodeDataUrl = '';
  if (profile.upi_id) {
    try {
      qrCodeDataUrl = await generateQRCode({
        upiId: profile.upi_id,
        name: profile.company_name,
        amount: invoice.grand_total,
        invoiceNumber: invoice.invoice_number
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.3; background: white; }
        .invoice { border: 2px solid #000; padding: 15px; background: white; width: 100%; }
        .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; text-align: center; }
        .company-logo { max-width: 70px; max-height: 70px; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto; }
        .company-name { font-size: 18pt; font-weight: bold; margin-bottom: 4px; }
        .title { font-size: 14pt; font-weight: bold; text-align: center; background: #e8e8e8; padding: 8px; margin: 8px 0; border: 1px solid #000; }
        .info-section { border: 1px solid #000; margin: 8px 0; overflow: hidden; box-sizing: border-box; }
        .info-row { display: table; width: 100%; table-layout: fixed; }
        .info-col { display: table-cell; width: 50%; max-width: 50%; padding: 8px; border-right: 1px solid #000; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; overflow: hidden; }
        .info-col:last-child { border-right: none; }
        .row { margin-bottom: 4px; font-size: 10pt; word-wrap: break-word; overflow-wrap: break-word; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th, td { border: 1px solid #000; padding: 6px 4px; font-size: 10pt; }
        th { background: #e8e8e8; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: bold; background: #f5f5f5; }
        .summary-section { border: 1px solid #000; margin: 8px 0; overflow: hidden; box-sizing: border-box; }
        .terms-section { border: 1px solid #000; margin: 8px 0; padding: 8px; border-top: none; overflow: hidden; box-sizing: border-box; }
        .terms-text { font-size: 9pt; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; line-height: 1.4; max-width: 100%; }
        .signature { text-align: right; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; }
        .qr-code { max-width: 120px; max-height: 120px; display: block; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          ${profile.company_logo_url ? `<img src="${profile.company_logo_url}" class="company-logo" crossorigin="anonymous" />` : ''}
          <div class="company-name">${profile.company_name}</div>
          <div style="font-size: 10pt;">${profile.company_address}</div>
          ${profile.gstin ? `<div style="font-size: 10pt;">GSTIN: ${profile.gstin}</div>` : ''}
        </div>

        <div class="title">TAX INVOICE</div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-col">
              <div class="row"><span class="label">Invoice #:</span> ${invoice.invoice_number}</div>
              <div class="row"><span class="label">Date:</span> ${formatDate(invoice.invoice_date)}</div>
              <div class="row"><span class="label">Status:</span> ${invoice.status.toUpperCase()}</div>
            </div>
            <div class="info-col">
              <div class="row"><span class="label">Bill To:</span></div>
              <div class="row">${invoice.bill_to_name}</div>
              <div class="row">${invoice.bill_to_address}</div>
              <div class="row">${invoice.bill_to_state}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;" class="text-center">No.</th>
              <th>Description</th>
              <th style="width: 70px;" class="text-right">Rate</th>
              <th style="width: 50px;" class="text-center">Qty</th>
              <th style="width: 80px;" class="text-right">Amount</th>
              <th style="width: 70px;" class="text-right">Tax</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.product_description}${item.hsn_code ? '<br/><span style="font-size: 9pt; color: #666;">HSN: ' + item.hsn_code + '</span>' : ''}</td>
                <td class="text-right">Rs.${item.rate.toFixed(2)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">Rs.${item.amount.toFixed(2)}</td>
                <td class="text-right"><span style="font-size: 9pt;">GST ${item.gst_rate}%</span><br/>Rs.${(item.cgst + item.sgst).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="info-row">
            <div class="info-col">
              ${profile.upi_id ? `
                <div class="row"><span class="label">Payment via UPI:</span></div>
                <div class="row" style="word-break: break-all;">${profile.upi_id}</div>
                ${qrCodeDataUrl ? `
                  <div style="margin-top: 8px;">
                    <div style="font-size: 9pt; font-weight: bold; margin-bottom: 4px;">Scan to Pay:</div>
                    <img src="${qrCodeDataUrl}" class="qr-code" />
                  </div>
                ` : ''}
              ` : ''}
              ${invoice.bank_name ? `
                <div class="row" style="margin-top: ${profile.upi_id ? '10px' : '0'}"><span class="label">Bank Details:</span></div>
                <div class="row" style="word-break: break-all;">Bank: ${invoice.bank_name}</div>
                ${invoice.account_number ? `<div class="row" style="word-break: break-all;">A/C: ${invoice.account_number}</div>` : ''}
                ${invoice.ifsc_code ? `<div class="row" style="word-break: break-all;">IFSC: ${invoice.ifsc_code}</div>` : ''}
              ` : ''}
            </div>
            <div class="info-col">
              <div class="row">Subtotal: <span style="float: right;">Rs.${invoice.subtotal.toFixed(2)}</span></div>
              <div class="row">CGST: <span style="float: right;">Rs.${invoice.cgst_total.toFixed(2)}</span></div>
              <div class="row">SGST: <span style="float: right;">Rs.${invoice.sgst_total.toFixed(2)}</span></div>
              <div class="row" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #000; font-weight: bold;">
                Total: <span style="float: right;">Rs.${invoice.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        ${invoice.terms_conditions ? `
          <div class="terms-section">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 10pt;">Terms & Conditions:</div>
            <div class="terms-text">${invoice.terms_conditions}</div>
          </div>
        ` : ''}

        <div class="signature">
          <div style="font-weight: bold; font-size: 11pt;">For ${profile.company_name}</div>
          <div style="margin-top: 30px; font-size: 9pt; color: #666;">Authorised Signatory</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getInvoiceHTML(invoice: any, items: any[], profile: any): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.3; background: white; }
        .invoice { border: 2px solid #000; padding: 15px; background: white; width: 100%; }
        .header { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; text-align: center; }
        .company-logo { max-width: 70px; max-height: 70px; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto; }
        .company-name { font-size: 18pt; font-weight: bold; margin-bottom: 4px; }
        .title { font-size: 14pt; font-weight: bold; text-align: center; background: #e8e8e8; padding: 8px; margin: 8px 0; border: 1px solid #000; }
        .info-section { border: 1px solid #000; margin: 8px 0; overflow: hidden; box-sizing: border-box; }
        .info-row { display: table; width: 100%; table-layout: fixed; }
        .info-col { display: table-cell; width: 50%; max-width: 50%; padding: 8px; border-right: 1px solid #000; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; overflow: hidden; }
        .info-col:last-child { border-right: none; }
        .row { margin-bottom: 4px; font-size: 10pt; word-wrap: break-word; overflow-wrap: break-word; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th, td { border: 1px solid #000; padding: 6px 4px; font-size: 10pt; }
        th { background: #e8e8e8; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: bold; background: #f5f5f5; }
        .summary-section { border: 1px solid #000; margin: 8px 0; overflow: hidden; box-sizing: border-box; }
        .terms-section { border: 1px solid #000; margin: 8px 0; padding: 8px; border-top: none; overflow: hidden; box-sizing: border-box; }
        .terms-text { font-size: 9pt; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; line-height: 1.4; max-width: 100%; }
        .signature { text-align: right; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          ${profile.company_logo_url ? `<img src="${profile.company_logo_url}" class="company-logo" crossorigin="anonymous" />` : ''}
          <div class="company-name">${profile.company_name}</div>
          <div style="font-size: 10pt;">${profile.company_address}</div>
          ${profile.gstin ? `<div style="font-size: 10pt;">GSTIN: ${profile.gstin}</div>` : ''}
        </div>

        <div class="title">TAX INVOICE</div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-col">
              <div class="row"><span class="label">Invoice #:</span> ${invoice.invoice_number}</div>
              <div class="row"><span class="label">Date:</span> ${formatDate(invoice.invoice_date)}</div>
              <div class="row"><span class="label">Status:</span> ${invoice.status.toUpperCase()}</div>
            </div>
            <div class="info-col">
              <div class="row"><span class="label">Bill To:</span></div>
              <div class="row">${invoice.bill_to_name}</div>
              <div class="row">${invoice.bill_to_address}</div>
              <div class="row">${invoice.bill_to_state}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;" class="text-center">No.</th>
              <th>Description</th>
              <th style="width: 70px;" class="text-right">Rate</th>
              <th style="width: 50px;" class="text-center">Qty</th>
              <th style="width: 80px;" class="text-right">Amount</th>
              <th style="width: 70px;" class="text-right">Tax</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.product_description}${item.hsn_code ? '<br/><span style="font-size: 9pt; color: #666;">HSN: ' + item.hsn_code + '</span>' : ''}</td>
                <td class="text-right">Rs.${item.rate.toFixed(2)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">Rs.${item.amount.toFixed(2)}</td>
                <td class="text-right"><span style="font-size: 9pt;">GST ${item.gst_rate}%</span><br/>Rs.${(item.cgst + item.sgst).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="info-row">
            <div class="info-col">
              ${invoice.bank_name ? `
                <div class="row"><span class="label">Payment Details:</span></div>
                <div class="row" style="word-break: break-all;">Bank: ${invoice.bank_name}</div>
                ${invoice.account_number ? `<div class="row" style="word-break: break-all;">A/C: ${invoice.account_number}</div>` : ''}
                ${invoice.ifsc_code ? `<div class="row" style="word-break: break-all;">IFSC: ${invoice.ifsc_code}</div>` : ''}
                ${profile.upi_id ? `<div class="row" style="word-break: break-all;">UPI: ${profile.upi_id}</div>` : ''}
              ` : (profile.upi_id ? `<div class="row" style="word-break: break-all;"><span class="label">UPI:</span> ${profile.upi_id}</div>` : '')}
            </div>
            <div class="info-col">
              <div class="row">Subtotal: <span style="float: right;">Rs.${invoice.subtotal.toFixed(2)}</span></div>
              <div class="row">CGST: <span style="float: right;">Rs.${invoice.cgst_total.toFixed(2)}</span></div>
              <div class="row">SGST: <span style="float: right;">Rs.${invoice.sgst_total.toFixed(2)}</span></div>
              <div class="row" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #000; font-weight: bold;">
                Total: <span style="float: right;">Rs.${invoice.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        ${invoice.terms_conditions ? `
          <div class="terms-section">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 10pt;">Terms & Conditions:</div>
            <div class="terms-text">${invoice.terms_conditions}</div>
          </div>
        ` : ''}

        <div class="signature">
          <div style="font-weight: bold; font-size: 11pt;">For ${profile.company_name}</div>
          <div style="margin-top: 30px; font-size: 9pt; color: #666;">Authorised Signatory</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
