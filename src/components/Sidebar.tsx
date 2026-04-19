import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useSyncEngine } from '../store/syncEngine';
import { useTheme } from '../ThemeContext';

export const Sidebar = ({ onUpgrade, onOpenPPT, onOpen3D }: { onUpgrade: () => void; onOpenPPT: () => void; onOpen3D: () => void }) => {
  const { toggleNexus, activeTool, setActiveTool } = useSyncEngine();
  const { colors, theme, toggleTheme } = useTheme();

  const toolGroups = [
    { section: 'Design', tools: [
      { icon: '▤', name: 'Parametric Graph', id: 'param_graph' },
      { icon: '∿', name: 'Curve Editor', id: 'curve_editor' },
      { icon: '◧', name: 'Material & Shader Editor', id: 'material_editor' },
      { icon: '⬡', name: 'Neural Network Graph', id: 'nn_graph' },
    ]},
    { section: 'AI', tools: [
      { icon: '⑆', name: 'Style Transfer Pipeline', id: 'style_transfer' },
      { icon: '⍾', name: 'Voice-to-Action Console', id: 'voice_action' },
      { icon: '⏣', name: 'LLM Prompt Router', id: 'llm_router' },
      { icon: '⎔', name: 'Agentic Workflow Builder', id: 'agent_workflow' },
    ]},
    { section: 'Engine', tools: [
      { icon: '∑', name: 'Z3 Constraint Solver', id: 'z3_solver' },
      { icon: '⌗', name: 'Memory Inspector', id: 'memory_inspect' },
      { icon: '⎄', name: 'Topology Nodes', id: 'topology' },
      { icon: '◫', name: 'Non-Linear Timeline (NLE)', id: 'nle_timeline' },
    ]},
    { section: 'Render', tools: [
      { icon: '⏦', name: 'Raytracing Configurator', id: 'raytrace' },
      { icon: '⍲', name: 'Procedural Engine', id: 'procedural' },
      { icon: '⌨', name: 'Integrated IDE', id: 'ide' },
      { icon: '⎌', name: 'Node Compositor', id: 'compositor' },
    ]},
  ];

  return (
    <div style={{
      width: '48px', background: colors.bgPrimary, borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px',
      zIndex: 50, gap: '2px', overflowY: 'auto', overflowX: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ color: colors.accent, fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>⬡</div>

      {/* PPT Tool */}
      <div title="PPT Automation" onClick={onOpenPPT}
        style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', color: colors.accentGreen, border: `1px solid ${colors.accentGreen}30`, background: `${colors.accentGreen}10`, transition: '0.2s', marginBottom: '2px' }}
        onMouseEnter={e => { e.currentTarget.style.background = `${colors.accentGreen}25`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${colors.accentGreen}10`; }}>
        📊
      </div>

      {/* 3D Tool */}
      <div title="3D Model Engine" onClick={onOpen3D}
        style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', color: colors.accentYellow, border: `1px solid ${colors.accentYellow}30`, background: `${colors.accentYellow}10`, transition: '0.2s', marginBottom: '4px' }}
        onMouseEnter={e => { e.currentTarget.style.background = `${colors.accentYellow}25`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${colors.accentYellow}10`; }}>
        🎲
      </div>

      <div style={{ width: '24px', height: '1px', background: colors.border, marginBottom: '4px' }} />

      {/* All Tools */}
      {toolGroups.map(group => (
        <React.Fragment key={group.section}>
          {group.tools.map(t => (
            <div key={t.id} title={`${t.name} (FREE)`}
              onClick={() => setActiveTool(activeTool === t.id ? null : t.id)}
              style={{
                width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                borderRadius: '4px', cursor: 'pointer',
                opacity: activeTool === t.id ? 1 : 0.5,
                fontSize: '1rem', transition: '0.2s',
                color: activeTool === t.id ? colors.accent : colors.textPrimary,
                background: activeTool === t.id ? `${colors.accent}20` : 'transparent',
                border: activeTool === t.id ? `1px solid ${colors.accent}40` : '1px solid transparent'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = colors.bgTertiary; }}
              onMouseLeave={e => { if (activeTool !== t.id) { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent'; } }}>
              {t.icon}
            </div>
          ))}
          <div style={{ width: '20px', height: '1px', background: colors.border, margin: '3px 0' }} />
        </React.Fragment>
      ))}

      <div style={{ flex: 1 }} />

      {/* Nexus */}
      <div title="AXIOM Nexus Assistant" onClick={toggleNexus}
        style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', color: colors.accentCyan, border: `1px solid ${colors.accentCyan}30`, background: `${colors.accentCyan}08`, transition: '0.3s', marginBottom: '4px' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 10px ${colors.accentCyan}50`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
        🌌
      </div>

      {/* Theme Toggle */}
      <div title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} onClick={toggleTheme}
        style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', color: colors.accentYellow, background: `${colors.accentYellow}10`, border: `1px solid ${colors.accentYellow}20`, transition: '0.3s', marginBottom: '4px' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </div>

      {/* Upgrade */}
      <div title="All tools FREE during Beta!" onClick={onUpgrade}
        style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '0.55rem', fontWeight: 900, color: colors.accentGreen, border: `1px solid ${colors.accentGreen}40`, marginBottom: '4px' }}>
        FREE
      </div>

      {/* Login */}
      <div title="Login with Google"
        onClick={() => { const p = new GoogleAuthProvider(); signInWithPopup(auth, p).catch(err => console.error(err)); }}
        style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', color: colors.accent, marginBottom: '4px' }}>
        👤
      </div>

      {/* Settings */}
      <div style={{ width: '34px', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '6px', background: colors.bgTertiary, cursor: 'pointer', marginBottom: '10px', fontSize: '1rem', color: colors.textPrimary, opacity: 0.5 }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}>
        ⚙
      </div>
    </div>
  );
};
