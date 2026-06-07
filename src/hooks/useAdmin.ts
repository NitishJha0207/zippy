import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  user_name: string;
  email: string;
  company_name: string;
  subscription_tier: string;
  subscription_status: string;
  monthly_invoice_count: number;
  created_at: string;
  is_admin?: boolean;
}

interface AdminInvoice {
  id: string;
  user_id: string;
  grand_total: number;
  status: string;
  created_at: string;
}

export function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const [usersRes, invoicesRes] = await Promise.all([
        supabase.from('profiles').select('id,user_name,email,company_name,subscription_tier,subscription_status,monthly_invoice_count,created_at,is_admin'),
        supabase.from('invoices').select('id,user_id,grand_total,status,created_at'),
      ]);
      setUsers((usersRes.data as AdminUser[]) ?? []);
      setInvoices((invoicesRes.data as AdminInvoice[]) ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.subscription_tier === 'pro').length;
  const businessUsers = users.filter(u => u.subscription_tier === 'business').length;
  const freeUsers = users.filter(u => u.subscription_tier === 'free' || u.subscription_tier === 'starter').length;
  const newUsersThisMonth = users.filter(u => new Date(u.created_at) >= startOfMonth).length;
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.grand_total, 0);

  const days14: { date: string; users: number; invoices: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    days14.push({
      date: ds,
      users: users.filter(u => u.created_at.startsWith(ds)).length,
      invoices: invoices.filter(inv => inv.created_at.startsWith(ds)).length,
    });
  }

  const invoiceByUser: Record<string, number> = {};
  invoices.forEach(inv => { invoiceByUser[inv.user_id] = (invoiceByUser[inv.user_id] ?? 0) + 1; });

  const topUsers = [...users]
    .map(u => ({ ...u, invoiceCount: invoiceByUser[u.id] ?? 0 }))
    .sort((a, b) => b.invoiceCount - a.invoiceCount)
    .slice(0, 10);

  const recentSignups = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return { loading, totalUsers, proUsers, businessUsers, freeUsers, newUsersThisMonth, totalInvoices, totalRevenue, days14, topUsers, recentSignups, allUsers: users };
}
