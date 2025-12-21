import { format } from 'date-fns';
import type { InvoiceItemForm, InvoiceTotals } from '../types/invoice.types';

export function calculateItemAmount(rate: number, quantity: number): number {
  return Number((rate * quantity).toFixed(2));
}

export function calculateGST(amount: number, gstRate: number): { cgst: number; sgst: number; total: number } {
  const gstAmount = (amount * gstRate) / 100;
  const cgst = Number((gstAmount / 2).toFixed(2));
  const sgst = Number((gstAmount / 2).toFixed(2));
  return {
    cgst,
    sgst,
    total: Number((cgst + sgst).toFixed(2))
  };
}

export function calculateItemTotals(rate: number, quantity: number, gstRate: number) {
  const amount = calculateItemAmount(rate, quantity);
  const taxableValue = amount;
  const { cgst, sgst } = calculateGST(taxableValue, gstRate);
  const total = Number((taxableValue + cgst + sgst).toFixed(2));

  return {
    amount,
    taxableValue,
    cgst,
    sgst,
    total
  };
}

export function calculateInvoiceTotals(items: InvoiceItemForm[]): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + item.taxable_value, 0);
  const cgst_total = items.reduce((sum, item) => sum + item.cgst, 0);
  const sgst_total = items.reduce((sum, item) => sum + item.sgst, 0);
  const total_tax = cgst_total + sgst_total;
  const grand_total = subtotal + total_tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    cgst_total: Number(cgst_total.toFixed(2)),
    sgst_total: Number(sgst_total.toFixed(2)),
    total_tax: Number(total_tax.toFixed(2)),
    grand_total: Number(grand_total.toFixed(2))
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
}

export function generateInvoiceNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `${prefix}-${year}-${paddedSequence}`;
}

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';

  let result = '';

  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }

  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + ' ';
    return result;
  }

  if (num > 0) {
    result += ones[num] + ' ';
  }

  return result;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Only';

  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;

  const lakh = Math.floor(amount / 100000);
  amount %= 100000;

  const thousand = Math.floor(amount / 1000);
  amount %= 1000;

  const remainder = amount;

  let result = '';

  if (crore > 0) {
    result += convertLessThanThousand(crore) + 'Crore ';
  }

  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + 'Lakh ';
  }

  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + 'Thousand ';
  }

  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }

  return result.trim() + ' Only';
}

export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

export function validateMobile(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
