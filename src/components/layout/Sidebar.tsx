import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, User, CreditCard, ShieldCheck, LogOut, Menu, X, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Settings' },
  { to: '/profile?tab=subscription', icon: CreditCard, label: 'Subscription' },
];

const TIER_COLORS: Record<string, string> = {
  free: '#64748b', starter: '#0ea5e9', pro: '#3b82f6', business: '#f59e0b',
};

export function Sidebar() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tier: string = (profile as any)?.subscription_tier ?? 'free';
  const isAdmin = (profile as any)?.is_admin === true;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.user_name
    ? profile.user_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const sidebarBg = 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)', flexShrink: 0 }}>
            <FileText style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1 }}>AvinyaInvoice</p>
            <p style={{ color: '#475569', fontSize: '10px', marginTop: '2px' }}>Invoicing Platform</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <p style={{ color: '#334155', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: '8px' }}>Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginBottom: '2px', transition: 'all 0.15s',
              color: isActive ? '#60a5fa' : '#94a3b8',
              background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            })}
          >
            <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }} />
            <p style={{ color: '#b45309', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: '8px' }}>Admin</p>
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginBottom: '2px',
                color: isActive ? '#fbbf24' : '#d97706',
                background: isActive ? 'rgba(245,158,11,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
              })}
            >
              <ShieldCheck style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>Admin Dashboard</span>
            </NavLink>
          </>
        )}

        {(tier === 'free' || tier === 'starter') && (
          <div style={{ marginTop: '16px', borderRadius: '12px', padding: '12px', background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(6,182,212,0.15))', border: '1px solid rgba(59,130,246,0.25)' }}>
            <p style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Upgrade to Pro</p>
            <p style={{ color: '#475569', fontSize: '11px', marginBottom: '10px' }}>Unlimited invoices & analytics</p>
            <NavLink
              to="/profile?tab=subscription"
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', textAlign: 'center', fontSize: '12px', fontWeight: 600, padding: '6px', borderRadius: '8px', color: '#fff', background: 'linear-gradient(135deg,#2563eb,#0891b2)', textDecoration: 'none' }}
            >
              Upgrade Now
            </NavLink>
          </div>
        )}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, background: `linear-gradient(135deg,${TIER_COLORS[tier] ?? '#64748b'},#0891b2)`, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.user_name ?? 'User'}</p>
            <p style={{ fontSize: '11px', fontWeight: 500, color: TIER_COLORS[tier] ?? '#64748b', textTransform: 'capitalize' }}>{tier} Plan</p>
          </div>
          <button onClick={handleSignOut} title="Sign out" style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            <LogOut style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        style={{ display: 'none', position: 'fixed', top: '16px', left: '16px', zIndex: 50, width: '40px', height: '40px', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#1e293b', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        className="sidebar-mobile-btn"
      >
        <Menu style={{ width: '20px', height: '20px' }} />
      </button>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }} />
      )}

      <aside
        style={{
          display: 'none', position: 'fixed', inset: '0 auto 0 0', zIndex: 50, width: '240px', flexDirection: 'column',
          background: sidebarBg, boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="sidebar-mobile"
      >
        <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X style={{ width: '20px', height: '20px' }} />
        </button>
        <SidebarContent />
      </aside>

      <aside
        style={{ display: 'none', flexDirection: 'column', width: '240px', flexShrink: 0, background: sidebarBg, boxShadow: '4px 0 24px rgba(0,0,0,0.2)', minHeight: '100vh' }}
        className="sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      <style>{`
        @media (max-width: 1023px) {
          .sidebar-mobile-btn { display: flex !important; }
          .sidebar-mobile { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .sidebar-desktop { display: flex !important; }
        }
      `}</style>
    </>
  );
}
