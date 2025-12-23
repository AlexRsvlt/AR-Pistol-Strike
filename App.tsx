
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, HandResults, Landmark } from './types';
import GameScene from './components/GameScene';
import LoadingScreen from './components/LoadingScreen';
import HUD from './components/HUD';

// MediaPipe version pinned to requirements
const MP_VERSION = '0.4.1646424915';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [handData, setHandData] = useState<Landmark[] | null>(null);
  const [score, setScore] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const lastDetectionTime = useRef(0);
  const detectionFrequency = 30; // 30ms between detections (~33fps detection)

  // Initialize MediaPipe Hands
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const video = document.getElementById('video-feed') as HTMLVideoElement;
        videoRef.current = video;

        // @ts-ignore - Hands is loaded via global script
        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });

        hands.onResults((results: HandResults) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandData(results.multiHandLandmarks[0]);
          } else {
            setHandData(null);
          }
        });

        handsRef.current = hands;

        // Start video stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 1280, height: 720 } 
        });
        video.srcObject = stream;

        // Wait for video to be ready
        video.onloadedmetadata = () => {
          setLoadingProgress(100);
          setGameState(GameState.READY);
          startDetectionLoop();
        };

      } catch (error) {
        console.error("Critical error loading MediaPipe:", error);
        alert("Failed to load camera or model. Please check permissions.");
      }
    };

    const startDetectionLoop = () => {
      const detect = async () => {
        if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2) {
          const now = performance.now();
          if (now - lastDetectionTime.current >= detectionFrequency) {
            try {
              await handsRef.current.send({ image: videoRef.current });
              lastDetectionTime.current = now;
            } catch (e) {
              console.warn("Detection frame dropped due to error", e);
            }
          }
        }
        requestAnimationFrame(detect);
      };
      detect();
    };

    initMediaPipe();

    return () => {
      if (handsRef.current) handsRef.current.close();
    };
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const onHit = useCallback(() => {
    setScore(prev => prev + 100);
  }, []);

  const onMiss = useCallback(() => {
    setScore(prev => Math.max(0, prev - 25));
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* Three.js Game Layer */}
      <GameScene 
        handData={handData} 
        gameState={gameState} 
        onHit={onHit} 
        onMiss={onMiss}
      />

      {/* Overlay UI */}
      {gameState === GameState.LOADING && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {gameState === GameState.READY && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic">PISTOL STRIKE AR</h1>
          <p className="text-xl text-blue-300 mb-8 font-medium">Use your hand as a pistol to aim and fire!</p>
          <div className="bg-white/10 p-6 rounded-2xl mb-12 border border-white/20 text-center">
            <h3 className="text-white font-bold mb-3 uppercase tracking-widest text-sm">How to Play</h3>
            <ul className="text-gray-300 space-y-2 text-left">
              <li>👉 Point with your <b>Index Finger</b> to aim</li>
              <li>👍 Pull down your <b>Thumb</b> to shoot</li>
              <li>🎯 Snappy aim assist helps you hit targets</li>
            </ul>
          </div>
          <button 
            onClick={handleStartGame}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xl rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.5)]"
          >
            START MISSION
          </button>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <HUD score={score} />
      )}
    </div>
  );
};

export default App;
