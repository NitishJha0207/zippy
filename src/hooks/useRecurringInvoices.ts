import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface RecurringInvoice {
  id: string;
  user_id: string;
  customer_id: string;
  template_name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string | null;
  next_generation_date: string;
  last_generated_date: string | null;
  is_active: boolean;
  transport_mode: string;
  vehicle_number: string;
  reverse_charge: boolean;
  place_of_supply: string;
  ship_to_same: boolean;
  ship_to_name: string;
  ship_to_address: string;
  ship_to_gstin: string;
  ship_to_state: string;
  ship_to_state_code: string;
  terms_conditions: string;
  notes: string;
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  total_tax: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringInvoiceItem {
  id?: string;
  recurring_invoice_id?: string;
  product_description: string;
  students_staff: string;
  hsn_code: string;
  quantity: number;
  rate: number;
  amount: number;
  gst_rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  item_order: number;
}

export function useRecurringInvoices() {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurringInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_invoices')
        .select('*, customers(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecurringInvoices(data || []);
    } catch (error) {
      console.error('Error fetching recurring invoices:', error);
      toast.error('Failed to load recurring invoices');
    } finally {
      setLoading(false);
    }
  };

  const createRecurringInvoice = async (
    invoice: Partial<RecurringInvoice>,
    items: RecurringInvoiceItem[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: recurringInvoice, error: invoiceError } = await supabase
        .from('recurring_invoices')
        .insert({ ...invoice, user_id: user.id })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsToInsert = items.map((item, index) => ({
        ...item,
        recurring_invoice_id: recurringInvoice.id,
        item_order: index
      }));

      const { error: itemsError } = await supabase
        .from('recurring_invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Recurring invoice created successfully');
      await fetchRecurringInvoices();
    } catch (error) {
      console.error('Error creating recurring invoice:', error);
      toast.error('Failed to create recurring invoice');
    }
  };

  const updateRecurringInvoice = async (
    id: string,
    updates: Partial<RecurringInvoice>
  ) => {
    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Recurring invoice updated');
      await fetchRecurringInvoices();
    } catch (error) {
      console.error('Error updating recurring invoice:', error);
      toast.error('Failed to update recurring invoice');
    }
  };

  const deleteRecurringInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Recurring invoice deleted');
      await fetchRecurringInvoices();
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
      toast.error('Failed to delete recurring invoice');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(isActive ? 'Recurring invoice activated' : 'Recurring invoice paused');
      await fetchRecurringInvoices();
    } catch (error) {
      console.error('Error toggling recurring invoice:', error);
      toast.error('Failed to update recurring invoice');
    }
  };

  useEffect(() => {
    fetchRecurringInvoices();
  }, []);

  return {
    recurringInvoices,
    loading,
    createRecurringInvoice,
    updateRecurringInvoice,
    deleteRecurringInvoice,
    toggleActive,
    refetch: fetchRecurringInvoices
  };
}
