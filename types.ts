
export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResults {
  multiHandLandmarks: Landmark[][];
  multiHandWorldLandmarks: Landmark[][];
}

export enum GameState {
  LOADING,
  READY,
  PLAYING,
  GAMEOVER
}

export interface Enemy {
  id: string;
  position: Vector3;
  velocity: Vector3;
  radius: number;
  color: string;
}

export interface VFX {
  id: string;
  text: string;
  position: Vector3;
  life: number; // 0 to 1
  isHit: boolean;
}
