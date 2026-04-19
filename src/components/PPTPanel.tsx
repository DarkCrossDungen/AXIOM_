import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';

export const PPTPanel = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme();
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [style, setStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [outline, setOutline] = useState<any[]>([]);
  const [downloadPath, setDownloadPath] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const generateOutline = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const resp = await fetch('http://localhost:8080/api/generate/ppt/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, slide_count: slideCount, style })
      });
      const data = await resp.json();
      setOutline(data.outline || []);
      setPreviewMode(true);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const generateFull = async () => {
    setGenerating(true);
    try {
      const resp = await fetch('http://localhost:8080/api/generate/ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, slide_count: slideCount, style })
      });
      const data = await resp.json();
      if (data.file_path) setDownloadPath(data.file_path);
      if (data.outline) setOutline(data.outline);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(5,5,7,0.92)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        width: '900px', maxHeight: '85vh', background: colors.bgSecondary,
        borderRadius: '16px', border: `1px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <header style={{
          padding: '20px 25px', borderBottom: `1px solid ${colors.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>📊</span>
            <h2 style={{ margin: 0, color: colors.textPrimary, fontSize: '1.1rem', letterSpacing: '1px' }}>PPT AUTOMATION ENGINE</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Controls */}
          <div style={{ width: '320px', padding: '25px', borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ color: colors.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Presentation Topic</label>
              <textarea
                value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. AI in Healthcare 2026..."
                style={{ width: '100%', height: '80px', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '8px', padding: '12px', color: colors.textPrimary, fontSize: '0.85rem', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: colors.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Slides</label>
                <input type="number" min={3} max={20} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))}
                  style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '6px', padding: '10px', color: colors.textPrimary, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: colors.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Style</label>
                <select value={style} onChange={e => setStyle(e.target.value)}
                  style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '6px', padding: '10px', color: colors.textPrimary, boxSizing: 'border-box' }}>
                  <option value="professional">Professional</option>
                  <option value="minimal">Minimal</option>
                  <option value="creative">Creative</option>
                  <option value="corporate">Corporate</option>
                  <option value="startup_pitch">Startup Pitch</option>
                </select>
              </div>
            </div>

            <button onClick={generateOutline} disabled={generating || !topic.trim()}
              style={{ width: '100%', padding: '12px', background: colors.accent, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', opacity: generating ? 0.6 : 1 }}>
              {generating ? '⏳ Generating...' : '✨ Preview Outline'}
            </button>

            {outline.length > 0 && (
              <button onClick={generateFull} disabled={generating}
                style={{ width: '100%', padding: '12px', background: colors.accentGreen, color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                📥 Generate & Download .PPTX
              </button>
            )}

            {downloadPath && (
              <a href={`http://localhost:8080/${downloadPath}`} target="_blank" rel="noreferrer"
                style={{ display: 'block', textAlign: 'center', padding: '10px', background: colors.accentCyan, color: '#000', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>
                ⬇ Download File
              </a>
            )}
          </div>

          {/* Right: Preview */}
          <div style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
            {outline.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textMuted, fontSize: '0.85rem', gap: '15px' }}>
                <span style={{ fontSize: '3rem', opacity: 0.3 }}>📊</span>
                <span>Enter a topic and click "Preview Outline"</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Title Slide Preview */}
                <div style={{
                  aspectRatio: '16/9', background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentCyan})`,
                  borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px'
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', textAlign: 'center' }}>{topic.toUpperCase()}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '10px' }}>Generated by AXIOM Studio</div>
                </div>

                {outline.map((slide, i) => (
                  <div key={i} style={{
                    background: colors.bgTertiary, borderRadius: '10px', border: `1px solid ${colors.border}`,
                    padding: '18px', display: 'flex', gap: '15px'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: slide.accent_color || colors.accent, color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: '6px' }}>{slide.title}</div>
                      <div style={{ color: colors.textMuted, fontSize: '0.8rem', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{slide.content}</div>
                      {slide.layout && <span style={{ fontSize: '0.6rem', color: colors.accentCyan, textTransform: 'uppercase', marginTop: '8px', display: 'inline-block', background: `${colors.accentCyan}15`, padding: '2px 8px', borderRadius: '4px' }}>{slide.layout}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
