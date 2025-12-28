import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          user_id: user.id,
          state: null,
          state_code: null
        }])
        .select()
        .single();

      if (error) throw error;

      setCustomers((prev) => [...prev, data]);
      toast.success('Customer added successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error('Failed to add customer');
      return { error: error.message };
    }
  };

  const updateCustomer = async (id: string, customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCustomers((prev) => prev.map(c => c.id === id ? data : c));
      toast.success('Customer updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      return { error: error.message };
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomers((prev) => prev.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      return { error: error.message };
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
}
