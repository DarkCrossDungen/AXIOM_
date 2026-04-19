import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';

export const Filmstrip: React.FC = () => {
  const { colors } = useTheme();
  const [slides, setSlides] = useState([
    { id: 1, type: 'Title Slide', active: true },
    { id: 2, type: 'Data Visualization', active: false },
    { id: 3, type: 'Architecture Graph', active: false }
  ]);

  const addSlide = () => {
    const newId = slides.length + 1;
    setSlides([...slides, { id: newId, type: `Slide ${newId}`, active: false }]);
  };

  const selectSlide = (id: number) => {
    setSlides(slides.map(s => ({ ...s, active: s.id === id })));
  };

  return (
    <div style={{
      width: '180px', background: colors.bgSecondary, borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column', padding: '10px 0', overflowY: 'auto', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ padding: '0 15px 10px 15px', borderBottom: `1px solid ${colors.border}`, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 600, letterSpacing: '0.5px' }}>SLIDES</span>
        <button onClick={addSlide} style={{ background: colors.accent, border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>+</button>
      </div>

      {slides.map((slide, idx) => (
        <div key={slide.id} onClick={() => selectSlide(slide.id)} style={{
          padding: '10px 15px',
          background: slide.active ? `${colors.accent}18` : 'transparent',
          borderLeft: slide.active ? `3px solid ${colors.accent}` : '3px solid transparent',
          cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'background 0.2s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: slide.active ? colors.textPrimary : colors.textMuted }}>{idx + 1}</span>
            <span title="Transitions" style={{ fontSize: '0.62rem', color: colors.accent }}>✨</span>
          </div>
          <div style={{
            width: '100%', aspectRatio: '16/9', background: colors.bgTertiary,
            border: slide.active ? `1px solid ${colors.accent}` : `1px solid ${colors.borderHover}`,
            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.62rem', color: colors.textMuted
          }}>
            {slide.type}
          </div>
        </div>
      ))}
    </div>
  );
};
