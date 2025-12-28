import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface ReminderSettings {
  user_id: string;
  enabled: boolean;
  remind_before_days: number;
  remind_on_due_date: boolean;
  remind_after_days: number[];
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  message_template: string;
  created_at: string;
  updated_at: string;
}

export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        const defaultSettings = {
          user_id: user.id,
          enabled: false,
          remind_before_days: 1,
          remind_on_due_date: true,
          remind_after_days: [3, 7],
          whatsapp_enabled: false,
          email_enabled: true,
          message_template: 'Hi {{CustomerName}}, your invoice {{InvoiceNumber}} of ₹{{Amount}} is due on {{DueDate}}. Please pay at your earliest convenience. Thank you!'
        };
        setSettings(defaultSettings as ReminderSettings);
      }
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
      toast.error('Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Partial<ReminderSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('reminder_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('reminder_settings')
          .update({ ...updatedSettings, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reminder_settings')
          .insert({ ...updatedSettings, user_id: user.id });

        if (error) throw error;
      }

      toast.success('Reminder settings saved');
      await fetchSettings();
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      toast.error('Failed to save reminder settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, saveSettings, refetch: fetchSettings };
}
