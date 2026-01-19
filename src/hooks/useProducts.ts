import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) => [...prev, data]);
      toast.success('Product added successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error('Failed to add product');
      return { error: error.message };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) => prev.map(p => p.id === id ? data : p));
      toast.success('Product updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      return { error: error.message };
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts((prev) => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      return { error: error.message };
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
}
