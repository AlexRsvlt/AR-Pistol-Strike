<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/ar-gesture-shooter-banner.png" width="100%" />
</p>

<h1 align="center">🎯 AR Gesture Shooting Game</h1>
<p align="center">
  <i>Shoot with your hands. No controller. No downloads.</i>
</p>

A browser-based AR shooting game where your hand becomes the controller.  
Aim using a pistol hand gesture and pull the trigger with your thumb to shoot incoming flying discs.

Built entirely in **one HTML file** using **Three.js** and **MediaPipe Hands**, with strong crash-prevention and performance safeguards.

## ✨ Visual Highlights

| 🔫 Gesture Shooting | 🎯 Aim Assist | 🛸 Dynamic Enemies |
|-------------------|--------------|------------------|
| Pistol hand gesture with thumb trigger | Magnetic crosshair snap | Edge-spawned flying discs |

| 🔦 Laser Targeting | 💥 Hit Feedback | ⚡ Stable Runtime |
|------------------|---------------|------------------|
| Real-time laser line | HIT/MISS VFX + sound | Version-locked MediaPipe |

---

## 🎮 Gameplay Preview

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/gameplay.gif" width="80%" />
</p>

### Gesture Controls
- Pistol hand gesture detection (index finger aiming)
- Thumb trigger pull to shoot

### Enemies
- Flying discs spawn randomly from screen edges
- Discs move toward the center
- Always 4 enemies active at a time
- Immediate respawn when a disc is shattered

### Combat Experience
- Magnetic aim assist (crosshair snaps toward discs)
- Laser aiming line from fingertip
- Hit impact sound effects
- Floating **HIT / MISS** visual effects

---

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js">
  <img src="https://img.shields.io/badge/MediaPipe-Hands-blue?style=for-the-badge&logo=google">
  <img src="https://img.shields.io/badge/Single_File-HTML-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/60FPS-Performance-green?style=for-the-badge">
</p>

- **Three.js** – 3D rendering
- **MediaPipe Hands** – Real-time hand tracking
- **WebGL** – GPU-accelerated graphics
- **Web Audio API** – Sound effects
- **Vanilla JavaScript** – No frameworks or build tools

---

## Critical Anti-Crash & Stability Features

### MediaPipe Version Lock (Required)
MediaPipe resources are strictly pinned to avoid WASM version mismatch crashes:

```
https://unpkg.com/@mediapipe/hands@0.4.1646424915
```

No floating versions. No breaking updates.

---

### Crash-Safe Loading System
- Full-screen loading overlay
- Game starts only after:
  - Camera access is granted
  - MediaPipe model finishes downloading
- Prevents runtime initialization crashes

---

### Runtime Protection
- Gesture recognition loop wrapped in `try-catch`
- Graceful failure instead of app freeze on MediaPipe errors

---

### Performance Optimization
- AI hand detection runs at a limited frequency
- Rendering loop runs at full 60 FPS
- Smooth visuals with controlled CPU/GPU usage

---

## Project Structure

Single-file deployment:

```
index.html
```

Includes:
- HTML
- CSS
- JavaScript
- Three.js scene
- MediaPipe integration
- Sound and VFX logic

---

## 🧠 System Flow

```text
Camera Feed
     ↓
MediaPipe Hands (v0.4.1646424915)
     ↓
Gesture Logic (Try-Catch Protected)
     ↓
Aim Assist & Laser Raycast
     ↓
Three.js Scene (60 FPS)
     ↓
VFX • SFX • Enemy Logic


## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ar-gesture-shooter.git
   ```

2. Open `index.html` in a modern Chromium-based browser

3. Allow camera access

4. Make a pistol gesture and start shooting

**Note:** Camera access requires HTTPS or `localhost`.

---

## Controls Summary

| Action | Gesture |
|------|--------|
| Aim | Index finger pointing |
| Shoot | Thumb pull trigger |
| Target Assist | Automatic magnetic snap |

---

## Key Features

- Single-file HTML deployment
- Real-time AR hand tracking
- Laser aiming and magnetic assist
- Dynamic enemy spawning
- Sound and visual hit feedback
- Crash-safe MediaPipe loading
- Performance-optimized game loop

---

## License

MIT License  
Free to use, modify, and distribute.

---

## Future Enhancements

- Score combos and multipliers
- Difficulty scaling
- Boss enemies
- Mobile optimization
- Multiplayer gesture battles
