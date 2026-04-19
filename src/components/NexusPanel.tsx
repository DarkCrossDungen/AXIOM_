import React, { useState } from 'react';
import { useSyncEngine } from '../store/syncEngine';
import { useTheme } from '../ThemeContext';

export const NexusPanel = () => {
  const { nexusActive, toggleNexus, userStyle, connections, leads, setNexusState } = useSyncEngine();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'leads' | 'pulse'>('profile');
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  if (!nexusActive) return null;

  const handleAnalyze = async (url: string) => {
    setAnalyzing(true);
    try {
      const resp = await fetch('http://localhost:8080/api/nexus/analyze-style', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: url, is_url: true })
      });
      const data = await resp.json();
      setNexusState('userStyle', data);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const fetchLeads = async () => {
    try {
      const resp = await fetch('http://localhost:8080/api/reddit/leads');
      const data = await resp.json();
      setNexusState('leads', data.leads);
    } catch (e) { console.error(e); }
  };

  const loadSuggestions = async () => {
    try {
      const resp = await fetch('http://localhost:8080/api/nexus/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: 'AI Design Tools', style_context: userStyle || {} })
      });
      const data = await resp.json();
      setSuggestions(data.suggestions || []);
    } catch (e) { console.error(e); }
  };

  const inputStyle = { width: '100%', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, padding: '10px', borderRadius: '6px', color: colors.textPrimary, fontSize: '0.78rem', boxSizing: 'border-box' as const, outline: 'none' };

  return (
    <div style={{ position: 'fixed', right: '340px', top: '20px', bottom: '20px', width: '400px', background: colors.bgPrimary, border: `1px solid ${colors.border}`, borderRadius: '12px', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
      <header style={{ padding: '15px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: colors.accentCyan, fontSize: '1.1rem' }}>🌌</span>
          <h2 style={{ margin: 0, fontSize: '0.88rem', color: colors.textPrimary, letterSpacing: '1.5px', textTransform: 'uppercase' }}>AXIOM Nexus</h2>
        </div>
        <button onClick={toggleNexus} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
      </header>

      <nav style={{ display: 'flex', background: colors.bgSecondary, borderBottom: `1px solid ${colors.border}` }}>
        {(['profile', 'leads', 'pulse'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '12px', background: activeTab === tab ? colors.bgTertiary : 'transparent', border: 'none', borderBottom: activeTab === tab ? `2px solid ${colors.accentCyan}` : '2px solid transparent', color: activeTab === tab ? colors.textPrimary : colors.textMuted, fontSize: '0.68rem', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s' }}>
            {tab}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <section>
              <label style={{ color: colors.textMuted, fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Identity Connections</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Website URL" defaultValue={connections.website} onBlur={e => setNexusState('connections', { ...connections, website: e.target.value })} style={inputStyle} />
                <button onClick={() => handleAnalyze(connections.website || '')} disabled={analyzing}
                  style={{ width: '100%', padding: '10px', background: colors.accentCyan, color: '#000', border: 'none', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                  {analyzing ? 'Analyzing Brand...' : 'Analyze & Sync Style'}
                </button>
              </div>
            </section>
            <section>
              <label style={{ color: colors.textMuted, fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Reddit API (Leads)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="password" placeholder="Client ID" style={inputStyle} />
                <input type="password" placeholder="Client Secret" style={inputStyle} />
              </div>
            </section>
            {userStyle && (
              <section style={{ background: colors.inputBg, padding: '15px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                <label style={{ color: colors.accentCyan, fontSize: '0.62rem', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Active Brand Vector</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {userStyle.primary_colors?.map((c: string) => (<div key={c} style={{ width: '20px', height: '20px', borderRadius: '40%', background: c }} title={c} />))}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.72rem', color: colors.textSecondary }}>
                  <strong>Tone:</strong> {userStyle.tone_of_voice}<br /><strong>Style:</strong> {userStyle.visual_style}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'leads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={fetchLeads} style={{ background: colors.bgTertiary, border: `1px solid ${colors.inputBorder}`, color: colors.textPrimary, padding: '8px', borderRadius: '4px', fontSize: '0.68rem', cursor: 'pointer' }}>Fetch Live Leads</button>
            {(leads || []).map((lead: any, i: number) => (
              <div key={i} style={{ background: colors.inputBg, padding: '12px', borderRadius: '8px', border: `1px solid ${colors.inputBorder}` }}>
                <div style={{ color: colors.accentRed, fontSize: '0.58rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '5px' }}>{lead.subreddit} • {lead.intent} Intent</div>
                <div style={{ color: colors.textPrimary, fontSize: '0.78rem', fontWeight: 600, marginBottom: '5px' }}>{lead.title}</div>
                <div style={{ color: colors.textMuted, fontSize: '0.68rem', marginBottom: '10px' }}>{lead.preview}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, background: colors.bgTertiary, color: colors.textPrimary, border: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.62rem', cursor: 'pointer' }}>View Thread</button>
                  <button style={{ flex: 1, background: colors.accentCyan, color: '#000', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer' }}>AI Reply</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pulse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={loadSuggestions} style={{ background: colors.accent, color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Generate Daily Suggestions</button>
            {suggestions.map((s: any, i: number) => (
              <div key={i} style={{ background: colors.inputBg, padding: '15px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: colors.accent, fontSize: '0.62rem', fontWeight: 700 }}>{s.platform}</span>
                  <span style={{ color: colors.textMuted, fontSize: '0.58rem' }}>Suggestion</span>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '0.72rem', lineHeight: '1.4', marginBottom: '12px' }}>{s.content_text}</div>
                <div style={{ background: colors.bgTertiary, padding: '8px', borderRadius: '4px', color: colors.textMuted, fontSize: '0.62rem', marginBottom: '12px', border: `1px dashed ${colors.inputBorder}` }}>
                  <strong>Media Prompt:</strong> {s.media_prompt}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, background: 'transparent', border: `1px solid ${colors.inputBorder}`, color: colors.textPrimary, padding: '8px', borderRadius: '6px', fontSize: '0.68rem', cursor: 'pointer' }}>Edit</button>
                  <button style={{ flex: 1, background: colors.accentGreen, color: '#000', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>Approve & Post</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ padding: '12px', borderTop: `1px solid ${colors.border}`, textAlign: 'center', color: colors.textMuted, fontSize: '0.58rem', letterSpacing: '2px' }}>
        PERSONAL ASSISTANT ONLINE
      </footer>
    </div>
  );
};
