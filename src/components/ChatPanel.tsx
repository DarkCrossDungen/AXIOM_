import React, { useState } from 'react';
import { useSyncEngine } from '../store/syncEngine';
import { useTheme } from '../ThemeContext';

export const ChatPanel = () => {
  const { chatHistory, sendChatCommand } = useSyncEngine();
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'inference'>('inference');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = () => {
    if (input.trim()) { sendChatCommand(input); setInput(''); }
  };

  const handleInference = () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      sendChatCommand(`[Inference] Successfully compiled target for: ${input}`);
      setIsGenerating(false); setInput(''); setActiveTab('chat');
    }, 800);
  };

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: '10px', background: active ? colors.bgTertiary : 'transparent',
    border: 'none', borderBottom: active ? `1px solid ${colors.accent}` : '1px solid transparent',
    color: active ? colors.textPrimary : colors.textMuted, cursor: 'pointer', fontWeight: 500,
    fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' as const, transition: '0.2s'
  });

  return (
    <aside style={{ width: '340px', borderRight: `1px solid ${colors.border}`, background: colors.bgCanvas, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '0', borderBottom: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', padding: '12px 15px 8px 15px', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: colors.accent, fontSize: '0.8rem' }}>⬡</span>
          <h3 style={{ margin: 0, color: colors.textSecondary, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>AXIOM Compute Node</h3>
        </div>
        <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, background: colors.bgSecondary }}>
          <button onClick={() => setActiveTab('inference')} style={tabStyle(activeTab === 'inference')}>Inference</button>
          <button onClick={() => setActiveTab('chat')} style={tabStyle(activeTab === 'chat')}>Terminal</button>
        </div>
      </header>

      {activeTab === 'chat' && (
        <div style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          <div style={{ background: `${colors.accent}0a`, padding: '10px', borderLeft: `2px solid ${colors.accent}`, color: colors.textSecondary, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>
            [SYSTEM] SAGE + TPSE Online.<br />Awaiting node target constraints...
          </div>
          {chatHistory.map(msg => (
            <div key={msg.id} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? colors.bgTertiary : 'transparent',
              border: msg.sender === 'user' ? `1px solid ${colors.borderHover}` : 'none',
              borderLeft: msg.sender !== 'user' ? `2px solid ${colors.accentGreen}` : 'none',
              padding: '8px 12px', borderRadius: msg.sender === 'user' ? '6px' : '0',
              maxWidth: '90%', fontSize: '0.78rem', color: colors.textSecondary,
              fontFamily: msg.sender !== 'user' ? 'JetBrains Mono, monospace' : 'inherit', lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inference' && (
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: colors.textMuted, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Prompt Payload</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter structural or visual requirements..."
              style={{ width: '100%', height: '80px', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '4px', padding: '10px', color: colors.textPrimary, fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: colors.textMuted, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px' }}>CFG Scale</label>
              <span style={{ color: colors.accent, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>7.5</span>
            </div>
            <input type="range" min={1} max={20} defaultValue={7.5} step={0.5} style={{ width: '100%', accentColor: colors.accent }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: colors.textMuted, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Compute Node</label>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, background: `${colors.accent}15`, border: `1px solid ${colors.accent}60`, borderRadius: '4px', padding: '6px', textAlign: 'center', cursor: 'pointer', color: colors.textSecondary, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>Edge [Local]</div>
              <div style={{ flex: 1, background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '4px', padding: '6px', textAlign: 'center', cursor: 'pointer', color: colors.textMuted, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>Cluster [Cloud]</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: colors.textMuted, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Base Weights</label>
            <select style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.textSecondary, padding: '8px', borderRadius: '4px', outline: 'none', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }}>
              <option>axiom-core-v4</option>
              <option>sdxl-turbo-arch</option>
              <option>flux-dev-layout</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: colors.textMuted, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Seed</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" defaultValue="-1" style={{ flex: 1, background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.textSecondary, padding: '8px', borderRadius: '4px', outline: 'none', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }} />
              <button style={{ background: colors.bgTertiary, border: `1px solid ${colors.inputBorder}`, color: colors.textMuted, padding: '0 12px', borderRadius: '4px', cursor: 'pointer' }}>🎲</button>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <button onClick={handleInference} disabled={isGenerating || !input.trim()}
              style={{ width: '100%', padding: '12px', background: isGenerating ? colors.bgTertiary : colors.accent, color: isGenerating ? colors.textMuted : '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isGenerating || !input.trim() ? 'not-allowed' : 'pointer', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', transition: '0.2s' }}>
              {isGenerating ? 'Compiling Graph...' : 'Execute Inference'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div style={{ padding: '15px', borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', background: colors.inputBg, borderRadius: '6px', border: `1px solid ${colors.inputBorder}` }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Enter command..."
              style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: colors.textPrimary, outline: 'none', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }} />
            <button onClick={handleSend} style={{ background: 'transparent', color: colors.accent, border: 'none', padding: '0 12px', cursor: 'pointer', fontSize: '1rem' }}>↵</button>
          </div>
        </div>
      )}
    </aside>
  );
};
