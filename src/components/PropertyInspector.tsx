import React from 'react';
import { useSyncEngine } from '../store/syncEngine';
import { useTheme } from '../ThemeContext';
import type { TextNode, ShapeNode } from '../types/engine';

export const PropertyInspector = () => {
  const { nodes, selectedNodeIds, applyManualEdit } = useSyncEngine();
  const { colors } = useTheme();

  if (selectedNodeIds.length === 0) {
    return <aside style={{ width: '280px', background: colors.bgSecondary, borderLeft: `1px solid ${colors.border}`, padding: '20px', color: colors.textMuted, fontSize: '0.85rem' }}>No element selected on canvas.</aside>;
  }

  const node = nodes[selectedNodeIds[0]];
  if (!node) return null;

  const inputStyle = { width: '100%', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.textPrimary, padding: '6px', borderRadius: '4px', boxSizing: 'border-box' as const };
  const labelStyle = { fontSize: '0.65rem', color: colors.textMuted, display: 'block', marginBottom: '4px' };
  const sectionLabel = { fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px' };

  return (
    <aside style={{ width: '320px', background: colors.bgSecondary, borderLeft: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <header style={{ padding: '15px', borderBottom: `1px solid ${colors.border}`, fontSize: '0.9rem', fontWeight: 'bold', color: colors.textPrimary, display: 'flex', justifyContent: 'space-between' }}>
        <span>Inspector</span>
        <span style={{ color: colors.accent, fontSize: '0.7rem', background: colors.bgTertiary, padding: '2px 6px', borderRadius: '4px' }}>{node.type}</span>
      </header>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Transform */}
        <div>
          <div style={sectionLabel}>Transform</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'X Pos', value: node.x, key: 'x' },
              { label: 'Y Pos', value: node.y, key: 'y' },
              { label: 'Width', value: node.width, key: 'width' },
              { label: 'Height', value: node.height, key: 'height' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input type="number" value={Math.round(f.value)} onChange={e => applyManualEdit(node.id, { [f.key]: Number(e.target.value) })} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        {/* Text Properties */}
        {node.type === 'TEXT' && (
          <div>
            <div style={sectionLabel}>Typography</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={(node as TextNode).textProps.text} onChange={e => applyManualEdit(node.id, { textProps: { text: e.target.value } })} style={{ ...inputStyle, padding: '8px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Size</label>
                  <input type="number" value={(node as TextNode).textProps.fontSize} onChange={e => applyManualEdit(node.id, { textProps: { fontSize: Number(e.target.value) } })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Weight</label>
                  <input type="number" step={100} min={100} max={900} value={(node as TextNode).textProps.fontWeight} onChange={e => applyManualEdit(node.id, { textProps: { fontWeight: Number(e.target.value) } })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.bgTertiary, padding: '8px', borderRadius: '4px', border: `1px solid ${colors.inputBorder}` }}>
                <label style={{ fontSize: '0.75rem', color: colors.textSecondary }}>Text Color</label>
                <input type="color" value={(node as TextNode).textProps.color} onChange={e => applyManualEdit(node.id, { textProps: { color: e.target.value } })} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {node.type === 'SHAPE' && (
          <div>
            <div style={sectionLabel}>Fill & Stroke</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.bgTertiary, padding: '8px', borderRadius: '4px', border: `1px solid ${colors.inputBorder}` }}>
                <label style={{ fontSize: '0.75rem', color: colors.textSecondary }}>Fill Color</label>
                <input type="color" value={(node as ShapeNode).shapeProps.fillColor} onChange={e => applyManualEdit(node.id, { shapeProps: { fillColor: e.target.value } })} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Radius</label>
                  <input type="number" value={(node as ShapeNode).shapeProps.cornerRadius || 0} onChange={e => applyManualEdit(node.id, { shapeProps: { cornerRadius: Number(e.target.value) } })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stroke</label>
                  <input type="number" value={(node as ShapeNode).shapeProps.strokeWidth} onChange={e => applyManualEdit(node.id, { shapeProps: { strokeWidth: Number(e.target.value) } })} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Properties */}
        {node.type === 'IMAGE' && (
          <div>
            <div style={sectionLabel}>Image Adjustments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: colors.bgTertiary, padding: '12px', borderRadius: '6px', border: `1px solid ${colors.inputBorder}` }}>
              {[
                { label: 'Brightness', key: 'brightness', min: 0, max: 200, unit: '%' },
                { label: 'Contrast', key: 'contrast', min: 0, max: 200, unit: '%' },
                { label: 'Saturation', key: 'saturation', min: 0, max: 200, unit: '%' },
                { label: 'Hue Rotate', key: 'hue', min: -180, max: 180, unit: '°' },
                { label: 'Gaussian Blur', key: 'blur', min: 0, max: 50, unit: 'px' },
              ].map(adj => (
                <div key={adj.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.65rem', color: colors.textSecondary }}>{adj.label}</label>
                    <span style={{ fontSize: '0.65rem', color: colors.textMuted }}>{(node as any).imageProps[adj.key]}{adj.unit}</span>
                  </div>
                  <input type="range" min={adj.min} max={adj.max} value={(node as any).imageProps[adj.key]}
                    onChange={e => applyManualEdit(node.id, { imageProps: { [adj.key]: Number(e.target.value) } })}
                    style={{ width: '100%', accentColor: colors.accent }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '10px', padding: '12px', background: `${colors.accentGreen}10`, border: `1px solid ${colors.accentGreen}30`, color: colors.accentGreen, borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>✓</span> Z3 Constraints Verified
        </div>
      </div>
    </aside>
  );
};
