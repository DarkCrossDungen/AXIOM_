import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { ThreeViewer } from './canvas/ThreeViewer';
import { AnimationTimeline } from './timeline/AnimationTimeline';

export const ThreeDViewer = ({ onClose }: { onClose: () => void }) => {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [modelUrl, setModelUrl] = useState('');
  const [method, setMethod] = useState('demo');
  const [colabUrl, setColabUrl] = useState('');
  
  // Animation state
  const [keyframes, setKeyframes] = useState<any[]>([]);
  const [animating, setAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationDuration = 5.0; // Fixed duration for now

  const generate3D = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setColabUrl('');
    try {
      const resp = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/generate/3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, method })
      });
      const data = await resp.json();
      if (data.file_path) setModelUrl(`${import.meta.env.VITE_API_BASE_URL || ''}/outputs/3d_models/${data.filename}`);
      if (data.colab_url) setColabUrl(data.colab_url);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const generateAnimation = async (animPrompt: string) => {
    setAnimating(true);
    try {
      const resp = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: animPrompt || 'product showcase', duration: animationDuration })
      });
      const data = await resp.json();
      setKeyframes(data.keyframes || []);
    } catch (e) { console.error(e); }
    finally { setAnimating(false); }
  };

  const openInBlender = async () => {
    try {
      await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/blender/launch', { method: 'POST' });
    } catch (e) { console.error(e); }
  };

  // Natively update timeline time if playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= animationDuration) {
            setIsPlaying(false);
            return 0; // Reset or stop
          }
          return prevTime + 0.05; // 20FPS update on UI
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, animationDuration]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(5,5,7,0.92)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        width: '1200px', maxHeight: '90vh', height: '80vh', background: colors.bgSecondary,
        borderRadius: '16px', border: `1px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <header style={{ padding: '16px 25px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.3rem' }}>🎲</span>
            <h2 style={{ margin: 0, color: colors.textPrimary, fontSize: '1rem', letterSpacing: '1px' }}>NATIVE 3D ENGINE + ANIMATION</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={openInBlender} style={{ background: '#EA7600', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}>🔗 Export Video (Blender)</button>
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

            {/* MCP Auto-Pilot Section */}
            <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: `1px solid ${colors.border}` }}>
              <label style={{ color: colors.accentCyan, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Autopilot (Blender MCP)</label>
              <button 
                onClick={async () => {
                  if (!prompt.trim()) return;
                  setGenerating(true);
                  try {
                    const resp = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/mcp/blender/autonomous', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt })
                    });
                    const data = await resp.json();
                    if (data.status === 'fallback' && data.colab_solution) {
                      // Trigger download of ipynb 
                      const a = document.createElement('a');
                      a.href = data.colab_solution;
                      a.download = `AXIOM_Auto_Cloud_Render_${Date.now()}.ipynb`;
                      a.click();
                      alert('Local Blender render failed. Auto-generated a Google Colab notebook for you. Please just upload it and press Run!');
                    } else if (data.status === 'success') {
                      alert('Render completed automatically via Blender MCP!');
                    } else {
                      alert('Error: ' + data.message);
                    }
                  } catch (e) {
                     console.error(e);
                  } finally {
                     setGenerating(false);
                  }
                }} 
                disabled={generating || !prompt.trim()}
                style={{ width: '100%', padding: '11px', background: 'linear-gradient(45deg, #FF0080, #7928CA)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', opacity: generating ? 0.5 : 1 }}
              >
                {generating ? '🤖 Scripting & Rendering...' : '🚀 1-Click Auto-Build & Render'}
              </button>
            </div>

            {colabUrl && (
              <a href={colabUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#F9AB00', color: '#000', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem', textDecoration: 'none' }}>
                ☁️ Open Google Colab
              </a>
            )}
            
            <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.3)', borderRadius: 8 }}>
                 <h4 style={{ color: '#00d2ff', fontSize: '0.7rem', marginTop: 0, marginBottom: 8 }}>TIP</h4>
                 <p style={{ color: colors.textSecondary, fontSize: '0.65rem', margin: 0, lineHeight: 1.5 }}>
                     Generate a 3D model, then use the bottom timeline panel to describe an animation to the AI!
                 </p>
            </div>
          </div>

          {/* Center: Real 3D Viewport with Timeline Overlay */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative', background: '#111' }}>
                <ThreeViewer 
                    url={modelUrl} 
                    keyframes={keyframes} 
                    isPlaying={isPlaying} 
                    currentTime={currentTime} 
                />
                
                {/* Overlay Timeline */}
                <AnimationTimeline 
                  keyframes={keyframes}
                  duration={animationDuration}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onTimeChange={(time) => setCurrentTime(time)}
                  onPlayToggle={(playing) => setIsPlaying(playing)}
                  onGenerateAnimation={generateAnimation}
                  isGenerating={animating}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
