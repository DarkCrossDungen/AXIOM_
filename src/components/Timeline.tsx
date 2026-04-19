import React from 'react';

export const Timeline = () => (
    <div style={{ height: '260px', background: '#0a0a0d', borderTop: '1px solid #1a1a24', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #1a1a24', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>Sequence Timeline</span>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button style={{ background: '#1a1a24', border: '1px solid #333', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>⏮</button>
                <button style={{ background: '#7928CA', border: 'none', color: 'white', padding: '4px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>▶ Play</button>
            </div>
            <div style={{ flex: 1, background: '#1a1a24', height: '2px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '15%', top: '-8px', width: '2px', height: '18px', background: '#00d2ff' }}>
                    <div style={{ position: 'absolute', top: '-6px', left: '-4px', width: '10px', height: '10px', background: '#00d2ff', borderRadius: '50%' }}></div>
                </div>
            </div>
        </div>
        <div style={{ flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            {/* Mock Timeline Tracks */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '120px', fontSize: '0.75rem', color: '#888', textAlign: 'right', paddingRight: '10px', borderRight: '1px solid #333' }}>Video (V1)</div>
                <div style={{ flex: 1, display: 'flex', gap: '5px' }}>
                    <div style={{ flex: 0.3, background: 'rgba(121, 40, 202, 0.4)', height: '28px', borderRadius: '4px', border: '1px solid #7928CA', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '0.7rem', color: 'white' }}>Hero Build_up</div>
                    <div style={{ flex: 0.5, background: 'rgba(121, 40, 202, 0.2)', height: '28px', borderRadius: '4px', border: '1px dashed rgba(121, 40, 202, 0.5)' }}></div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '120px', fontSize: '0.75rem', color: '#888', textAlign: 'right', paddingRight: '10px', borderRight: '1px solid #333' }}>Animation (A1)</div>
                <div style={{ flex: 1, paddingLeft: '30%', display: 'flex' }}>
                    <div style={{ width: '20%', background: 'rgba(0, 210, 255, 0.3)', height: '28px', borderRadius: '4px', border: '1px solid #00d2ff', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '0.7rem', color: 'white' }}>FadeIn</div>
                </div>
            </div>
        </div>
    </div>
);
