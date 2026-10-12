# ⚡ Neon Strike — Ultimate Tactical Tic-Tac-Toe

A modern, high-aesthetic Tic-Tac-Toe game built with pure **HTML5, CSS3, and JavaScript**. Featuring an unbeatable **Minimax AI Engine**, local **Pass & Play Multiplayer**, synthesized retro-futuristic sound effects via the **Web Audio API**, and a dynamic **Fading Memory / Infinite Mode** variant.

Entire repository footprint is **less than 100 KB** (far below the 10 MB limit), with zero third-party framework overhead or external asset dependencies.

---

## 🚀 Features

### 🤖 Intelligent Computer Opponent
- **Easy Mode:** Playful, casual opponent with occasional random choices.
- **Medium Mode:** Tactical heuristic AI that blocks wins, secures three-in-a-rows, and controls center/corners.
- **Master Mode:** Mathematically unbeatable AI powered by the **Minimax Algorithm with Alpha-Beta Pruning** and depth-adjusted scoring.

### 👥 Local 2-Player Multiplayer (PvP)
- Seamless Pass & Play experience on any desktop, tablet, or phone.
- Turn-based HUD indicators with dynamic glow state.
- Real-time score and draw counters persisted in `localStorage`.

### 🌀 Innovative Game Variants
- **Classic 3x3:** The standard rules we all know and love.
- **Fading Memory (Infinite Mode):** Each player can keep at most **3 marks** on the board. Placing a 4th mark evaporates your oldest piece! Visual warning indicators pulse on the piece set to vanish next. Eliminates guaranteed draws and brings intense spatial tactics!

### 🎨 State-of-the-Art Aesthetic & Visuals
- Neo-glassmorphism theme with deep obsidian gradients and vibrant neon accents (Cyan for X, Electric Yellow for O).
- Interactive SVG stroke draw animations for mark placements.
- Dynamic winning strike-through line overlay.
- 60 FPS Canvas celebration confetti fireworks on victory.
- Floating ambient space-dust particle canvas.
- Subtle ghost hover previews showing faint symbols before clicking.

### 🔊 Pure Synthesized Web Audio API
- No external audio files to download (zero network load, zero storage cost).
- Dynamic oscillators synthesize satisfying mechanical clicks, placement hums, victory fanfares, and draw tones.
- One-click mute toggle with state saved to `localStorage`.

### ⌨️ Full Keyboard & Accessibility Support
- **Numbers 1–9** / **Numpad 1–9**: Immediately drop marks into the respective cells.
- **R**: Restart / New round.
- **U**: Undo last move.
- Fully accessible markup with ARIA roles, live regions, and semantic hierarchy.

---

## 📁 Repository Structure & Lightweight Footprint

```
.
├── index.html     # Semantic markup & game layout (~6 KB)
├── style.css      # Custom neon glassmorphism stylesheet (~14 KB)
├── app.js         # Core game state & event engine (~11 KB)
├── ai.js          # Minimax algorithm & difficulty heuristics (~4 KB)
├── audio.js       # Synthesized Web Audio API sound FX (~4 KB)
├── effects.js     # Canvas ambient dust & victory confetti (~5 KB)
└── README.md      # Documentation & quick start guide
```

**Total Repository Size:** `< 50 KB` (0.05 MB) — **99.5% smaller than the 10 MB ceiling!**

---

## 🕹️ How to Run Locally

Since this project uses vanilla HTML, CSS, and JavaScript, no installation or build step (`npm install`) is required!

### Option 1: Double-click
Simply open `index.html` in any modern web browser (Chrome, Safari, Firefox, Edge).

### Option 2: Local HTTP Server (Python)
```bash
python3 -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 3: Node.js (npx serve)
```bash
npx serve .
```

---

## 🏆 Game Theory & The Minimax Algorithm
The Master AI treats Tic-Tac-Toe as a zero-sum, complete information game:
$$\text{Score} = 10 - \text{depth} \quad (\text{AI Win})$$
$$\text{Score} = \text{depth} - 10 \quad (\text{Human Win})$$
$$\text{Score} = 0 \quad (\text{Draw})$$

Depth scoring prioritizes winning in fewer turns and stalling losses as long as possible. Alpha-Beta pruning discards branches that cannot influence the final decision, ensuring instantaneous response times.

---

## 📜 License
MIT License. Free to use, adapt, and build upon!
