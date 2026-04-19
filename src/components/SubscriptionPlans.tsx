import React from 'react';
import { useTheme } from '../ThemeContext';

const plans = [
  {
    id: 'PRO_LOCAL', name: 'Local Pro', price: 'FREE', originalPrice: '₹49',
    period: '/beta', color: '#00d2ff',
    features: ['Unlimited Local LLM (Gemma)', 'Local 3D Diffusion', 'No Watermarks', '100 Cloud API Calls']
  },
  {
    id: 'PRO_CLOUD', name: 'Cloud Pro', price: 'FREE', originalPrice: '₹149',
    period: '/beta', color: '#7928CA', featured: true,
    features: ['Gemini Vision Layout Analysis', '1,000 Cloud API Calls', 'Priority Node Computing', '4K Presentation Export']
  },
  {
    id: 'PRO_MAX', name: 'Ultimate Max', price: 'FREE', originalPrice: '₹249',
    period: '/beta', color: '#ffbd2e',
    features: ['Unlimited Gemini API', 'Unlimited Local Models', 'Team Collaboration Mode', 'Custom Domain Publishing']
  }
];

export const SubscriptionPlans = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(5, 5, 7, 0.95)', zIndex: 1000, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '30px', cursor: 'pointer', fontSize: '1.5rem', color: '#888' }} onClick={onClose}>✕</div>

      {/* Free Beta Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #27c93f, #00d2ff)',
        padding: '10px 30px', borderRadius: '30px', marginBottom: '25px',
        fontSize: '0.85rem', fontWeight: 800, color: '#000', letterSpacing: '1px',
        boxShadow: '0 0 30px rgba(39,201,63,0.3)'
      }}>
        🎉 ALL TOOLS ARE FREE DURING BETA — NO PAYMENT REQUIRED
      </div>

      <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px', fontWeight: 800 }}>AXIOM Studio Plans</h2>
      <p style={{ color: '#888', marginBottom: '40px' }}>Every feature is unlocked for you during the Beta period</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            width: '280px', background: colors.bgSecondary, border: `1px solid ${plan.featured ? plan.color : colors.border}`,
            borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column',
            position: 'relative', transition: '0.3s', boxShadow: plan.featured ? `0 0 30px ${plan.color}33` : 'none'
          }}>
            {plan.featured && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>RECOMMENDED</div>}

            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '5px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '2rem', color: '#27c93f', fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: '#666', fontSize: '0.8rem', textDecoration: 'line-through' }}>{plan.originalPrice}</span>
              <span style={{ color: '#666', fontSize: '0.75rem' }}>{plan.period}</span>
            </div>

            <div style={{ flex: 1, marginBottom: '30px' }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#27c93f' }}>✓</span> {f}
                </div>
              ))}
            </div>

            <button style={{
              background: '#27c93f', border: 'none', color: '#000', padding: '12px',
              borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem'
            }}>
              ✅ Already Unlocked
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '50px', display: 'flex', gap: '30px', alignItems: 'center' }}>
        <div style={{ opacity: 0.5, color: '#fff', fontSize: '0.7rem' }}>ALL FEATURES UNLOCKED</div>
        <div style={{ opacity: 0.5, color: '#fff', fontSize: '0.7rem' }}>NO CREDIT CARD REQUIRED</div>
      </div>
    </div>
  );
};
