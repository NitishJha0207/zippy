import html2pdf from 'html2pdf.js';
import { supabase } from './supabase';

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
    document.body.appendChild(element);

    const opt = {
      margin: 10,
      filename: `invoice-${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');

    document.body.removeChild(element);

    const fileName = `${userId}/${invoiceId}/invoice-${invoiceNumber}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
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
        body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; }
        .invoice { border: 2px solid #000; padding: 20px; max-width: 800px; }
        .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; text-align: center; }
        .company-name { font-size: 20pt; font-weight: bold; margin-bottom: 5px; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #000; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #000; margin: 10px 0; }
        .col { padding: 10px; border-right: 1px solid #000; }
        .col:last-child { border-right: none; }
        .row { margin-bottom: 5px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary { border: 1px solid #000; padding: 10px; margin: 10px 0; }
        .total-row { font-weight: bold; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          ${profile.company_logo_url ? `<img src="${profile.company_logo_url}" style="max-width: 80px; max-height: 80px; margin-bottom: 10px;" />` : ''}
          <div class="company-name">${profile.company_name}</div>
          <div>${profile.company_address}</div>
          ${profile.gstin ? `<div>GSTIN: ${profile.gstin}</div>` : ''}
        </div>

        <div class="title">TAX INVOICE</div>

        <div class="two-col">
          <div class="col">
            <div class="row"><span class="label">Invoice #:</span> ${invoice.invoice_number}</div>
            <div class="row"><span class="label">Date:</span> ${formatDate(invoice.invoice_date)}</div>
            <div class="row"><span class="label">Status:</span> ${invoice.status.toUpperCase()}</div>
          </div>
          <div class="col">
            <div class="label">Bill To:</div>
            <div>${invoice.bill_to_name}</div>
            <div>${invoice.bill_to_address}</div>
            <div>${invoice.bill_to_state}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">No.</th>
              <th>Item Description</th>
              <th style="width: 80px;" class="text-right">Rate</th>
              <th style="width: 60px;" class="text-right">Qty</th>
              <th style="width: 100px;" class="text-right">Amount</th>
              <th style="width: 80px;" class="text-right">Tax</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                  ${item.product_description}
                  ${item.hsn_code ? `<br/><small>HSN: ${item.hsn_code}</small>` : ''}
                </td>
                <td class="text-right">₹${item.rate.toFixed(2)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₹${item.amount.toFixed(2)}</td>
                <td class="text-right">
                  <small>GST ${item.gst_rate}%</small><br/>
                  ₹${(item.cgst + item.sgst).toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="two-col">
          <div class="col">
            ${invoice.bank_name ? `
              <div class="label">Payment Details:</div>
              <div class="row">Bank: ${invoice.bank_name}</div>
              ${invoice.account_number ? `<div class="row">Account: ${invoice.account_number}</div>` : ''}
              ${invoice.ifsc_code ? `<div class="row">IFSC: ${invoice.ifsc_code}</div>` : ''}
            ` : ''}
            ${profile.upi_id ? `<div class="row">UPI: ${profile.upi_id}</div>` : ''}
          </div>
          <div class="col">
            <div class="row">Subtotal: <span style="float: right;">₹${invoice.subtotal.toFixed(2)}</span></div>
            <div class="row">CGST: <span style="float: right;">₹${invoice.cgst_total.toFixed(2)}</span></div>
            <div class="row">SGST: <span style="float: right;">₹${invoice.sgst_total.toFixed(2)}</span></div>
            <div class="row total-row" style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #000;">
              <strong>Total: <span style="float: right;">₹${invoice.grand_total.toFixed(2)}</span></strong>
            </div>
          </div>
        </div>

        <div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
          <div style="font-weight: bold;">For ${profile.company_name}</div>
          <div style="margin-top: 40px; font-size: 10pt;">Authorised Signatory</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
