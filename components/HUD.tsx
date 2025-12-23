
import React from 'react';

interface HUDProps {
  score: number;
}

const HUD: React.FC<HUDProps> = ({ score }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 p-8 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest block mb-1">Current Score</span>
          <span className="text-white text-4xl font-black tabular-nums">{score.toLocaleString().padStart(6, '0')}</span>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-red-600/20 backdrop-blur-md p-3 px-6 rounded-2xl border border-red-500/30 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="text-red-500 font-bold uppercase text-xs tracking-tighter">Live Mission</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar Hints */}
      <div className="flex justify-center mb-8">
        <div className="bg-black/60 backdrop-blur-lg px-8 py-4 rounded-3xl border border-white/10 text-white text-center shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm italic">i</span>
              <span className="text-sm font-medium opacity-80 italic">Aim with Index Finger</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm italic">t</span>
              <span className="text-sm font-medium opacity-80 italic">Trigger with Thumb</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corner UI Elements */}
      <div className="absolute bottom-8 right-8 text-right opacity-30">
        <p className="text-[10px] text-white font-mono uppercase tracking-[0.4em]">AR Systems Active // V.0.4.164</p>
        <p className="text-[10px] text-white font-mono uppercase tracking-[0.4em]">Hand Tracking: ENABLED</p>
      </div>
    </div>
  );
};

export default HUD;
