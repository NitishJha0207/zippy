import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { FileText, CheckCircle, Zap, TrendingUp, Shield } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      <div
        style={{
          display: 'none',
          width: '50%',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        }}
        className="auth-hero"
      >
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.5)' }}>
              <FileText style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px' }}>AvinyaInvoice</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '12px' }}>
            Invoice smarter,<br />
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>grow faster</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '17px', lineHeight: 1.6, marginBottom: '32px' }}>
            Professional GST invoicing for Indian businesses. Create, send, and track invoices in seconds.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: Zap, text: 'Create GST invoices in under 60 seconds' },
              { icon: TrendingUp, text: 'Track payments and analytics in real-time' },
              { icon: Shield, text: 'Secure cloud storage, access anywhere' },
              { icon: CheckCircle, text: 'WhatsApp & email sharing built-in' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.2)', flexShrink: 0 }}>
                  <Icon style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, borderRadius: '16px', padding: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6 }}>
            "AvinyaInvoice cut our invoicing time by 80%. The GST calculations are automatic and the WhatsApp sharing is a game-changer."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>RK</div>
            <div>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>Rahul Kumar</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>Founder, TechVentures</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2563eb' }}>
                <FileText style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>AvinyaInvoice</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {isLogin ? 'Sign in to manage your invoices' : 'Get started free — no credit card required'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '28px' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '9px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: isLogin ? '#fff' : 'transparent',
                color: isLogin ? '#1e40af' : '#64748b',
                boxShadow: isLogin ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '9px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: !isLogin ? '#fff' : 'transparent',
                color: !isLogin ? '#1e40af' : '#64748b',
                boxShadow: !isLogin ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Sign Up
            </button>
          </div>

          <div style={{ borderRadius: '20px', padding: '32px', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            {isLogin ? <LoginForm /> : <SignUpForm />}
          </div>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-hero { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
