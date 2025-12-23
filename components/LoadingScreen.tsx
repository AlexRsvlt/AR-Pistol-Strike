
import React from 'react';

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4 border border-white/10">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-blue-400 font-mono text-sm tracking-widest uppercase animate-pulse">
        {progress < 100 ? `Initializing Neural Network... ${Math.round(progress)}%` : 'Ready to Engage'}
      </p>
      
      <div className="mt-12 text-center max-w-xs opacity-40">
        <p className="text-xs font-light text-gray-400 leading-relaxed italic">
          Calibrating AR environment and loading vision models for real-time gesture recognition. 
          Please allow camera access.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
