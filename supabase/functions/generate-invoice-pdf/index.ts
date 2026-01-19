import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsPDF } from "npm:jspdf@2.5.2";
import QRCode from "npm:qrcode@1.5.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvoiceData {
  invoice: {
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
  };
  items: Array<{
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
  }>;
  profile: {
    company_name: string;
    company_address: string;
    gstin: string | null;
    company_logo_url: string | null;
    upi_id: string | null;
  };
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function generateUPIQRCode(upiId: string, name: string, amount: number, invoiceNumber: string): Promise<string | null> {
  try {
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`;

    const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

async function generateInvoicePDF(data: InvoiceData): Promise<jsPDF> {
  const { invoice, items, profile } = data;
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  let y = margin;

  pdf.setLineWidth(0.5);
  pdf.rect(margin, margin, pageWidth - 2 * margin, pdf.internal.pageSize.getHeight() - 2 * margin);

  if (profile.company_logo_url) {
    try {
      const logoResponse = await fetch(profile.company_logo_url);
      const logoBlob = await logoResponse.arrayBuffer();
      const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBlob)));
      const logoExt = profile.company_logo_url.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';

      const logoWidth = 25;
      const logoHeight = 25;
      const logoX = margin + 5;
      y += 8;
      pdf.addImage(`data:image/${logoExt.toLowerCase()};base64,${logoBase64}`, logoExt, logoX, y, logoWidth, logoHeight);
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  y += 8;
  pdf.text(profile.company_name.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  y += 5;
  pdf.text(profile.company_address, pageWidth / 2, y, { align: 'center' });

  y += 5;
  pdf.text(`GSTN: ${profile.gstin || 'N/A'}`, pageWidth / 2, y, { align: 'center' });

  if (profile.company_logo_url) {
    y += 7;
  } else {
    y += 7;
  }
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  y += 6;
  pdf.text('Original Tax Invoice', pageWidth / 2, y, { align: 'center' });

  y += 7;
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  const col1X = margin + 2;
  const col2X = pageWidth / 2 + 2;
  const sectionTop = y;

  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice No:', col1X, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.invoice_number, col1X + 25, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Transport Mode:', col2X, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.transport_mode, col2X + 30, y);

  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date:', col1X, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(invoice.invoice_date), col1X + 25, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Vehicle Number:', col2X, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.vehicle_number || 'N/A', col2X + 30, y);

  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reverse Charge:', col1X, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.reverse_charge ? 'YES' : 'NO', col1X + 25, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Place of Supply:', col2X, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.place_of_supply, col2X + 30, y);

  y += 7;
  pdf.line(margin, sectionTop, pageWidth / 2, sectionTop);
  pdf.line(pageWidth / 2, sectionTop, pageWidth / 2, y);
  pdf.line(margin, y, pageWidth - margin, y);

  const billShipTop = y;
  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To Party', col1X, y);
  pdf.text('Ship to Party', col2X, y);

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${invoice.bill_to_name}`, col1X, y);
  pdf.text(`Name: ${invoice.ship_to_name}`, col2X, y);

  y += 5;
  const billLines = pdf.splitTextToSize(`Address: ${invoice.bill_to_address}`, 85);
  const shipLines = pdf.splitTextToSize(`Address: ${invoice.ship_to_address}`, 85);
  pdf.text(billLines, col1X, y);
  pdf.text(shipLines, col2X, y);

  y += billLines.length * 4 + 2;
  pdf.text(`GSTIN: ${invoice.bill_to_gstin || 'N/A'}`, col1X, y);
  pdf.text(`GSTIN: ${invoice.ship_to_gstin || 'N/A'}`, col2X, y);

  y += 5;
  pdf.text(`State: ${invoice.bill_to_state} Code: ${invoice.bill_to_state_code || 'N/A'}`, col1X, y);
  pdf.text(`State: ${invoice.ship_to_state} Code: ${invoice.ship_to_state_code || 'N/A'}`, col2X, y);

  y += 7;
  pdf.line(margin, billShipTop, pageWidth / 2, billShipTop);
  pdf.line(pageWidth / 2, billShipTop, pageWidth / 2, y);
  pdf.line(margin, y, pageWidth - margin, y);

  const tableTop = y;
  y += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);

  const colWidths = [8, 35, 16, 12, 12, 14, 13, 16, 10, 12, 16];
  let x = margin + 2;

  pdf.text('S.No', x, y);
  x += colWidths[0];
  pdf.text('Product Description', x, y);
  x += colWidths[1];
  pdf.text('Students/Staff', x, y);
  x += colWidths[2];
  pdf.text('Qty', x + 4, y);
  x += colWidths[3];
  pdf.text('Rate', x + 5, y);
  x += colWidths[4];
  pdf.text('Amount', x + 5, y);
  x += colWidths[5];
  pdf.text('HSN', x + 4, y);
  x += colWidths[6];
  pdf.text('Tax Value', x + 5, y);
  x += colWidths[7];
  pdf.text('Rate', x + 3, y);
  x += colWidths[8];
  pdf.text('GST', x + 3, y);
  x += colWidths[9];
  pdf.text('Total', x + 5, y);

  y += 5;
  pdf.line(margin, tableTop, pageWidth - margin, tableTop);
  pdf.line(margin, y, pageWidth - margin, y);

  pdf.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    if (y > 250) {
      pdf.addPage();
      y = margin + 10;
    }

    y += 5;
    x = margin + 2;

    pdf.text(String(index + 1), x + 2, y);
    x += colWidths[0];

    const descLines = pdf.splitTextToSize(item.product_description, colWidths[1] - 2);
    pdf.text(descLines, x, y);
    x += colWidths[1];

    pdf.text(item.students_staff || '-', x + 4, y);
    x += colWidths[2];

    pdf.text(item.quantity.toFixed(2), x + 5, y);
    x += colWidths[3];

    pdf.text(item.rate.toFixed(2), x + 6, y);
    x += colWidths[4];

    pdf.text(item.amount.toFixed(2), x + 6, y);
    x += colWidths[5];

    pdf.text(item.hsn_code || '-', x + 4, y);
    x += colWidths[6];

    pdf.text(item.taxable_value.toFixed(2), x + 6, y);
    x += colWidths[7];

    pdf.text(`${item.gst_rate}%`, x + 3, y);
    x += colWidths[8];

    pdf.text((item.cgst + item.sgst).toFixed(2), x + 4, y);
    x += colWidths[9];

    pdf.text((item.taxable_value + item.cgst + item.sgst).toFixed(2), x + 6, y);

    const lineHeight = Math.max(descLines.length * 4, 5);
    y += lineHeight;
    pdf.line(margin, y, pageWidth - margin, y);
  });

  pdf.setFont('helvetica', 'bold');
  y += 5;
  x = margin + 2;

  pdf.text('Total', x + colWidths[0] + 18, y);
  x += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
  pdf.text(invoice.subtotal.toFixed(2), x + 6, y);
  x += colWidths[5] + colWidths[6];
  pdf.text(invoice.subtotal.toFixed(2), x + 6, y);
  x += colWidths[7] + colWidths[8];
  pdf.text(invoice.total_tax.toFixed(2), x + 4, y);
  x += colWidths[9];
  pdf.text(invoice.grand_total.toFixed(2), x + 6, y);

  y += 7;
  pdf.line(margin, y, pageWidth - margin, y);

  const amountInWords = numberToWords(Math.floor(invoice.grand_total));

  const summaryTop = y;
  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Invoice amount in words', col1X, y);

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  const wordsLines = pdf.splitTextToSize(amountInWords, 85);
  pdf.text(wordsLines, col1X, y);

  let yRight = summaryTop + 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Total Amount before Tax:`, col2X, yRight);
  pdf.text(invoice.subtotal.toFixed(2), pageWidth - margin - 20, yRight);

  yRight += 5;
  pdf.text(`CGST 2.5%:`, col2X, yRight);
  pdf.text(invoice.cgst_total.toFixed(2), pageWidth - margin - 20, yRight);

  yRight += 5;
  pdf.text(`SGST 2.5%:`, col2X, yRight);
  pdf.text(invoice.sgst_total.toFixed(2), pageWidth - margin - 20, yRight);

  yRight += 5;
  pdf.text(`Total Tax Amount:`, col2X, yRight);
  pdf.text(invoice.total_tax.toFixed(2), pageWidth - margin - 20, yRight);

  yRight += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Amount after Tax:`, col2X, yRight);
  pdf.text(invoice.grand_total.toFixed(2), pageWidth - margin - 20, yRight);

  y = Math.max(y + wordsLines.length * 3 + 5, yRight + 7);
  pdf.line(margin, summaryTop, pageWidth / 2, summaryTop);
  pdf.line(pageWidth / 2, summaryTop, pageWidth / 2, y);
  pdf.line(margin, y, pageWidth - margin, y);

  const bankTop = y;
  y += 5;

  let qrCodeDataUrl: string | null = null;
  if (profile.upi_id) {
    qrCodeDataUrl = await generateUPIQRCode(profile.upi_id, profile.company_name, invoice.grand_total, invoice.invoice_number);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);

  if (profile.upi_id && qrCodeDataUrl) {
    pdf.text('Payment Details', col1X, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`UPI ID: ${profile.upi_id}`, col1X, y);
    y += 5;

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scan to Pay:', col1X, y);
    y += 3;

    try {
      const qrSize = 30;
      pdf.addImage(qrCodeDataUrl, 'PNG', col1X, y, qrSize, qrSize);
      y += qrSize + 3;
    } catch (error) {
      console.error('Failed to add QR code to PDF:', error);
    }

    if (invoice.bank_name) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bank Details', col1X, y);
      y += 5;
    }
  } else if (invoice.bank_name) {
    pdf.text('Bank Details', col1X, y);
    y += 5;
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  if (invoice.bank_name) {
    pdf.text(`Bank Name: ${invoice.bank_name}`, col1X, y);
    y += 5;
    if (invoice.account_number) {
      pdf.text(`Bank A/C: ${invoice.account_number}`, col1X, y);
      y += 5;
    }
    if (invoice.ifsc_code) {
      pdf.text(`Bank IFSC: ${invoice.ifsc_code}`, col1X, y);
      y += 5;
    }
  }

  if (invoice.terms_conditions) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Terms & Conditions', col1X, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    const termsLines = pdf.splitTextToSize(invoice.terms_conditions, 85);
    pdf.text(termsLines, col1X, y);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(`For ${profile.company_name}`, pageWidth - margin - 50, bankTop + 8);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Authorised signatory', pageWidth - margin - 50, bankTop + 28);

  const bankBottom = Math.max(y + 10, bankTop + 35);
  pdf.line(margin, bankTop, pageWidth / 2, bankTop);
  pdf.line(pageWidth / 2, bankTop, pageWidth / 2, bankBottom);
  pdf.line(margin, bankBottom, pageWidth - margin, bankBottom);

  return pdf;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const invoiceData: InvoiceData = await req.json();

    const pdf = await generateInvoicePDF(invoiceData);
    const pdfBuffer = pdf.output('arraybuffer');

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=\"Invoice-${invoiceData.invoice.invoice_number}.pdf\"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
