import React, { useState, useRef } from 'react';
import { useTheme } from '../ThemeContext';

export const ThreeDViewer = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [modelUrl, setModelUrl] = useState('');
  const [method, setMethod] = useState('demo');
  const [colabUrl, setColabUrl] = useState('');
  const [keyframes, setKeyframes] = useState<any[]>([]);
  const [animating, setAnimating] = useState(false);

  // Animation controls
  const [animSpeed, setAnimSpeed] = useState(1);
  const [animType, setAnimType] = useState('spin');
  const [manualRotX, setManualRotX] = useState(0);
  const [manualRotY, setManualRotY] = useState(0);
  const [manualRotZ, setManualRotZ] = useState(0);
  const [manualPosY, setManualPosY] = useState(0);
  const [manualScale, setManualScale] = useState(1);

  const generate3D = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setColabUrl('');
    try {
      const resp = await fetch('http://localhost:8080/api/generate/3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, method })
      });
      const data = await resp.json();
      if (data.file_path) setModelUrl(`http://localhost:8080/outputs/3d_models/${data.filename}`);
      if (data.colab_url) setColabUrl(data.colab_url);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const generateAnimation = async () => {
    setAnimating(true);
    try {
      const resp = await fetch('http://localhost:8080/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || 'product showcase', duration: 5.0 })
      });
      const data = await resp.json();
      setKeyframes(data.keyframes || []);
    } catch (e) { console.error(e); }
    finally { setAnimating(false); }
  };

  const openInBlender = async () => {
    try {
      await fetch('http://localhost:8080/api/blender/launch', { method: 'POST' });
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(5,5,7,0.92)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        width: '1100px', maxHeight: '90vh', background: colors.bgSecondary,
        borderRadius: '16px', border: `1px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <header style={{ padding: '16px 25px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.3rem' }}>🎲</span>
            <h2 style={{ margin: 0, color: colors.textPrimary, fontSize: '1rem', letterSpacing: '1px' }}>3D MODEL ENGINE + ANIMATION</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={openInBlender} style={{ background: '#EA7600', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>🔗 Open in Blender</button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '1.4rem' }}>×</button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Controls */}
          <div style={{ width: '300px', padding: '20px', borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <div>
              <label style={{ color: colors.textMuted, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>3D Prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. A futuristic electric car..."
                style={{ width: '100%', height: '70px', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '6px', padding: '10px', color: colors.textPrimary, fontSize: '0.8rem', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ color: colors.textMuted, fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Generation Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)}
                style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '6px', padding: '8px', color: colors.textPrimary, boxSizing: 'border-box' }}>
                <option value="demo">Demo (Instant Cube)</option>
                <option value="shape">ShapE (Local GPU)</option>
                <option value="cloud">Cloud (Google Colab)</option>
              </select>
            </div>

            <button onClick={generate3D} disabled={generating || !prompt.trim()}
              style={{ width: '100%', padding: '11px', background: colors.accent, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', opacity: generating ? 0.5 : 1 }}>
              {generating ? '⏳ Generating...' : '🎲 Generate 3D Model'}
            </button>

            {colabUrl && (
              <a href={colabUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#F9AB00', color: '#000', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem', textDecoration: 'none' }}>
                ☁️ Open Google Colab
              </a>
            )}

            {/* Animation Section */}
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
              <label style={{ color: colors.accentCyan, fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '12px' }}>🎬 ANIMATION CONTROLS</label>

              <button onClick={generateAnimation} disabled={animating}
                style={{ width: '100%', padding: '10px', background: colors.accentCyan, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', marginBottom: '12px' }}>
                {animating ? 'Generating...' : '✨ AI Auto-Animate'}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ color: colors.textMuted, fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}><span>Rotation X</span><span>{manualRotX}°</span></label>
                  <input type="range" min={-180} max={180} value={manualRotX} onChange={e => setManualRotX(Number(e.target.value))} style={{ width: '100%', accentColor: colors.accent }} />
                </div>
                <div>
                  <label style={{ color: colors.textMuted, fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}><span>Rotation Y</span><span>{manualRotY}°</span></label>
                  <input type="range" min={-180} max={180} value={manualRotY} onChange={e => setManualRotY(Number(e.target.value))} style={{ width: '100%', accentColor: colors.accentCyan }} />
                </div>
                <div>
                  <label style={{ color: colors.textMuted, fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}><span>Rotation Z</span><span>{manualRotZ}°</span></label>
                  <input type="range" min={-180} max={180} value={manualRotZ} onChange={e => setManualRotZ(Number(e.target.value))} style={{ width: '100%', accentColor: colors.accentGreen }} />
                </div>
                <div>
                  <label style={{ color: colors.textMuted, fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}><span>Height (Y Pos)</span><span>{manualPosY}</span></label>
                  <input type="range" min={-5} max={5} step={0.1} value={manualPosY} onChange={e => setManualPosY(Number(e.target.value))} style={{ width: '100%', accentColor: colors.accentYellow }} />
                </div>
                <div>
                  <label style={{ color: colors.textMuted, fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}><span>Scale</span><span>{manualScale.toFixed(1)}x</span></label>
                  <input type="range" min={0.1} max={3} step={0.1} value={manualScale} onChange={e => setManualScale(Number(e.target.value))} style={{ width: '100%', accentColor: colors.accentRed }} />
                </div>
                <div>
                  <label style={{ color: colors.textMuted, fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}><span>Speed</span><span>{animSpeed}x</span></label>
                  <input type="range" min={0.1} max={5} step={0.1} value={animSpeed} onChange={e => setAnimSpeed(Number(e.target.value))} style={{ width: '100%', accentColor: '#fff' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Center: 3D Viewport */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: colors.bgPrimary }}>
              {modelUrl ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* CSS 3D Cube Preview with manual controls */}
                  <div style={{
                    perspective: '800px', width: '200px', height: '200px',
                  }}>
                    <div style={{
                      width: '200px', height: '200px', position: 'relative',
                      transformStyle: 'preserve-3d',
                      transform: `rotateX(${manualRotX}deg) rotateY(${manualRotY}deg) rotateZ(${manualRotZ}deg) translateY(${manualPosY * 20}px) scale(${manualScale})`,
                      animation: animType === 'spin' ? `spin ${5 / animSpeed}s linear infinite` : 'none',
                      transition: 'transform 0.15s ease-out'
                    }}>
                      {[
                        { transform: 'translateZ(100px)', bg: `linear-gradient(135deg, ${colors.accent}, ${colors.accentCyan})` },
                        { transform: 'rotateY(180deg) translateZ(100px)', bg: `linear-gradient(135deg, ${colors.accentCyan}, ${colors.accentGreen})` },
                        { transform: 'rotateY(90deg) translateZ(100px)', bg: `linear-gradient(135deg, ${colors.accentGreen}, ${colors.accentYellow})` },
                        { transform: 'rotateY(-90deg) translateZ(100px)', bg: `linear-gradient(135deg, ${colors.accentYellow}, ${colors.accentRed})` },
                        { transform: 'rotateX(90deg) translateZ(100px)', bg: `linear-gradient(135deg, ${colors.accentRed}, ${colors.accent})` },
                        { transform: 'rotateX(-90deg) translateZ(100px)', bg: `linear-gradient(135deg, ${colors.accent}88, ${colors.accentCyan}88)` },
                      ].map((face, i) => (
                        <div key={i} style={{
                          position: 'absolute', width: '200px', height: '200px',
                          background: face.bg, border: `1px solid rgba(255,255,255,0.2)`,
                          transform: face.transform, opacity: 0.85,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', color: '#fff', fontWeight: 700, backdropFilter: 'blur(4px)'
                        }}>
                          {i === 0 ? 'AXIOM 3D' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  <style>{`@keyframes spin { from { transform: rotateX(${manualRotX}deg) rotateY(0deg); } to { transform: rotateX(${manualRotX}deg) rotateY(360deg); } }`}</style>
                </div>
              ) : (
                <div style={{ color: colors.textMuted, textAlign: 'center', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '15px' }}>🎲</div>
                  Enter a prompt and generate a 3D model
                </div>
              )}
            </div>

            {/* Keyframes timeline */}
            {keyframes.length > 0 && (
              <div style={{ height: '100px', borderTop: `1px solid ${colors.border}`, padding: '10px 20px', overflowX: 'auto' }}>
                <div style={{ color: colors.textMuted, fontSize: '0.6rem', marginBottom: '8px', textTransform: 'uppercase' }}>AI Keyframes</div>
                <div style={{ display: 'flex', gap: '8px', height: '50px', alignItems: 'flex-end' }}>
                  {keyframes.map((kf, i) => (
                    <div key={i} style={{
                      minWidth: '80px', background: colors.bgTertiary, border: `1px solid ${colors.accent}`,
                      borderRadius: '6px', padding: '6px 8px', fontSize: '0.55rem', color: colors.textSecondary
                    }}>
                      <div style={{ fontWeight: 700, color: colors.accent }}>{kf.time}s</div>
                      <div>R: [{kf.rotation?.map((v: number) => v.toFixed(0)).join(',')}]</div>
                      <div>S: [{kf.scale?.map((v: number) => v.toFixed(1)).join(',')}]</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
