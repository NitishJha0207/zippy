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

  return {
    customers,
    loading,
    createCustomer,
    refetch: fetchCustomers
  };
}
