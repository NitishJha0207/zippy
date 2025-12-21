import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface InvoiceListItem {
  id: string;
  invoice_number: string;
  invoice_date: string;
  grand_total: number;
  customer_name: string;
}

interface InvoiceData {
  customer_id: string;
  invoice_date: string;
  transport_mode: string;
  vehicle_number: string;
  reverse_charge: boolean;
  place_of_supply: string;
  ship_to_same: boolean;
  ship_to_name?: string;
  ship_to_address?: string;
  ship_to_gstin?: string;
  ship_to_state?: string;
  ship_to_state_code?: string;
  terms_conditions: string;
  items: {
    product_description: string;
    students_staff: string;
    hsn_code: string;
    quantity: number;
    rate: number;
    gst_rate: number;
  }[];
}

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          invoice_date,
          grand_total,
          bill_to_name
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvoices = data.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        invoice_date: inv.invoice_date,
        grand_total: inv.grand_total,
        customer_name: inv.bill_to_name
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getNextInvoiceNumber = async (): Promise<string> => {
    if (!user) return 'INV-001';

    try {
      const { data: sequence, error } = await supabase
        .from('invoice_sequence')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!sequence) {
        await supabase
          .from('invoice_sequence')
          .insert([{ user_id: user.id, last_invoice_number: 0, prefix: 'INV' }]);
        return 'INV-001';
      }

      const nextNumber = sequence.last_invoice_number + 1;
      return `${sequence.prefix}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error getting invoice number:', error);
      return 'INV-001';
    }
  };

  const createInvoice = async (invoiceData: InvoiceData) => {
    if (!user) {
      toast.error('You must be logged in');
      return { error: 'No user' };
    }

    setLoading(true);

    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', invoiceData.customer_id)
        .single();

      if (customerError) throw customerError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const invoiceNumber = await getNextInvoiceNumber();

      let subtotal = 0;
      let cgstTotal = 0;
      let sgstTotal = 0;

      const processedItems = invoiceData.items.map((item, index) => {
        const amount = item.quantity * item.rate;
        const taxableValue = amount;
        const cgst = (taxableValue * item.gst_rate) / 200;
        const sgst = (taxableValue * item.gst_rate) / 200;

        subtotal += taxableValue;
        cgstTotal += cgst;
        sgstTotal += sgst;

        return {
          invoice_id: '',
          product_description: item.product_description,
          students_staff: item.students_staff || null,
          hsn_code: item.hsn_code || null,
          rate: item.rate,
          quantity: item.quantity,
          amount: amount,
          gst_rate: item.gst_rate,
          taxable_value: taxableValue,
          cgst: cgst,
          sgst: sgst,
          item_order: index + 1
        };
      });

      const totalTax = cgstTotal + sgstTotal;
      const grandTotal = subtotal + totalTax;

      const shipToName = invoiceData.ship_to_same ? customer.name : (invoiceData.ship_to_name || customer.name);
      const shipToAddress = invoiceData.ship_to_same ? customer.address : (invoiceData.ship_to_address || customer.address);
      const shipToGstin = invoiceData.ship_to_same ? customer.gstin : (invoiceData.ship_to_gstin || null);
      const shipToState = invoiceData.ship_to_same ? customer.state : (invoiceData.ship_to_state || customer.state);
      const shipToStateCode = invoiceData.ship_to_same ? customer.state_code : (invoiceData.ship_to_state_code || null);

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          invoice_number: invoiceNumber,
          invoice_date: invoiceData.invoice_date,
          bill_to_name: customer.name,
          bill_to_address: customer.address,
          bill_to_gstin: customer.gstin,
          bill_to_state: customer.state,
          bill_to_state_code: customer.state_code,
          ship_to_name: shipToName,
          ship_to_address: shipToAddress,
          ship_to_gstin: shipToGstin,
          ship_to_state: shipToState,
          ship_to_state_code: shipToStateCode,
          transport_mode: invoiceData.transport_mode,
          vehicle_number: invoiceData.vehicle_number || null,
          reverse_charge: invoiceData.reverse_charge,
          place_of_supply: invoiceData.place_of_supply,
          subtotal: subtotal,
          cgst_total: cgstTotal,
          sgst_total: sgstTotal,
          total_tax: totalTax,
          grand_total: grandTotal,
          bank_name: profile.bank_name,
          account_number: profile.account_number,
          ifsc_code: profile.ifsc_code,
          terms_conditions: invoiceData.terms_conditions || null
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const items = processedItems.map(item => ({
        ...item,
        invoice_id: invoice.id
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items);

      if (itemsError) throw itemsError;

      await supabase
        .from('invoice_sequence')
        .update({
          last_invoice_number: (await supabase
            .from('invoice_sequence')
            .select('last_invoice_number')
            .eq('user_id', user.id)
            .single()).data!.last_invoice_number + 1
        })
        .eq('user_id', user.id);

      toast.success('Invoice created successfully');
      await fetchInvoices();
      return { data: invoice, error: null };
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error.message}`);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  return {
    invoices,
    loading,
    getNextInvoiceNumber,
    createInvoice,
    deleteInvoice,
    refetch: fetchInvoices
  };
}
