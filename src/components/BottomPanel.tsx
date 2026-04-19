import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';

const initialNodes = [
  { id: 'n1', type: 'MediaIn', name: 'Image Source', x: 50, y: 80, color: '#27c93f' },
  { id: 'n2', type: 'Blur', name: 'Gaussian Blur', x: 250, y: 80, color: '#00d2ff' },
  { id: 'n3', type: 'Color', name: 'Color Balance', x: 450, y: 40, color: '#7928CA' },
  { id: 'n4', type: 'Merge', name: 'Merge', x: 650, y: 80, color: '#ffbd2e' },
  { id: 'n5', type: 'MediaOut', name: 'Output', x: 850, y: 80, color: '#ff5f56' }
];
const connections = [
  { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
  { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' }
];

export const BottomPanel = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'timeline' | 'nodes'>('nodes');
  const [collapsed, setCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState(320);
  const [isDragging, setIsDragging] = useState(false);

  // Timeline state
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(15);
  const [zoom, setZoom] = useState(1);

  const drawConnection = (fromX: number, fromY: number, toX: number, toY: number) => {
    const dx = Math.abs(toX - fromX) * 0.5;
    return `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startY = e.clientY;
    const startH = panelHeight;
    const onMove = (ev: MouseEvent) => {
      const newH = Math.max(80, Math.min(600, startH - (ev.clientY - startY)));
      setPanelHeight(newH);
    };
    const onUp = () => { setIsDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const tracks = [
    { name: 'Video (V1)', clips: [{ start: 0, end: 30, label: 'Hero Build_up', color: colors.accent }] },
    { name: 'Animation (A1)', clips: [{ start: 30, end: 55, label: 'FadeIn', color: colors.accentCyan }] },
    { name: 'Audio (A1)', clips: [{ start: 5, end: 70, label: 'BGM Loop', color: colors.accentGreen }] },
    { name: '3D Model', clips: [{ start: 20, end: 50, label: 'Product Spin', color: colors.accentYellow }] },
  ];

  return (
    <div style={{
      height: collapsed ? '40px' : `${panelHeight}px`,
      background: colors.bgSecondary,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column',
      transition: collapsed ? 'height 0.3s ease' : 'none',
      overflow: 'hidden'
    }}>
      {/* Drag handle */}
      {!collapsed && (
        <div onMouseDown={handleDragStart} style={{
          height: '6px', cursor: 'ns-resize', display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: isDragging ? colors.accent : 'transparent', transition: '0.2s'
        }}>
          <div style={{ width: '40px', height: '3px', borderRadius: '2px', background: colors.border }} />
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${colors.border}`, background: colors.bgPrimary, flexShrink: 0 }}>
        <div onClick={() => { setActiveTab('timeline'); if (collapsed) setCollapsed(false); }}
          style={{ padding: '10px 20px', fontSize: '0.75rem', color: activeTab === 'timeline' ? colors.textPrimary : colors.textMuted, borderBottom: activeTab === 'timeline' ? `2px solid ${colors.accent}` : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'timeline' ? 600 : 400 }}>
          🎞️ Sequence Timeline
        </div>
        <div onClick={() => { setActiveTab('nodes'); if (collapsed) setCollapsed(false); }}
          style={{ padding: '10px 20px', fontSize: '0.75rem', color: activeTab === 'nodes' ? colors.textPrimary : colors.textMuted, borderBottom: activeTab === 'nodes' ? `2px solid ${colors.accentCyan}` : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'nodes' ? 600 : 400 }}>
          ⬡ Node Graph (Fusion)
        </div>
        <div style={{ flex: 1 }} />

        {activeTab === 'timeline' && !collapsed && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginRight: '15px' }}>
            <button onClick={() => setPlaying(!playing)} style={{ background: playing ? colors.accentRed : colors.accent, border: 'none', color: '#fff', padding: '4px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
              {playing ? '⏸ Pause' : '▶ Play'}
            </button>
            <span style={{ color: colors.textMuted, fontSize: '0.65rem', fontFamily: 'monospace' }}>00:{String(playhead).padStart(2, '0')}:00</span>
            <input type="range" min={0.5} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '60px', accentColor: colors.accent }} title="Zoom" />
          </div>
        )}

        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
          {collapsed ? '▲ Expand' : '▼ Collapse'}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundImage: `radial-gradient(${colors.border} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
          {activeTab === 'timeline' ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Ruler */}
              <div style={{ height: '28px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'flex-end', paddingLeft: '130px', overflow: 'hidden' }}>
                {Array.from({ length: Math.floor(100 * zoom) }).map((_, i) => (
                  i % 10 === 0 ? (
                    <div key={i} style={{ minWidth: `${10 * zoom}px`, fontSize: '0.55rem', color: colors.textMuted, borderLeft: `1px solid ${colors.border}`, paddingLeft: '3px', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '3px' }}>
                      {(i / 10).toFixed(0)}s
                    </div>
                  ) : (
                    <div key={i} style={{ minWidth: `${10 * zoom}px`, borderLeft: `1px solid ${colors.bgTertiary}`, height: '40%' }} />
                  )
                ))}
              </div>

              {/* Tracks */}
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                {tracks.map((track, ti) => (
                  <div key={ti} style={{ display: 'flex', height: '36px', alignItems: 'center', borderBottom: `1px solid ${colors.bgTertiary}` }}>
                    <div style={{ width: '120px', fontSize: '0.7rem', color: colors.textMuted, textAlign: 'right', paddingRight: '10px', borderRight: `1px solid ${colors.border}`, flexShrink: 0 }}>{track.name}</div>
                    <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                      {track.clips.map((clip, ci) => (
                        <div key={ci} style={{
                          position: 'absolute', left: `${clip.start * zoom}%`, width: `${(clip.end - clip.start) * zoom}%`,
                          top: '4px', bottom: '4px', background: `${clip.color}30`, borderRadius: '4px',
                          border: `1px solid ${clip.color}`, display: 'flex', alignItems: 'center', paddingLeft: '8px',
                          fontSize: '0.65rem', color: colors.textPrimary, cursor: 'grab', overflow: 'hidden', whiteSpace: 'nowrap'
                        }}>
                          {clip.label}
                        </div>
                      ))}
                      {/* Playhead */}
                      <div style={{
                        position: 'absolute', left: `${playhead * zoom}%`, top: 0, bottom: 0,
                        width: '2px', background: colors.accentCyan, zIndex: 5
                      }}>
                        <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', background: colors.accentCyan, borderRadius: '50%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {connections.map((c, i) => {
                  const from = initialNodes.find(n => n.id === c.from);
                  const to = initialNodes.find(n => n.id === c.to);
                  if (!from || !to) return null;
                  return <path key={i} d={drawConnection(from.x + 140, from.y + 20, to.x, to.y + 20)} fill="none" stroke={colors.textMuted} strokeWidth="2" strokeOpacity={0.4} />;
                })}
              </svg>
              {initialNodes.map(node => (
                <div key={node.id} style={{
                  position: 'absolute', left: node.x, top: node.y, width: '140px',
                  background: colors.bgTertiary, border: `1px solid ${colors.borderHover}`, borderTop: `3px solid ${node.color}`,
                  borderRadius: '6px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 10
                }}>
                  <div style={{ fontSize: '0.65rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{node.type}</div>
                  <div style={{ fontSize: '0.8rem', color: colors.textPrimary, fontWeight: 500 }}>{node.name}</div>
                  <div style={{ position: 'absolute', left: '-5px', top: '20px', width: '10px', height: '10px', background: colors.bgTertiary, border: `1px solid ${colors.textMuted}`, borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', right: '-5px', top: '20px', width: '10px', height: '10px', background: colors.bgTertiary, border: `1px solid ${node.color}`, borderRadius: '50%' }} />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
