export interface PartyDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
  state_code: string;
}

export interface InvoiceItemForm {
  id: string;
  product_description: string;
  hsn_code: string;
  rate: number;
  quantity: number;
  amount: number;
  gst_rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
}

export interface InvoiceFormData {
  invoice_number: string;
  invoice_date: string;
  transport_mode: string;
  vehicle_number: string;
  reverse_charge: boolean;
  place_of_supply: string;
  bill_to: PartyDetails;
  ship_to: PartyDetails;
  items: InvoiceItemForm[];
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  terms_conditions: string;
}

export interface InvoiceTotals {
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  total_tax: number;
  grand_total: number;
}
