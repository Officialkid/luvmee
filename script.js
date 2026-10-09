/**
 * ==========================================================================
 * PROJECT ALIKAH — MAIN JAVASCRIPT ENGINE
 * Mobile-first, resilient, vanilla JavaScript experience.
 * ==========================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     APPLICATION STATE & DATA
     ========================================================================== */
  const state = {
    currentScene: 'scene-a',
    noEscapeAttempts: 0,
    isTypingSuspense: false,
    giftOpened: false,
    audioPlaying: false,
    usingSynthAudio: false,
    currentComplimentIndex: 0,
    complimentsShuffled: [],
    terminalInitialized: false,
    terminalIsTyping: false
  };

  // Escaping NO button funny messages
  const noMessages = [
    "Are you sure, Alikah? 🤨",
    "Please reconsider your life choices. 😂",
    "Error 404: Your denial was not found.",
    "Nice try! Still not an option. 😌",
    "Physics will simply not allow this tap. ✨",
    "The universe has already decided: you love me. 🥰",
    "Button.exe has stopped complying. 🛑",
    "I didn't write hundreds of lines of code for you to click this! 😂",
    "Just surrender and tap YES! ❤️"
  ];

  // Compliments collection (includes all 8 required + bonus)
  const complimentsList = [
    "You make ordinary days feel a little more special.",
    "Your smile deserves its own appreciation post.",
    "Some people have a way of making the world feel warmer.",
    "You deserve good things, beautiful moments, and reasons to smile.",
    "Never underestimate the happiness you bring into a room.",
    "You are allowed to take up space, dream big, and shine.",
    "I hope today gives you a reason to smile unexpectedly.",
    "Consider this your reminder that you are appreciated.",
    "Your laughter is genuinely one of the best sounds in the world.",
    "You are doing so much better than you give yourself credit for."
  ];

  // Terminal simulated script lines
  const terminalLogLines = [
    "> initializing love.exe...",
    "> scanning heart...",
    "> target identified: ALIKAH",
    "> affection level: OVERFLOW",
    "> bug detected: can't stop thinking about you",
    "> attempting to fix...",
    "> ERROR: feelings are permanent.",
    "> status: happily compromised ❤️"
  ];

  /* ==========================================================================
     DOM ELEMENTS CACHE
     ========================================================================== */
  const dom = {
    // Stage & Scenes
    stage: document.getElementById('experience-stage'),
    scenes: document.querySelectorAll('.scene'),
    
    // Scene A
    btnSceneA: document.getElementById('btn-scene-a'),
    
    // Scene B
    typewriterLine1: document.getElementById('typewriter-line-1'),
    typewriterLine2: document.getElementById('typewriter-line-2'),
    btnSceneB: document.getElementById('btn-scene-b'),
    
    // Scene C & D
    btnYes: document.getElementById('btn-yes'),
    btnNo: document.getElementById('btn-no'),
    buttonArena: document.getElementById('button-arena'),
    noReactionBubble: document.getElementById('no-reaction-bubble'),
    noReactionText: document.getElementById('no-reaction-text'),
    
    // Scene E
    btnToNote: document.getElementById('btn-to-note'),
    
    // Scene F
    letterDate: document.getElementById('letter-current-date'),
    btnToGift: document.getElementById('btn-to-gift'),
    
    // Scene G
    giftBoxContainer: document.getElementById('gift-box-container'),
    giftBox: document.getElementById('gift-box'),
    giftRevealed: document.getElementById('gift-revealed-content'),
    giftInstruction: document.getElementById('gift-instruction-text'),
    btnReplay: document.getElementById('btn-replay'),
    btnOpenCompliments: document.getElementById('btn-open-compliments'),
    btnOpenTerminal: document.getElementById('btn-open-terminal'),
    
    // Header controls
    musicToggleBtn: document.getElementById('music-toggle-btn'),
    musicIcon: document.getElementById('music-icon'),
    navComplimentBtn: document.getElementById('nav-compliment-btn'),
    bgAudio: document.getElementById('bg-audio'),
    
    // Compliments Modal
    modalCompliments: document.getElementById('modal-compliments'),
    complimentQuote: document.getElementById('compliment-quote-text'),
    complimentCounter: document.getElementById('compliment-counter'),
    btnNextCompliment: document.getElementById('btn-next-compliment'),
    btnCloseCompliments: document.getElementById('btn-close-compliments'),
    
    // Terminal Easter Egg Modal
    modalTerminal: document.getElementById('modal-terminal'),
    terminalLines: document.getElementById('terminal-lines'),
    terminalInput: document.getElementById('terminal-command-input'),
    terminalScreen: document.getElementById('terminal-screen'),
    btnCloseTerminal: document.getElementById('btn-close-terminal'),
    btnTerminalDotClose: document.getElementById('btn-terminal-dot-close'),
    
    // Canvases
    ambientCanvas: document.getElementById('ambient-canvas'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  /* ==========================================================================
     HELPER UTILITIES
     ========================================================================== */
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Fisher-Yates array shuffle
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ==========================================================================
     SCENE NAVIGATION SYSTEM
     ========================================================================== */
  function switchScene(targetSceneId) {
    const currentEl = document.getElementById(state.currentScene);
    const targetEl = document.getElementById(targetSceneId);

    if (!targetEl || targetSceneId === state.currentScene) return;

    const executeSwitch = () => {
      if (currentEl) {
        currentEl.classList.remove('active', 'scene-exit');
      }
      targetEl.classList.add('active');
      state.currentScene = targetSceneId;

      // Scroll to top of stage smoothly
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

      // Scene-specific entry hooks
      if (targetSceneId === 'scene-b') {
        startSuspenseTypewriter();
      } else if (targetSceneId === 'scene-c') {
        setupQuestionScene();
      } else if (targetSceneId === 'scene-e') {
        triggerYesCelebration();
      } else if (targetSceneId === 'scene-f') {
        updateLetterDate();
      }
    };

    if (currentEl && !prefersReducedMotion()) {
      currentEl.classList.add('scene-exit');
      setTimeout(executeSwitch, 220);
    } else {
      executeSwitch();
    }
  }

  /* ==========================================================================
     SCENE B: SUSPENSE TYPEWRITER
     ========================================================================== */
  async function typeWriterEffect(element, text, speed = 40) {
    element.textContent = '';
    element.classList.remove('hidden');
    element.classList.add('cursor-blink');

    if (prefersReducedMotion()) {
      element.textContent = text;
      element.classList.remove('cursor-blink');
      return;
    }

    for (let i = 0; i < text.length; i++) {
      element.textContent += text.charAt(i);
      await sleep(speed);
    }
    element.classList.remove('cursor-blink');
  }

  async function startSuspenseTypewriter() {
    if (state.isTypingSuspense) return;
    state.isTypingSuspense = true;

    dom.typewriterLine1.textContent = '';
    dom.typewriterLine2.textContent = '';
    dom.typewriterLine2.classList.add('hidden');
    dom.btnSceneB.classList.add('hidden');

    const line1Text = "Alikah, I have a very important question for you...";
    const line2Text = "And I need you to be completely honest with me.";

    await typeWriterEffect(dom.typewriterLine1, line1Text, 45);
    await sleep(700);

    dom.typewriterLine2.classList.remove('hidden');
    await typeWriterEffect(dom.typewriterLine2, line2Text, 40);
    await sleep(500);

    dom.btnSceneB.classList.remove('hidden');
    dom.btnSceneB.focus();
    state.isTypingSuspense = false;
  }

  /* ==========================================================================
     SCENE C & D: THE ESCAPING NO BUTTON
     ========================================================================== */
  function setupQuestionScene() {
    state.noEscapeAttempts = 0;
    resetNoButtonPosition();
    dom.noReactionBubble.classList.add('hidden');
  }

  function resetNoButtonPosition() {
    dom.btnNo.style.transform = 'translate(0px, 0px)';
    dom.btnNo.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  /**
   * Calculates safe coordinates for NO button so it stays completely inside
   * its visible interactive container, never overlaps the YES button, and prevents viewport overflow.
   */
  function moveNoButton() {
    state.noEscapeAttempts++;

    // Tactile haptics on mobile (if supported)
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (e) {}
    }

    // Update reaction message
    const msgIndex = (state.noEscapeAttempts - 1) % noMessages.length;
    dom.noReactionText.textContent = noMessages[msgIndex];
    dom.noReactionBubble.classList.remove('hidden');

    // Subtle sound chime if audio enabled
    playGentleBlipSound();

    const arena = dom.buttonArena;
    const arenaRect = arena.getBoundingClientRect();
    const btnRect = dom.btnNo.getBoundingClientRect();
    const yesRect = dom.btnYes.getBoundingClientRect();

    // Available boundaries inside the arena
    const padding = 12;
    const maxDeltaX = Math.max(30, (arenaRect.width / 2) - (btnRect.width / 2) - padding);
    const maxDeltaY = Math.max(25, (arenaRect.height / 2) - (btnRect.height / 2) - padding);

    // Pick coordinates that avoid colliding with YES button
    let randomX = 0;
    let randomY = 0;
    let attempts = 0;

    do {
      randomX = (Math.random() * 2 - 1) * maxDeltaX;
      randomY = (Math.random() * 2 - 1) * maxDeltaY;

      // Ensure noticeable jump from center
      if (Math.abs(randomX) < 35) randomX = randomX >= 0 ? 55 : -55;
      if (Math.abs(randomY) < 20) randomY = randomY >= 0 ? 35 : -35;

      // Calculate candidate absolute bounding box relative to arena center
      const candidateLeft = (arenaRect.left + arenaRect.width / 2) + randomX - (btnRect.width / 2);
      const candidateTop = (arenaRect.top + arenaRect.height / 2) + randomY - (btnRect.height / 2);
      const candidateRight = candidateLeft + btnRect.width;
      const candidateBottom = candidateTop + btnRect.height;

      // Check overlap with YES button (with safety buffer)
      const buffer = 10;
      const overlapsYes = !(
        candidateRight < yesRect.left - buffer ||
        candidateLeft > yesRect.right + buffer ||
        candidateBottom < yesRect.top - buffer ||
        candidateTop > yesRect.bottom + buffer
      );

      if (!overlapsYes || attempts > 10) break;
      attempts++;
    } while (attempts <= 10);

    // Apply smooth transform jump
    dom.btnNo.style.transform = `translate(${randomX.toFixed(1)}px, ${randomY.toFixed(1)}px)`;

    // Keep it playful: rotate slightly
    const randomRotate = (Math.random() * 12 - 6).toFixed(1);
    dom.btnNo.style.transform += ` rotate(${randomRotate}deg)`;
  }

  // Handle evasive triggers: mouse hover, pointer tap, touch start, keyboard focus
  function attachEvasiveHandlers() {
    const evade = (e) => {
      e.preventDefault();
      moveNoButton();
    };

    // Desktop hover & pointer approach
    dom.btnNo.addEventListener('mouseenter', evade);
    dom.btnNo.addEventListener('pointerdown', evade);

    // Touchscreen taps
    dom.btnNo.addEventListener('touchstart', evade, { passive: false });

    // In case keyboard navigation reaches it
    dom.btnNo.addEventListener('focus', () => {
      moveNoButton();
      // Gently return focus to YES button for accessibility
      setTimeout(() => dom.btnYes.focus(), 150);
    });

    // Fallback click prevention
    dom.btnNo.addEventListener('click', evade);

    // YES Button Click
    dom.btnYes.addEventListener('click', () => {
      switchScene('scene-e');
    });
  }

  /* ==========================================================================
     SCENE E: THE YES CELEBRATION & CONFETTI ENGINE
     ========================================================================== */
  function triggerYesCelebration() {
    startCelebrationConfetti();
    playRomanticChime();
  }

  /* Built-in Lightweight 60FPS Canvas Confetti & Floating Hearts */
  let confettiParticles = [];
  let confettiAnimationId = null;

  function startCelebrationConfetti() {
    if (prefersReducedMotion()) return;

    const canvas = dom.confettiCanvas;
    const ctx = canvas.getContext('2d');
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    const colors = ['#E85D75', '#FFD166', '#FF8AA3', '#FFFFFF', '#542638', '#FCE7ED'];
    confettiParticles = [];

    // Spawn 120 confetti ribbons & hearts
    for (let i = 0; i < 120; i++) {
      confettiParticles.push({
        x: canvas.width / 2 + (Math.random() * 200 - 100),
        y: canvas.height * 0.65,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: -(Math.random() * 14 + 10),
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        isHeart: Math.random() > 0.6
      });
    }

    let startTime = performance.now();

    function render(currentTime) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = currentTime - startTime;

      let activeParticles = 0;

      for (let p of confettiParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98; // air drag
        p.rotation += p.rotationSpeed;

        if (elapsed > 2500) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          activeParticles++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.isHeart) {
            drawMiniHeart(ctx, 0, 0, p.size);
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          }

          ctx.restore();
        }
      }

      if (activeParticles > 0 && elapsed < 6500) {
        confettiAnimationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(confettiAnimationId);
      }
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = requestAnimationFrame(render);
  }

  function drawMiniHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  /* ==========================================================================
     SCENE F: THE PERSONAL NOTE
     ========================================================================== */
  function updateLetterDate() {
    try {
      const today = new Date();
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      dom.letterDate.textContent = today.toLocaleDateString(undefined, options);
    } catch (e) {
      dom.letterDate.textContent = "Today";
    }
  }

  /* ==========================================================================
     SCENE G: THE FINAL SURPRISE & 3D GIFT BOX
     ========================================================================== */
  function openGiftBox() {
    if (state.giftOpened) return;
    state.giftOpened = true;

    dom.giftBox.classList.add('gift-box-opened');
    dom.giftInstruction.textContent = "Your gift is unwrapped! ✨";

    playGiftOpenChime();
    startCelebrationConfetti();

    setTimeout(() => {
      dom.giftRevealed.classList.remove('hidden');
      dom.giftBoxContainer.setAttribute('aria-expanded', 'true');
    }, 450);
  }

  function resetExperience() {
    state.giftOpened = false;
    state.noEscapeAttempts = 0;
    dom.giftBox.classList.remove('gift-box-opened');
    dom.giftRevealed.classList.add('hidden');
    dom.giftInstruction.textContent = "Tap the gift box below to unwrap it 🎁";
    resetNoButtonPosition();
    switchScene('scene-a');
  }

  /* ==========================================================================
     COMPLIMENT GENERATOR
     ========================================================================== */
  function initCompliments() {
    state.complimentsShuffled = shuffleArray(complimentsList);
    state.currentComplimentIndex = 0;
  }

  function showNextCompliment() {
    if (state.complimentsShuffled.length === 0) {
      initCompliments();
    }

    state.currentComplimentIndex++;
    if (state.currentComplimentIndex >= state.complimentsShuffled.length) {
      state.complimentsShuffled = shuffleArray(complimentsList);
      state.currentComplimentIndex = 0;
    }

    // Smooth transition
    dom.complimentQuote.style.opacity = '0';
    dom.complimentQuote.style.transform = 'translateY(6px)';

    setTimeout(() => {
      const text = state.complimentsShuffled[state.currentComplimentIndex];
      dom.complimentQuote.textContent = text;
      dom.complimentCounter.textContent = `Note ${state.currentComplimentIndex + 1} of ${complimentsList.length}`;
      dom.complimentQuote.style.opacity = '1';
      dom.complimentQuote.style.transform = 'translateY(0)';
    }, 200);

    playGentleBlipSound();
  }

  function openComplimentModal() {
    if (state.complimentsShuffled.length === 0) {
      initCompliments();
    }
    dom.complimentQuote.textContent = state.complimentsShuffled[state.currentComplimentIndex];
    dom.complimentCounter.textContent = `Note ${state.currentComplimentIndex + 1} of ${complimentsList.length}`;
    dom.modalCompliments.classList.remove('hidden');
    dom.btnNextCompliment.focus();
  }

  function closeComplimentModal() {
    dom.modalCompliments.classList.add('hidden');
  }

  /* ==========================================================================
     DEVELOPER LOVE TERMINAL (EASTER EGG)
     ========================================================================== */
  function openTerminalModal() {
    dom.modalTerminal.classList.remove('hidden');
    dom.terminalInput.focus();

    if (!state.terminalInitialized) {
      state.terminalInitialized = true;
      runTerminalSequence();
    }
  }

  function closeTerminalModal() {
    dom.modalTerminal.classList.add('hidden');
  }

  function printTerminalLine(text, className = '') {
    const lineEl = document.createElement('div');
    lineEl.className = `terminal-line ${className}`;
    lineEl.textContent = text;
    dom.terminalLines.appendChild(lineEl);
    dom.terminalScreen.scrollTop = dom.terminalScreen.scrollHeight;
  }

  async function runTerminalSequence() {
    if (state.terminalIsTyping) return;
    state.terminalIsTyping = true;
    dom.terminalLines.innerHTML = '';

    for (let line of terminalLogLines) {
      let isError = line.includes('ERROR:');
      let isSuccess = line.includes('status:');
      printTerminalLine(line, isError ? 'error' : (isSuccess ? 'success' : ''));
      await sleep(prefersReducedMotion() ? 50 : 380);
    }

    printTerminalLine("--------------------------------------------------", "system");
    printTerminalLine("Type 'help' for available commands.", "system");
    state.terminalIsTyping = false;
  }

  function handleTerminalCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    printTerminalLine(`alikah@heart:~$ ${cmdRaw}`, "system");

    switch (cmd) {
      case 'help':
        printTerminalLine("Available commands:", "system");
        printTerminalLine("  help        - Show this list");
        printTerminalLine("  about       - Details on Project ALIKAH");
        printTerminalLine("  secret      - Reveal a hidden developer message");
        printTerminalLine("  compliment  - Generate an instant sweet note");
        printTerminalLine("  status      - Display current love metrics");
        printTerminalLine("  clear       - Clear the terminal console");
        printTerminalLine("  exit        - Close terminal modal");
        break;

      case 'about':
        printTerminalLine("Project ALIKAH v1.0.0");
        printTerminalLine("Architected with semantic HTML5, modern CSS3 & vanilla JavaScript.");
        printTerminalLine("Dedicated exclusively to Alikah. Crafted with 100% love.");
        break;

      case 'secret':
        printTerminalLine("✨ SECRET DECRYPTED:", "success");
        printTerminalLine("Every single line of this code was written with a genuine smile.");
        printTerminalLine("You are deeply appreciated, Alikah.");
        break;

      case 'compliment':
        const randomComp = complimentsList[Math.floor(Math.random() * complimentsList.length)];
        printTerminalLine(`💌 NOTE: "${randomComp}"`, "success");
        break;

      case 'status':
        printTerminalLine("System Status: HEARTS_RUNNING", "success");
        printTerminalLine("Affection Level: [████████████████] 100% (OVERFLOW)");
        printTerminalLine("Firewall: BYPASSED_BY_ALIKAH");
        break;

      case 'clear':
        dom.terminalLines.innerHTML = '';
        break;

      case 'exit':
      case 'quit':
        closeTerminalModal();
        break;

      case '':
        break;

      default:
        printTerminalLine(`command not found: ${cmdRaw}. Type 'help' for guidance.`, "error");
        break;
    }

    dom.terminalInput.value = '';
    dom.terminalScreen.scrollTop = dom.terminalScreen.scrollHeight;
  }

  /* ==========================================================================
     AUDIO ENGINE (HTML5 AUDIO + RESILIENT SYNTHESIZER FALLBACK)
     ========================================================================== */
  let audioContext = null;
  let synthIntervalId = null;

  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  /**
   * Built-in romantic lofi chime synthesizer:
   * Arpeggiates gentle, warm sine chords (Fmaj7 -> Cmaj7 -> Dm7 -> Am7)
   * Plays completely locally without needing external audio files!
   */
  function startRomanticLofiSynth() {
    initAudioContext();
    if (!audioContext) return;

    state.usingSynthAudio = true;
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [220.00, 261.63, 329.63, 392.00], // A Minor 7
      [174.61, 220.00, 261.63, 329.63], // F Major 7
      [196.00, 246.94, 293.66, 392.00]  // G Major
    ];

    let chordIndex = 0;

    function playChordArpeggio(notes) {
      if (!state.audioPlaying) return;
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!state.audioPlaying || !audioContext) return;
          try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);

            // Gentle attack and long warm decay
            gain.gain.setValueAtTime(0.001, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.8);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start();
            osc.stop(audioContext.currentTime + 1.85);
          } catch (e) {
            // Ignore audio glitches
          }
        }, idx * 280);
      });
    }

    playChordArpeggio(chords[0]);
    synthIntervalId = setInterval(() => {
      chordIndex = (chordIndex + 1) % chords.length;
      playChordArpeggio(chords[chordIndex]);
    }, 2400);
  }

  function stopRomanticLofiSynth() {
    if (synthIntervalId) {
      clearInterval(synthIntervalId);
      synthIntervalId = null;
    }
  }

  // Sweet gentle interaction chimes
  function playGentleBlipSound() {
    if (prefersReducedMotion()) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.03, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.15);
    } catch (e) {}
  }

  function playGiftOpenChime() {
    initAudioContext();
    if (!audioContext) return;
    try {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          gain.gain.setValueAtTime(0.05, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start();
          osc.stop(audioContext.currentTime + 0.55);
        }, i * 90);
      });
    } catch (e) {}
  }

  function playRomanticChime() {
    playGiftOpenChime();
  }

  // Toggle Background Music
  function toggleMusic() {
    if (state.audioPlaying) {
      // Pause
      state.audioPlaying = false;
      dom.musicToggleBtn.classList.remove('playing');
      dom.musicIcon.textContent = '🎵';
      
      if (!state.usingSynthAudio && dom.bgAudio) {
        dom.bgAudio.pause();
      }
      stopRomanticLofiSynth();
    } else {
      // Play
      state.audioPlaying = true;
      dom.musicToggleBtn.classList.add('playing');
      dom.musicIcon.textContent = '🎶';

      // Check if MP3 file plays, otherwise switch smoothly to Web Audio synth
      if (dom.bgAudio) {
        dom.bgAudio.play().then(() => {
          state.usingSynthAudio = false;
        }).catch(() => {
          // Fall back gracefully to synthesized music
          startRomanticLofiSynth();
        });
      } else {
        startRomanticLofiSynth();
      }
    }
  }

  /* ==========================================================================
     AMBIENT FLOATING PARTICLES (BACKGROUND CANVAS)
     ========================================================================== */
  function initAmbientParticles() {
    if (prefersReducedMotion()) return;

    const canvas = dom.ambientCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = Math.min(30, Math.floor(window.innerWidth / 35));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 5,
        speedY: Math.random() * 0.45 + 0.2,
        speedX: Math.sin(Math.random() * Math.PI * 2) * 0.25,
        opacity: Math.random() * 0.35 + 0.15,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.015
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#E85D75';
      for (let p of particles) {
        p.y -= p.speedY;
        p.x += Math.sin(p.angle) * 0.35;
        p.angle += p.angularSpeed;

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        drawMiniHeart(ctx, p.x, p.y, p.size);
        ctx.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ==========================================================================
     GLOBAL EVENT LISTENERS & SETUP
     ========================================================================== */
  function attachEventListeners() {
    // Scene A -> Scene B
    dom.btnSceneA.addEventListener('click', () => switchScene('scene-b'));

    // Scene B -> Scene C
    dom.btnSceneB.addEventListener('click', () => switchScene('scene-c'));

    // Scene C & D: Escaping Button
    attachEvasiveHandlers();

    // Scene E -> Scene F
    dom.btnToNote.addEventListener('click', () => switchScene('scene-f'));

    // Scene F -> Scene G
    dom.btnToGift.addEventListener('click', () => switchScene('scene-g'));

    // Scene G Gift interaction
    dom.giftBoxContainer.addEventListener('click', openGiftBox);
    dom.giftBoxContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGiftBox();
      }
    });

    // Scene G Actions
    dom.btnReplay.addEventListener('click', resetExperience);
    dom.btnOpenCompliments.addEventListener('click', openComplimentModal);
    dom.btnOpenTerminal.addEventListener('click', openTerminalModal);

    // Header Actions
    dom.musicToggleBtn.addEventListener('click', toggleMusic);
    dom.navComplimentBtn.addEventListener('click', openComplimentModal);

    // Compliment Modal Actions
    dom.btnNextCompliment.addEventListener('click', showNextCompliment);
    dom.btnCloseCompliments.addEventListener('click', closeComplimentModal);
    dom.modalCompliments.addEventListener('click', (e) => {
      if (e.target === dom.modalCompliments) closeComplimentModal();
    });

    // Terminal Modal Actions
    dom.btnCloseTerminal.addEventListener('click', closeTerminalModal);
    dom.btnTerminalDotClose.addEventListener('click', closeTerminalModal);
    dom.modalTerminal.addEventListener('click', (e) => {
      if (e.target === dom.modalTerminal) closeTerminalModal();
    });

    dom.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleTerminalCommand(dom.terminalInput.value);
      }
    });

    // Global Keyboard Accessibility (Esc to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!dom.modalCompliments.classList.contains('hidden')) {
          closeComplimentModal();
        }
        if (!dom.modalTerminal.classList.contains('hidden')) {
          closeTerminalModal();
        }
      }
    });

    // Mobile orientation and resize handling
    window.addEventListener('resize', () => {
      if (state.currentScene === 'scene-c') {
        resetNoButtonPosition();
      }
    });
  }

  /* ==========================================================================
     INITIALIZATION ENTRYPOINT
     ========================================================================== */
  function init() {
    initCompliments();
    attachEventListeners();
    initAmbientParticles();
  }

  // Fire when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
