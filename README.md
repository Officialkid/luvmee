# Project ALIKAH ❤️

> A personalized, mobile-first, romantic surprise interactive website crafted with semantic HTML5, modern CSS3, and vanilla JavaScript.

---

## 🌹 Overview & Experience Flow

Project ALIKAH is an interactive digital love letter designed to make Alikah smile, laugh, and feel appreciated.

### The Complete Journey:
1. **Scene A — Creative Check-In**:
   - Headline: *"Hii Alikah, how is your day going? ✨"*
   - Subtitle: *"Because it's well past morning... and we definitely need to be more creative than that 😉"*
   - Radiant sunburst, orbit stars, and glowing heart illustration.
2. **Scene B — Build Suspense**: Progressive character typewriter with an honest suspense question.
3. **Scene C & D — The Main Question & Escaping NO Button**:
   - Question: *"Alikah, do you love me? 🥹❤️"*
   - Accessible **YES** button and playfully evasive **NO** button.
   - The **NO** button flees from taps, hover, and focus events with dynamic funny reaction messages:
     1. *"Are you sure, Alikah? 🤨"*
     2. *"Please reconsider your life choices. 😂"*
     3. *"Error 404: Your denial was not found."*
     4. Rotates through witty comebacks while staying strictly inside safe boundaries without overlapping the YES button or creating horizontal scrollbars.
4. **Scene E — The YES Celebration**: Confetti explosion (local 60FPS canvas engine), floating hearts, and romantic declaration sequence.
5. **Scene F — The Personal Note**: Warm stationery letter card with a heartfelt message and live date stamp.
6. **Scene G — The Final Surprise**: Interactive 3D gift box with ribbon unwrapping animation, warm closing line, and replay button.
7. **Developer Mode (Easter Egg)**: Dark retro hacker/terminal modal with CRT scanlines, character typewriter output of `love.exe`, and interactive bash commands (`help`, `about`, `secret`, `compliment`, `status`, `clear`, `exit`).
8. **Compliment Generator**: Shuffle modal loaded with 10 sweet reminders, accessible at any time from the navigation bar.
9. **Resilient Music Player**: Tap to toggle background music. Automatically plays `assets/music.mp3` or seamlessly falls back to a built-in Web Audio API romantic lofi chime progression!

---

## 📁 Project Structure

```
luvmee/
├── index.html         # Semantic HTML5 markup, scenes A-G, modals, SVG illustrations
├── style.css          # Romantic design system, mobile-first responsive layout & animations
├── script.js          # Scene controller, escaping button physics, audio engine, confetti, terminal
├── server.js          # Zero-dependency local development server (Node.js)
├── vercel.json        # Production configuration for Vercel static deployment
├── package.json       # Dev and start scripts, metadata
├── .gitignore         # Ignores OS metadata and build caches
├── assets/
│   └── README.txt     # Instructions for adding optional MP3 music or custom photos
└── README.md          # Complete documentation, customization guide, and hosting instructions
```

---

## 🚀 How to Run Locally

### Option 1: Double-Click
Simply open `index.html` directly in any web browser.

### Option 2: Using NPM (Built-in Server)
```bash
npm run dev
```
Then visit: `http://localhost:3000`

### Option 3: Python HTTP Server
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 📱 How to Test on a Real Mobile Phone (Android / iPhone)

1. Connect your computer and your phone to the same Wi-Fi network.
2. Start the dev server (`npm run dev` or `python -m http.server 8000`).
3. Find your computer's local IP address:
   - On Windows: Run `ipconfig` in PowerShell/CMD and look for `IPv4 Address` (e.g. `192.168.1.45`).
4. On your phone's browser, open `http://<YOUR_COMPUTER_IP>:3000`.
5. Experience the touch-friendly escaping NO button, haptic feedback, responsive viewport (`100dvh`), and audio directly on your phone!

---

## ⚡ Vercel Deployment Instructions

Project ALIKAH is fully configured for static deployment on **Vercel**.

### Method 1: Git Import via Vercel Dashboard (Recommended)
1. Push this folder to a GitHub, GitLab, or Bitbucket repository (e.g. `project-alikah`).
2. Log in to [vercel.com](https://vercel.com) and click **"Add New..."** > **"Project"**.
3. Import your repository.
4. Set the **Framework Preset** to **Other** (or leave default).
5. Leave the **Root Directory** as `./` (project root).
6. Build and Output settings are already configured via `vercel.json` (no build step required).
7. Click **Deploy**. Vercel will provide a secure `https://*.vercel.app` URL immediately.

### Method 2: Vercel CLI
If you have the Vercel CLI installed:
```bash
npx vercel
```
Follow the interactive prompts to deploy a preview or run `npx vercel --prod` to deploy to production.

---

## 🎨 How to Customize Content

All text is cleanly organized and easy to edit:

### 1. Changing Names & Text
- Open `index.html`:
  - Search for `Alikah` and replace it with any name or nickname you prefer.
  - Edit the personal note in Scene F directly in `index.html` under `#scene-f`.
  - Edit the grand finale message in Scene G under `#gift-revealed-content`.

### 2. Customizing the Escaping NO Button Messages
- Open `script.js` and edit the `noMessages` array at the top of the file:
```javascript
const noMessages = [
  "Are you sure, Alikah? 🤨",
  "Please reconsider your life choices. 😂",
  // Add your own inside jokes here!
];
```

### 3. Adding More Compliments
- Open `script.js` and add or edit items in `complimentsList`:
```javascript
const complimentsList = [
  "Your smile deserves its own appreciation post.",
  // Add personal memories or compliments here
];
```

### 4. Adding Background Music
- Place any `.mp3` file in the `assets/` folder and name it `music.mp3` (path: `assets/music.mp3`).
- The player will automatically play this song when Alikah presses the "Music" button.
- If you don't add an MP3, the built-in romantic lofi chime synthesizer automatically plays instead.
