import React, { useEffect } from 'react';
import { useSyncEngine } from '../store/syncEngine';
import { useTheme } from '../ThemeContext';
import { DraggableNode } from './DraggableNode';

export const LivePreview: React.FC = () => {
  const { slides, nodes, activeSlideId, connect, setSelectedNode } = useSyncEngine();
  const { colors } = useTheme();
  const activeSlide = activeSlideId ? slides[activeSlideId] : null;

  useEffect(() => { connect(); }, [connect]);

  return (
    <div
      onPointerDown={() => setSelectedNode(null)}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: colors.bgCanvas, backgroundImage: `radial-gradient(${colors.border} 2px, transparent 2px)`, backgroundSize: '40px 40px', backgroundPosition: '-19px -19px' }}
    >
      {/* Render Agent Label */}
      <div style={{ position: 'absolute', top: '15px', right: '20px', background: `${colors.bgPrimary}cc`, padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', color: colors.textMuted, border: `1px solid ${colors.border}`, zIndex: 10 }}>
        Z3 Rendering Agent Target: 100%
      </div>

      {/* Top Toolbar */}
      <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', background: colors.bgSecondary, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${colors.border}`, display: 'flex', gap: '10px', zIndex: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.3)', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '1px' }}>
        {['SEL','PAN','PEN','BLN','TYP'].map((t, i) => (
          <span key={t} style={{ cursor: 'pointer', color: i === 0 ? colors.textPrimary : colors.textMuted, transition: '0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = colors.accent}
            onMouseLeave={e => e.currentTarget.style.color = i === 0 ? colors.textPrimary : colors.textMuted}>{t}</span>
        ))}
        <div style={{ width: '1px', height: '12px', background: colors.border }} />
        {['NOD','MAT'].map(t => (
          <span key={t} style={{ cursor: 'pointer', color: colors.textMuted, transition: '0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = colors.accent}
            onMouseLeave={e => e.currentTarget.style.color = colors.textMuted}>{t}</span>
        ))}
        <div style={{ width: '1px', height: '12px', background: colors.border }} />
        {['Z3','GEN','SEG','TOP','TRK','PCL','AGT'].map(t => (
          <span key={t} style={{ cursor: 'pointer', color: colors.accent, transition: '0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = colors.accentCyan}
            onMouseLeave={e => e.currentTarget.style.color = colors.accent}>{t}</span>
        ))}
      </div>

      {/* Centered Slide Canvas */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '800px', aspectRatio: '16/9', background: '#ffffff',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)', overflow: 'hidden', border: `1px solid ${colors.border}`, borderRadius: '2px'
      }}>
        {activeSlide && activeSlide.children.map(nodeId => {
          const node = nodes[nodeId];
          if (!node) return null;
          return <DraggableNode key={node.id} node={node} />;
        })}
      </div>

      {/* Left-Hand Toolbar */}
      <div style={{
        position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
        background: colors.bgSecondary, padding: '8px 5px', borderRadius: '8px', border: `1px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10,
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)', alignItems: 'center', fontSize: '0.85rem'
      }}>
        {[
          { icon: '⬡', label: 'Move Tool [V]', active: true },
          null,
          { icon: '▤', label: 'Rectangular Marquee [M]' },
          { icon: '⟴', label: 'Lasso Tool [L]' },
          { icon: '✨', label: 'Magic Wand [W]', isAI: true },
          null,
          { icon: '✎', label: 'Brush Tool [B]' },
          { icon: '▱', label: 'Eraser Tool [E]' },
          { icon: '◑', label: 'Gradient Tool [G]' },
          null,
          { icon: '✒', label: 'Pen Tool [P]' },
          { icon: 'T', label: 'Text Tool [T]' },
          { icon: '⬜', label: 'Shape Tool [U]' },
          null,
          { icon: 'GEN', label: 'Generative Fill Mask', isAI: true, small: true },
        ].map((item, i) => {
          if (!item) return <div key={i} style={{ width: '14px', height: '1px', background: colors.border }} />;
          if (item.small) return (
            <span key={i} title={item.label} style={{ cursor: 'pointer', color: colors.accent, border: `1px solid ${colors.accent}`, borderRadius: '4px', padding: '2px 4px', fontSize: '0.55rem', fontWeight: 700, transition: '0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${colors.accent}30`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{item.icon}</span>
          );
          return (
            <span key={i} title={item.label} style={{ cursor: 'pointer', color: item.active ? colors.textPrimary : item.isAI ? colors.accent : colors.textMuted, transition: '0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = colors.accentCyan}
              onMouseLeave={e => e.currentTarget.style.color = item.active ? colors.textPrimary : item.isAI ? colors.accent : colors.textMuted}>
              {item.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
};
