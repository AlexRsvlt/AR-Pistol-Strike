
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Landmark, GameState, Enemy, VFX } from '../types';

interface GameSceneProps {
  handData: Landmark[] | null;
  gameState: GameState;
  onHit: () => void;
  onMiss: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({ handData, gameState, onHit, onMiss }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const vfxRef = useRef<VFX[]>([]);
  const laserRef = useRef<THREE.Line | null>(null);
  const crosshairRef = useRef<THREE.Mesh | null>(null);
  const lastShotTime = useRef(0);
  const isTriggerDown = useRef(false);

  // Constants
  const SPAWN_COUNT = 4;
  const SHOOT_COOLDOWN = 250; 
  const AIM_ASSIST_STRENGTH_BASE = 0.45; 
  const AIM_ASSIST_RANGE = 2.5; 

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Laser setup
    const laserMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -50)]);
    const laser = new THREE.Line(laserGeo, laserMat);
    laser.visible = false;
    scene.add(laser);
    laserRef.current = laser;

    // Crosshair
    const chGeo = new THREE.RingGeometry(0.12, 0.15, 32);
    const chMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const crosshair = new THREE.Mesh(chGeo, chMat);
    const dotGeo = new THREE.CircleGeometry(0.02, 16);
    const dot = new THREE.Mesh(dotGeo, chMat.clone());
    crosshair.add(dot);
    crosshair.visible = false;
    scene.add(crosshair);
    crosshairRef.current = crosshair;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const playSound = (type: 'hit' | 'shoot' | 'miss') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      } else if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      }

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch(e) {}
  };

  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    let frameId: number;

    const spawnEnemy = () => {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (side === 0) { x = -15; y = Math.random() * 10 - 5; }
      else if (side === 1) { x = 15; y = Math.random() * 10 - 5; }
      else if (side === 2) { x = Math.random() * 20 - 10; y = 15; }
      else { x = Math.random() * 20 - 10; y = -15; }

      const id = Math.random().toString(36).substr(2, 9);
      const enemy: Enemy = {
        id,
        position: { x, y, z: -10 + Math.random() * 5 },
        velocity: { 
          x: (0 - x) * 0.01 * (0.8 + Math.random() * 0.4), 
          y: (0 - y) * 0.01 * (0.8 + Math.random() * 0.4), 
          z: 0.01 
        },
        radius: 0.8 + Math.random() * 0.4,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };

      const geo = new THREE.CylinderGeometry(enemy.radius, enemy.radius, 0.1, 32);
      const mat = new THREE.MeshPhongMaterial({ color: enemy.color, emissive: enemy.color, emissiveIntensity: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = `enemy-${id}`;
      mesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
      mesh.rotation.x = Math.PI / 2;
      sceneRef.current?.add(mesh);

      enemiesRef.current.push(enemy);
    };

    const spawnVFX = (text: string, pos: THREE.Vector3, isHit: boolean) => {
      const id = Math.random().toString(36).substr(2, 9);
      vfxRef.current.push({ id, text, position: { x: pos.x, y: pos.y, z: pos.z }, life: 1, isHit });
    };

    const checkPistolGesture = (landmarks: Landmark[]) => {
      const indexTip = landmarks[8];
      const indexBase = landmarks[5];
      const thumbTip = landmarks[4];
      const midTip = landmarks[12];

      const isIndexExtended = indexTip.y < indexBase.y - 0.1;
      const isOtherFolded = midTip.y > indexBase.y;
      
      if (isIndexExtended && isOtherFolded) {
        const triggerDistance = Math.sqrt(
          Math.pow(thumbTip.x - indexBase.x, 2) + 
          Math.pow(thumbTip.y - indexBase.y, 2)
        );

        const isPulling = triggerDistance < 0.15;
        if (isPulling && !isTriggerDown.current) {
          isTriggerDown.current = true;
          return { aiming: true, fire: true, rawPos: indexTip };
        }
        if (!isPulling) {
          isTriggerDown.current = false;
        }
        return { aiming: true, fire: false, rawPos: indexTip };
      }
      return { aiming: false, fire: false, rawPos: null };
    };

    const render = () => {
      const scene = sceneRef.current!;
      const camera = cameraRef.current!;
      const renderer = rendererRef.current!;

      if (gameState === GameState.PLAYING) {
        while (enemiesRef.current.length < SPAWN_COUNT) {
          spawnEnemy();
        }

        enemiesRef.current.forEach((enemy, index) => {
          enemy.position.x += enemy.velocity.x;
          enemy.position.y += enemy.velocity.y;
          enemy.position.z += enemy.velocity.z;

          const mesh = scene.getObjectByName(`enemy-${enemy.id}`) as THREE.Mesh;
          if (mesh) {
            mesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
            mesh.rotation.z += 0.05;
            mesh.rotation.y += 0.02;
          }

          if (enemy.position.z > 5 || Math.abs(enemy.position.x) > 20 || Math.abs(enemy.position.y) > 20) {
            scene.remove(mesh);
            enemiesRef.current.splice(index, 1);
            onMiss();
            playSound('miss');
          }
        });

        if (handData) {
          const gesture = checkPistolGesture(handData);
          if (gesture.aiming && gesture.rawPos) {
            const targetX = (1 - gesture.rawPos.x) * 2 - 1;
            const targetY = -(gesture.rawPos.y * 2 - 1);

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(targetX, targetY), camera);
            
            if (laserRef.current && crosshairRef.current) {
              laserRef.current.visible = true;
              crosshairRef.current.visible = true;

              const laserOrigin = new THREE.Vector3(targetX * 5, targetY * 5, 5);
              laserRef.current.position.copy(laserOrigin);
              
              const aimPoint = new THREE.Vector3();
              raycaster.ray.at(30, aimPoint);
              laserRef.current.lookAt(aimPoint);

              let closestEnemyPos = new THREE.Vector3();
              let minDist = Infinity;
              let bestEnemy: Enemy | null = null;

              enemiesRef.current.forEach(e => {
                const ePos = new THREE.Vector3(e.position.x, e.position.y, e.position.z);
                const screenDist = raycaster.ray.distanceToPoint(ePos);
                if (screenDist < AIM_ASSIST_RANGE && screenDist < minDist) {
                  minDist = screenDist;
                  bestEnemy = e;
                  closestEnemyPos.copy(ePos);
                }
              });

              let finalAimPoint = aimPoint;
              const crosshairMat = crosshairRef.current.material as THREE.MeshBasicMaterial;

              if (bestEnemy) {
                const distanceFactor = 1 - (minDist / AIM_ASSIST_RANGE);
                const dynamicStrength = AIM_ASSIST_STRENGTH_BASE + (distanceFactor * 0.3);
                finalAimPoint = aimPoint.clone().lerp(closestEnemyPos, dynamicStrength);
                crosshairMat.color.setHex(0x00ffff); 
                crosshairRef.current.scale.lerp(new THREE.Vector3(1.4, 1.4, 1.4), 0.2);
                crosshairMat.opacity = 1.0;
                const pulse = Math.sin(performance.now() * 0.01) * 0.1;
                crosshairRef.current.scale.addScalar(pulse);
              } else {
                crosshairMat.color.setHex(0xff00ff); 
                crosshairRef.current.scale.lerp(new THREE.Vector3(1.0, 1.0, 1.0), 0.1);
                crosshairMat.opacity = 0.7;
              }

              crosshairRef.current.position.copy(finalAimPoint.clone().setZ(-9));
              crosshairRef.current.lookAt(camera.position);

              if (gesture.fire) {
                const now = performance.now();
                if (now - lastShotTime.current > SHOOT_COOLDOWN) {
                  lastShotTime.current = now;
                  playSound('shoot');

                  let hit = false;
                  enemiesRef.current.forEach((e, idx) => {
                    const ePos = new THREE.Vector3(e.position.x, e.position.y, e.position.z);
                    const distToAim = finalAimPoint.distanceTo(ePos);
                    if (distToAim < e.radius + 0.6) {
                      hit = true;
                      onHit();
                      playSound('hit');
                      spawnVFX("HIT", ePos, true);
                      const mesh = scene.getObjectByName(`enemy-${e.id}`);
                      if (mesh) scene.remove(mesh);
                      enemiesRef.current.splice(idx, 1);
                    }
                  });

                  if (!hit) {
                    spawnVFX("MISS", finalAimPoint, false);
                  }
                }
              }
            }
          } else {
            if (laserRef.current) laserRef.current.visible = false;
            if (crosshairRef.current) crosshairRef.current.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, [gameState, handData, onHit, onMiss]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute inset-0 pointer-events-none">
        {vfxRef.current.map((v, i) => {
           const screenPos = new THREE.Vector3(v.position.x, v.position.y, v.position.z);
           if (cameraRef.current) {
             screenPos.project(cameraRef.current);
             const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
             const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
             if (v.life > 0) v.life -= 0.02;
             if (v.life <= 0) {
               vfxRef.current.splice(i, 1);
               return null;
             }
             return (
               <div key={v.id} style={{ left: x, top: y - (1 - v.life) * 100, opacity: v.life, transform: 'translate(-50%, -50%)' }} className={`absolute font-black text-2xl drop-shadow-lg ${v.isHit ? 'text-cyan-400' : 'text-red-500'}`} >
                 {v.text}
               </div>
             );
           }
           return null;
        })}
      </div>
    </div>
  );
};

export default GameScene;
