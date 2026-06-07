import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Run expiry check and monthly-count reset before fetching,
      // so the profile we read back is always up-to-date.
      await Promise.all([
        supabase.rpc('check_and_expire_subscription', { p_user_id: user.id }),
        supabase.rpc('maybe_reset_monthly_invoice_count', { p_user_id: user.id }),
      ]);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (
    profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...profileData, id: user.id }])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('invoice_sequence')
        .insert([{ user_id: user.id, last_invoice_number: 0, prefix: 'INV' }]);

      setProfile(data);
      toast.success('Profile created successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      return { error: error.message };
    }
  };

  const updateProfile = async (
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profile updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return { error: error.message };
    }
  };

  /** Activate (or renew) a paid plan — sets exact 30-day window via DB function. */
  const activateSubscription = async (tier: 'pro' | 'business') => {
    if (!user) return { error: 'No user' };

    try {
      const { error } = await supabase.rpc('activate_subscription', {
        p_user_id: user.id,
        p_tier: tier,
      });

      if (error) throw error;

      // Re-fetch so the profile state reflects the new dates immediately
      await fetchProfile();
      toast.success(`${tier.charAt(0).toUpperCase() + tier.slice(1)} plan activated!`);
      return { error: null };
    } catch (error: any) {
      console.error('Error activating subscription:', error);
      toast.error('Failed to activate subscription');
      return { error: error.message };
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    activateSubscription,
    refetch: fetchProfile,
  };
}
