import { format } from 'date-fns';

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
    company_logo_url?: string | null;
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

export function printInvoice(data: InvoiceData): void {
  const { invoice, items, profile } = data;
  const amountInWords = numberToWords(Math.floor(invoice.grand_total));

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Please allow pop-ups to print invoices');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
          background: #fff;
          padding: 20px;
        }
        .invoice {
          border: 2px solid #000;
          padding: 10px;
          max-width: 210mm;
          margin: 0 auto;
          background: white;
        }
        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .logo-container {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .header-text {
          text-align: center;
          flex: 1;
        }
        .company-name {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .title {
          font-size: 14pt;
          font-weight: bold;
          margin: 8px 0;
          text-align: center;
          border-bottom: 2px solid #000;
          padding: 8px 0;
        }
        .section {
          border: 1px solid #000;
          margin-bottom: 0;
          border-top: none;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .col {
          padding: 10px;
          border-right: 1px solid #000;
        }
        .col:last-child {
          border-right: none;
        }
        .row {
          margin-bottom: 5px;
          line-height: 1.5;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          min-width: 120px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          border: 1px solid #000;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 4px;
          text-align: left;
          font-size: 9pt;
        }
        th {
          font-weight: bold;
          background: #f0f0f0;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .summary {
          border-top: none;
          margin-top: 0;
        }
        .bank-section {
          min-height: 100px;
        }
        .signature {
          text-align: right;
          padding: 20px;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice {
            border: 2px solid #000;
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          ${profile.company_logo_url ? `
            <div class="logo-container">
              <img src="${profile.company_logo_url}" alt="${profile.company_name}" />
            </div>
          ` : ''}
          <div class="header-text">
            <div class="company-name">${profile.company_name.toUpperCase()}</div>
            <div>${profile.company_address}</div>
            <div>GSTN: ${profile.gstin || 'N/A'}</div>
          </div>
          ${profile.company_logo_url ? '<div style="width: 60px;"></div>' : ''}
        </div>

        <div class="title text-center">Original Tax Invoice</div>

        <div class="section two-col">
          <div class="col">
            <div class="row"><span class="label">Invoice No:</span> ${invoice.invoice_number}</div>
            <div class="row"><span class="label">Invoice Date:</span> ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</div>
            <div class="row"><span class="label">Reverse Charge:</span> ${invoice.reverse_charge ? 'YES' : 'NO'}</div>
          </div>
          <div class="col">
            <div class="row"><span class="label">Transport Mode:</span> ${invoice.transport_mode}</div>
            <div class="row"><span class="label">Vehicle Number:</span> ${invoice.vehicle_number || 'N/A'}</div>
            <div class="row"><span class="label">Place of Supply:</span> ${invoice.place_of_supply}</div>
          </div>
        </div>

        <div class="section two-col">
          <div class="col">
            <div style="font-weight: bold; margin-bottom: 6px;">Bill To Party</div>
            <div class="row">Name: ${invoice.bill_to_name}</div>
            <div class="row">Address: ${invoice.bill_to_address}</div>
            <div class="row">GSTIN: ${invoice.bill_to_gstin || 'N/A'}</div>
            <div class="row">State: ${invoice.bill_to_state} Code: ${invoice.bill_to_state_code || 'N/A'}</div>
          </div>
          <div class="col">
            <div style="font-weight: bold; margin-bottom: 6px;">Ship to Party</div>
            <div class="row">Name: ${invoice.ship_to_name}</div>
            <div class="row">Address: ${invoice.ship_to_address}</div>
            <div class="row">GSTIN: ${invoice.ship_to_gstin || 'N/A'}</div>
            <div class="row">State: ${invoice.ship_to_state} Code: ${invoice.ship_to_state_code || 'N/A'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">S.No</th>
              <th>Product Description</th>
              <th style="width: 80px;">Students/Staff</th>
              <th style="width: 60px;" class="text-right">Rate</th>
              <th style="width: 60px;" class="text-right">Amount</th>
              <th style="width: 50px;">HSN</th>
              <th style="width: 70px;" class="text-right">Tax Value</th>
              <th style="width: 50px;">GST %</th>
              <th style="width: 60px;" class="text-right">GST</th>
              <th style="width: 70px;" class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.product_description}</td>
                <td>${item.students_staff || '-'}</td>
                <td class="text-right">${item.rate.toFixed(2)}</td>
                <td class="text-right">${item.amount.toFixed(2)}</td>
                <td class="text-center">${item.hsn_code || '-'}</td>
                <td class="text-right">${item.taxable_value.toFixed(2)}</td>
                <td class="text-center">${item.gst_rate}%</td>
                <td class="text-right">${(item.cgst + item.sgst).toFixed(2)}</td>
                <td class="text-right">${(item.taxable_value + item.cgst + item.sgst).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="4" class="text-right">Total</td>
              <td class="text-right">${invoice.subtotal.toFixed(2)}</td>
              <td></td>
              <td class="text-right">${invoice.subtotal.toFixed(2)}</td>
              <td></td>
              <td class="text-right">${invoice.total_tax.toFixed(2)}</td>
              <td class="text-right">${invoice.grand_total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="section two-col summary">
          <div class="col">
            <div style="font-weight: bold; margin-bottom: 6px;">Total Invoice Amount in Words</div>
            <div style="font-size: 8pt;">${amountInWords}</div>
          </div>
          <div class="col">
            <div class="row">Total Amount before Tax: <span style="float: right;">${invoice.subtotal.toFixed(2)}</span></div>
            <div class="row">CGST 2.5%: <span style="float: right;">${invoice.cgst_total.toFixed(2)}</span></div>
            <div class="row">SGST 2.5%: <span style="float: right;">${invoice.sgst_total.toFixed(2)}</span></div>
            <div class="row">Total Tax Amount: <span style="float: right;">${invoice.total_tax.toFixed(2)}</span></div>
            <div class="row" style="font-weight: bold; border-top: 1px solid #000; margin-top: 4px; padding-top: 4px;">
              Total Amount after Tax: <span style="float: right;">${invoice.grand_total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="section two-col bank-section">
          <div class="col">
            <div style="font-weight: bold; margin-bottom: 6px;">Bank Details</div>
            ${invoice.bank_name ? `
              <div class="row">Bank Name: ${invoice.bank_name}</div>
              ${invoice.account_number ? `<div class="row">Bank A/C: ${invoice.account_number}</div>` : ''}
              ${invoice.ifsc_code ? `<div class="row">Bank IFSC: ${invoice.ifsc_code}</div>` : ''}
            ` : ''}
            ${invoice.terms_conditions ? `
              <div style="font-weight: bold; margin-top: 10px; margin-bottom: 4px;">Terms & Conditions</div>
              <div style="font-size: 8pt;">${invoice.terms_conditions}</div>
            ` : ''}
          </div>
          <div class="col signature">
            <div style="font-weight: bold; margin-bottom: 40px;">For ${profile.company_name}</div>
            <div style="font-size: 8pt;">Authorised Signatory</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
