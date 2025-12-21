export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      invoice_items: {
        Row: InvoiceItem;
        Insert: Omit<InvoiceItem, 'id' | 'created_at'>;
        Update: Partial<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>>;
      };
      invoice_sequence: {
        Row: InvoiceSequence;
        Insert: Omit<InvoiceSequence, 'updated_at'>;
        Update: Partial<Omit<InvoiceSequence, 'user_id' | 'updated_at'>>;
      };
    };
  };
}

export interface Profile {
  id: string;
  user_name: string;
  mobile_number: string;
  email: string;
  company_name: string;
  company_address: string;
  gstin: string | null;
  company_logo_url: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  default_terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string | null;
  state: string;
  state_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  invoice_date: string;
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
  transport_mode: string | null;
  vehicle_number: string | null;
  reverse_charge: boolean;
  place_of_supply: string;
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  total_tax: number;
  grand_total: number;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  terms_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_description: string;
  students_staff: string | null;
  hsn_code: string;
  rate: number;
  quantity: number;
  amount: number;
  gst_rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  item_order: number;
  created_at: string;
}

export interface InvoiceSequence {
  user_id: string;
  last_invoice_number: number;
  prefix: string;
  updated_at: string;
}
