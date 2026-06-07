import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useProfile } from '../hooks/useProfile';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { useSubscription } from '../hooks/useSubscription';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { CustomerModal } from '../components/customers/CustomerModal';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { InvoiceList } from '../components/invoices/InvoiceList';
import { Users, FileText, Plus, DollarSign, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'invoices' | 'customers';

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { customers, loading: customersLoading, createCustomer, updateCustomer } = useCustomers();
  const { invoices, createInvoice } = useInvoices();
  const { tier, monthlyCount, invoiceLimit, canCreateInvoice } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('invoices');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate('/onboarding');
    }
  }, [profile, profileLoading, navigate]);

  const handleCreateCustomer = async (customerData: any) => {
    if (editingCustomer) {
      const { error } = await updateCustomer(editingCustomer.id, customerData);
      if (!error) { setIsCustomerModalOpen(false); setEditingCustomer(null); }
    } else {
      const { error } = await createCustomer(customerData);
      if (!error) setIsCustomerModalOpen(false);
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    const { error } = await createInvoice(invoiceData);
    if (!error) { setIsInvoiceFormOpen(false); toast.success('Invoice created successfully'); }
  };

  if (profileLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) return null;

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const paidRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.grand_total, 0);
  const pendingCount = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toFixed(0)}`;

  const statCards = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, bg: 'linear-gradient(135deg,#1d4ed8,#2563eb)', shadow: '0 8px 32px rgba(37,99,235,0.3)' },
    { label: 'Collected', value: fmt(paidRevenue), icon: CheckCircle, bg: 'linear-gradient(135deg,#059669,#10b981)', shadow: '0 8px 32px rgba(16,185,129,0.3)' },
    { label: 'Total Invoices', value: invoices.length, icon: FileText, bg: 'linear-gradient(135deg,#0369a1,#0891b2)', shadow: '0 8px 32px rgba(8,145,178,0.3)' },
    { label: 'Pending', value: pendingCount, icon: Clock, bg: 'linear-gradient(135deg,#b45309,#f59e0b)', shadow: '0 8px 32px rgba(245,158,11,0.3)' },
  ];

  return (
    <Layout>
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Welcome back, {profile.user_name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{profile.company_name}</p>

          {invoiceLimit && (
            <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '10px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Monthly invoices:</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{monthlyCount}/{invoiceLimit}</span>
              <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '3px', background: monthlyCount >= invoiceLimit ? '#ef4444' : '#3b82f6', width: `${Math.min(100, (monthlyCount / invoiceLimit) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {(tier === 'free' || tier === 'starter') && (
          <div style={{ marginBottom: '24px', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)', border: '1px solid #bfdbfe' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '14px' }}>Unlock Pro features</p>
              <p style={{ color: '#1d4ed8', fontSize: '12px', marginTop: '2px' }}>Unlimited invoices, analytics, reminders & more</p>
            </div>
            <button onClick={() => navigate('/profile?tab=subscription')} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#2563eb,#0891b2)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              Upgrade to Pro
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '28px' }}>
          {statCards.map(({ label, value, icon: Icon, bg, shadow }) => (
            <div key={label} style={{ borderRadius: '16px', padding: '20px', background: bg, boxShadow: shadow }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', marginBottom: '12px' }}>
                <Icon style={{ width: '20px', height: '20px', color: '#fff' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{label}</p>
              <p style={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
          <div style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', background: '#f8fafc' }}>
              {(['invoices', 'customers'] as TabType[]).map((tab) => {
                const count = tab === 'invoices' ? invoices.length : customers.length;
                const Icon = tab === 'invoices' ? FileText : Users;
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', textTransform: 'capitalize', background: active ? '#fff' : 'transparent', color: active ? '#1e40af' : '#64748b', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                    <Icon style={{ width: '14px', height: '14px' }} />
                    {tab}
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', background: active ? '#eff6ff' : '#f1f5f9', color: active ? '#2563eb' : '#94a3b8' }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <Button onClick={() => {
              if (activeTab === 'invoices') {
                if (!canCreateInvoice) { toast.error('Invoice limit reached. Upgrade to Pro.'); navigate('/profile?tab=subscription'); return; }
                if (customers.length === 0) { toast.error('Please add a customer first'); setActiveTab('customers'); setIsCustomerModalOpen(true); }
                else setIsInvoiceFormOpen(true);
              } else setIsCustomerModalOpen(true);
            }}>
              <Plus style={{ width: '14px', height: '14px', marginRight: '6px' }} />
              {activeTab === 'invoices' ? 'New Invoice' : 'New Customer'}
            </Button>
          </div>

          <div style={{ padding: '20px' }}>
            {activeTab === 'invoices' && <InvoiceList />}
            {activeTab === 'customers' && (
              customersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><LoadingSpinner size="md" /></div>
              ) : customers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', borderRadius: '12px', background: '#f8fafc' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Users style={{ width: '26px', height: '26px', color: '#3b82f6' }} />
                  </div>
                  <p style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>No customers yet</p>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>Add your first customer to start billing</p>
                  <Button onClick={() => setIsCustomerModalOpen(true)}><Plus style={{ width: '14px', height: '14px', marginRight: '6px' }} />Add Customer</Button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '14px' }}>
                  {customers.map((customer) => (
                    <div key={customer.id} style={{ borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0', background: '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{customer.name}</p>
                        </div>
                        <button onClick={() => { setEditingCustomer(customer); setIsCustomerModalOpen(true); }} style={{ fontSize: '12px', fontWeight: 500, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                      </div>
                      {customer.email && <p style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email}</p>}
                      {customer.phone && <p style={{ fontSize: '12px', color: '#64748b' }}>{customer.phone}</p>}
                      {customer.gstin && <p style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '4px' }}>GSTIN: {customer.gstin}</p>}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }}
        onSave={handleCreateCustomer}
        customer={editingCustomer}
      />
      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => setIsInvoiceFormOpen(false)}
        onSave={handleCreateInvoice}
      />
    </Layout>
  );
}
