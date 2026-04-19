import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, Loader } from 'lucide-react';
import { Keyframe } from '../canvas/ThreeViewer';

interface TimelineProps {
  keyframes: Keyframe[];
  duration: number; // in seconds
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayToggle: (playing: boolean) => void;
  onGenerateAnimation: (prompt: string) => void;
  isGenerating: boolean;
}

export function AnimationTimeline({
  keyframes,
  duration,
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayToggle,
  onGenerateAnimation,
  isGenerating
}: TimelineProps) {
  const [prompt, setPrompt] = useState('Cinematic 360 degree product reveal');

  // Format time (e.g. 1.5 -> "01:50")
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      backgroundColor: 'rgba(20, 20, 25, 0.85)',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: '16px 24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      zIndex: 100
    }}>
      {/* Top Bar: Controls & AI Prompt */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={() => onTimeChange(0)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <SkipBack size={20} />
          </button>
          <button 
            onClick={() => onPlayToggle(!isPlaying)}
            style={{ 
              background: '#00d2ff', 
              border: 'none', 
              color: '#000', 
              borderRadius: '50%', 
              width: 40, height: 40, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <span style={{ fontFamily: 'monospace', fontSize: 14, minWidth: 80 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flex: 1, marginLeft: 32, maxWidth: 400 }}>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe cool animation..." 
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'white',
              outline: 'none'
            }}
          />
          <button 
            onClick={() => onGenerateAnimation(prompt)}
            disabled={isGenerating}
            style={{
              background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'white',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isGenerating ? <Loader size={16} className="animate-spin" /> : 'Animate AI'}
          </button>
        </div>
      </div>

      {/* Scrubber / Timeline */}
      <div style={{ position: 'relative', width: '100%', height: 24, display: 'flex', alignItems: 'center' }}>
        <input 
          type="range" 
          min={0} 
          max={duration} 
          step={0.01}
          value={currentTime}
          onChange={(e) => {
            onPlayToggle(false); // pause when seeking
            onTimeChange(parseFloat(e.target.value));
          }}
          style={{ width: '100%', cursor: 'pointer', zIndex: 2 }}
        />
        
        {/* Render Keyframes as dots on the timeline tracker */}
        {keyframes.map((kf, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              left: `${(kf.time / duration) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#00d2ff',
              boxShadow: '0 0 5px #00d2ff',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
}
