import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useProfile } from '../../hooks/useProfile';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ShieldCheck, Users, FileText, DollarSign, TrendingUp, Search, BarChart3 } from 'lucide-react';

type Tab = 'overview' | 'users';

const TIER_COLORS: Record<string, string> = {
  free: '#64748b', starter: '#0ea5e9', pro: '#2563eb', business: '#f59e0b',
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { loading, totalUsers, proUsers, businessUsers, freeUsers, newUsersThisMonth, totalInvoices, totalRevenue, days14, topUsers, recentSignups, allUsers } = useAdmin();
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');

  if (profileLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner size="lg" /></div>;

  if (!(profile as any)?.is_admin) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck style={{ width: '30px', height: '30px', color: '#f87171' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>You don't have permission to view this page.</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#2563eb,#0891b2)', border: 'none', cursor: 'pointer' }}>Back to Dashboard</button>
        </div>
      </Layout>
    );
  }

  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toFixed(0)}`;
  const maxUsers = Math.max(...days14.map(d => d.users), 1);
  const maxInvoices = Math.max(...days14.map(d => d.invoices), 1);

  const statCards = [
    { label: 'Total Users', value: totalUsers, sub: `+${newUsersThisMonth} this month`, icon: Users, bg: 'linear-gradient(135deg,#1d4ed8,#2563eb)', shadow: '0 8px 24px rgba(37,99,235,0.3)' },
    { label: 'Revenue Tracked', value: fmt(totalRevenue), sub: 'From paid invoices', icon: DollarSign, bg: 'linear-gradient(135deg,#059669,#10b981)', shadow: '0 8px 24px rgba(16,185,129,0.3)' },
    { label: 'Total Invoices', value: totalInvoices, icon: FileText, bg: 'linear-gradient(135deg,#0369a1,#0891b2)', shadow: '0 8px 24px rgba(8,145,178,0.3)' },
    { label: 'Paid Users', value: proUsers + businessUsers, sub: `${freeUsers} on free`, icon: TrendingUp, bg: 'linear-gradient(135deg,#b45309,#f59e0b)', shadow: '0 8px 24px rgba(245,158,11,0.3)' },
  ];

  const filteredUsers = allUsers.filter(u =>
    u.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.12)' }}>
            <ShieldCheck style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Admin Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>AvinyaInvoice platform overview and user management</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '24px', width: 'fit-content' }}>
          {(['overview', 'users'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', textTransform: 'capitalize', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1e40af' : '#64748b', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}><LoadingSpinner size="lg" /></div>
        ) : tab === 'overview' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px' }}>
              {statCards.map(({ label, value, sub, icon: Icon, bg, shadow }) => (
                <div key={label} style={{ borderRadius: '16px', padding: '20px', background: bg, boxShadow: shadow }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Icon style={{ width: '18px', height: '18px', color: '#fff' }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '3px' }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}>{value}</p>
                  {sub && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '3px' }}>{sub}</p>}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
              <div style={{ borderRadius: '16px', padding: '20px', background: '#fff', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <BarChart3 style={{ width: '16px', height: '16px', color: '#3b82f6' }} /> User Signups (14 days)
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '72px' }}>
                  {days14.map(d => (
                    <div key={d.date} title={`${d.date}: ${d.users}`} style={{ flex: 1, background: 'linear-gradient(180deg,#3b82f6,#1d4ed8)', borderRadius: '3px 3px 0 0', minHeight: '3px', height: `${Math.max(3, (d.users / maxUsers) * 72)}px` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{days14[0]?.date?.slice(5)}</span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{days14[days14.length - 1]?.date?.slice(5)}</span>
                </div>
              </div>

              <div style={{ borderRadius: '16px', padding: '20px', background: '#fff', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <FileText style={{ width: '16px', height: '16px', color: '#10b981' }} /> Invoice Activity (14 days)
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '72px' }}>
                  {days14.map(d => (
                    <div key={d.date} title={`${d.date}: ${d.invoices}`} style={{ flex: 1, background: 'linear-gradient(180deg,#10b981,#059669)', borderRadius: '3px 3px 0 0', minHeight: '3px', height: `${Math.max(3, (d.invoices / maxInvoices) * 72)}px` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{days14[0]?.date?.slice(5)}</span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{days14[days14.length - 1]?.date?.slice(5)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>Recent Signups</h3>
                </div>
                {recentSignups.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `linear-gradient(135deg,${TIER_COLORS[u.subscription_tier] ?? '#64748b'},#0891b2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                        {(u.user_name ?? 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.user_name}</p>
                        <p style={{ color: '#94a3b8', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.company_name}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', background: `${TIER_COLORS[u.subscription_tier] ?? '#64748b'}20`, color: TIER_COLORS[u.subscription_tier] ?? '#64748b', textTransform: 'capitalize' }}>{u.subscription_tier}</span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))}
                {recentSignups.length === 0 && <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>No users yet</div>}
              </div>

              <div style={{ borderRadius: '16px', padding: '20px', background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '16px' }}>Top Active Users</h3>
                {topUsers.slice(0, 5).map((u, i) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ color: '#334155', fontSize: '13px', fontWeight: 700, width: '18px' }}>#{i + 1}</span>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `linear-gradient(135deg,${TIER_COLORS[u.subscription_tier] ?? '#64748b'},#0891b2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {(u.user_name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.user_name}</p>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '12px', flexShrink: 0 }}>{(u as any).invoiceCount} inv</span>
                  </div>
                ))}
                {topUsers.length === 0 && <p style={{ color: '#334155', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No data yet</p>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
              <input type="text" placeholder="Search users by name, email or company..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 16px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      {['User', 'Company', 'Plan', 'Status', 'Invoices', 'Joined'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `linear-gradient(135deg,${TIER_COLORS[u.subscription_tier] ?? '#64748b'},#0891b2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                              {(u.user_name ?? 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: '#1e293b' }}>{u.user_name}</p>
                              <p style={{ color: '#94a3b8', fontSize: '11px' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#475569' }}>{u.company_name}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: `${TIER_COLORS[u.subscription_tier] ?? '#64748b'}20`, color: TIER_COLORS[u.subscription_tier] ?? '#64748b', textTransform: 'capitalize' }}>{u.subscription_tier}</span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: u.subscription_status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: u.subscription_status === 'active' ? '#059669' : '#dc2626', textTransform: 'capitalize' }}>{u.subscription_status}</span>
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: '#1e293b' }}>{u.monthly_invoice_count}</td>
                        <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No users found</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
