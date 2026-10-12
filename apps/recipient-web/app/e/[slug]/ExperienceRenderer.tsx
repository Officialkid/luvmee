'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Volume2, VolumeX, Sparkles, RefreshCw, X } from 'lucide-react';
import { Experience, interpolatePlaceholders } from '@luvmee/shared';
import { submitRecipientResponse } from '@/lib/supabase';

interface Props {
  experience: Experience;
}

export default function ExperienceRenderer({ experience }: Props) {
  const { config, recipientName, creatorName } = experience;
  const scenes = config.scenes.sort((a, b) => a.order - b.order);

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [giftOpened, setGiftOpened] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showCompliments, setShowCompliments] = useState(false);
  const [currentComplimentIdx, setCurrentComplimentIdx] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentScene = scenes[currentSceneIndex] || scenes[0];

  const compliments = config.complimentsList || [
    'You make ordinary days feel a little more special.',
    'Your smile deserves its own appreciation post.',
    'Some people have a way of making the world feel warmer.',
    'You deserve good things, beautiful moments, and reasons to smile.'
  ];

  const evasiveMessages = currentScene.interaction.evasiveMessages || [
    'Are you sure? 🤨',
    'Please reconsider your life choices. 😂',
    'Error 404: Denial not found.',
    'Nice try! Still not an option. 😌',
    'Physics will not allow this tap. ✨',
    'Accept your fate! ❤️'
  ];

  // Helper text interpolator
  const t = (text?: string) => interpolatePlaceholders(text, creatorName, recipientName);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E85D75', '#FFD166', '#FFFFFF', '#FCE7ED']
    });
  };

  // Next scene handler
  const goToNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  // Escaping NO button move logic
  const handleNoEvade = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setNoAttempts(prev => prev + 1);

    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch {}
    }

    // Pick random offsets within safe arena bounds
    const maxDeltaX = 90;
    const maxDeltaY = 40;
    let randX = (Math.random() * 2 - 1) * maxDeltaX;
    let randY = (Math.random() * 2 - 1) * maxDeltaY;

    if (Math.abs(randX) < 30) randX = randX >= 0 ? 55 : -55;
    if (Math.abs(randY) < 18) randY = randY >= 0 ? 32 : -32;

    setNoPosition({ x: randX, y: randY });
  };

  // Handle YES button click
  const handleYesClick = async () => {
    triggerConfetti();
    await submitRecipientResponse(experience.id, 'yes', 'YES, OF COURSE!');
    goToNextScene();
  };

  // Audio synthesizer fallback
  const toggleAudio = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
    } else {
      setIsAudioPlaying(true);
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current && AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Soft lofi romantic chords (Fmaj7 - Cmaj7 - Dm7 - Am7)
      const chords = [
        [261.63, 329.63, 392.00, 523.25],
        [220.00, 261.63, 329.63, 392.00],
        [174.61, 220.00, 261.63, 329.63],
        [196.00, 246.94, 293.66, 392.00]
      ];
      let chordIdx = 0;

      const playChord = (notes: number[]) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;
        notes.forEach((freq, i) => {
          setTimeout(() => {
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.85);
          }, i * 260);
        });
      };

      playChord(chords[0]);
      synthIntervalRef.current = setInterval(() => {
        chordIdx = (chordIdx + 1) % chords.length;
        playChord(chords[chordIdx]);
      }, 2500);
    }
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative">
      {/* Top Floating Bar */}
      <header className="flex justify-between items-center max-w-lg mx-auto w-full z-20 py-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-luvmee-rose/20 text-xs font-bold text-luvmee-burgundy">
          <span className="anim-pulse">💖</span>
          <span>For {recipientName}</span>
        </div>

        <div className="flex items-center gap-2">
          {config.music.enabled && (
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isAudioPlaying
                  ? 'bg-luvmee-rose text-white border-luvmee-rose shadow-md'
                  : 'bg-white/70 text-luvmee-burgundy border-luvmee-rose/25 hover:border-luvmee-rose'
              }`}
              aria-label="Toggle music"
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Music</span>
            </button>
          )}

          <button
            onClick={() => setShowCompliments(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 text-luvmee-rose text-xs font-bold border border-luvmee-rose/25 hover:border-luvmee-rose transition-all"
          >
            <span>💗</span>
            <span className="hidden sm:inline">Sweet Note</span>
          </button>
        </div>
      </header>

      {/* Main Scene Stage */}
      <main className="my-auto max-w-lg mx-auto w-full py-6">
        <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl text-center relative overflow-hidden transition-all duration-300">
          
          {/* Badge */}
          {currentScene.badge && (
            <span className="inline-block px-3.5 py-1 rounded-full bg-luvmee-blush text-luvmee-rose text-xs font-bold tracking-wide uppercase mb-4">
              {t(currentScene.badge)}
            </span>
          )}

          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luvmee-burgundy leading-snug mb-3">
            {t(currentScene.title)}
          </h1>

          {/* Subtitle */}
          {currentScene.subtitle && (
            <p className="text-luvmee-rose font-medium text-sm sm:text-base mb-3">
              {t(currentScene.subtitle)}
            </p>
          )}

          {/* Body Text */}
          {currentScene.bodyText && (
            <p className="text-luvmee-burgundy-soft text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
              {t(currentScene.bodyText)}
            </p>
          )}

          {/* INTERACTION TYPES */}

          {/* 1. Next Button / Standard reveal */}
          {currentScene.interaction.type === 'next_button' && (
            <button
              onClick={goToNextScene}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              {currentScene.interaction.primaryButtonText || 'Continue ✨'}
            </button>
          )}

          {/* 2. Reveal Text */}
          {currentScene.interaction.type === 'reveal_text' && (
            <button
              onClick={goToNextScene}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              {currentScene.interaction.primaryButtonText || 'Ask Me 💌'}
            </button>
          )}

          {/* 3. Evasive NO Button Interaction */}
          {currentScene.interaction.type === 'evasive_no' && (
            <div className="relative pt-2">
              {/* Dynamic Reaction Bubble */}
              {noAttempts > 0 && (
                <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-luvmee-burgundy text-luvmee-blush text-xs font-semibold shadow-md animate-bounce">
                  {evasiveMessages[(noAttempts - 1) % evasiveMessages.length]}
                </div>
              )}

              {/* Button Arena */}
              <div className="relative min-h-[140px] flex items-center justify-center bg-white/40 rounded-2xl border border-dashed border-luvmee-rose/30 p-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={handleYesClick}
                    className="px-7 py-3 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-bold text-base shadow-lg shadow-luvmee-rose/30 hover:scale-105 active:scale-95 transition-transform z-10"
                  >
                    {currentScene.interaction.primaryButtonText || 'YES, OF COURSE! ❤️'}
                  </button>

                  <button
                    onMouseEnter={handleNoEvade}
                    onTouchStart={handleNoEvade}
                    onFocus={handleNoEvade}
                    onClick={handleNoEvade}
                    style={{
                      transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-luvmee-burgundy border border-luvmee-burgundy/25 font-bold text-sm shadow-sm select-none z-10"
                  >
                    {currentScene.interaction.secondaryButtonText || 'NO 🙄'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Open 3D Gift Box */}
          {currentScene.interaction.type === 'open_gift' && (
            <div className="flex flex-col items-center justify-center py-4">
              {!giftOpened ? (
                <div
                  onClick={() => {
                    setGiftOpened(true);
                    triggerConfetti();
                  }}
                  className="cursor-pointer group flex flex-col items-center gap-3 p-4"
                >
                  <div className="w-24 h-24 bg-gradient-to-tr from-luvmee-rose to-rose-400 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all text-4xl">
                    🎁
                  </div>
                  <span className="text-xs font-semibold text-luvmee-rose animate-pulse">
                    Tap to unwrap your gift ✨
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-fadeIn">
                  <div className="text-4xl">🎊</div>
                  <p className="font-serif italic text-luvmee-rose text-base font-semibold">
                    “You are appreciated more than words can say.”
                  </p>
                  <button
                    onClick={() => {
                      setGiftOpened(false);
                      setCurrentSceneIndex(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white text-luvmee-burgundy border border-luvmee-burgundy/20 font-bold text-xs shadow-sm hover:border-luvmee-rose hover:text-luvmee-rose transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Experience Again ↺</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-luvmee-muted">
        <span>A personalized surprise crafted on LUVMEE</span>
      </footer>

      {/* Compliments Drawer Modal */}
      {showCompliments && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-luvmee-rose/20 text-center">
            <button
              onClick={() => setShowCompliments(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-luvmee-blush text-luvmee-burgundy flex items-center justify-center text-xs hover:bg-luvmee-rose hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-3xl mb-2 inline-block">💌</span>
            <h3 className="font-serif font-bold text-lg text-luvmee-burgundy mb-4">Sweet Note</h3>
            <p className="font-serif text-base text-luvmee-burgundy leading-relaxed mb-6 min-h-[60px] flex items-center justify-center">
              “{compliments[currentComplimentIdx]}”
            </p>
            <button
              onClick={() => setCurrentComplimentIdx((prev) => (prev + 1) % compliments.length)}
              className="w-full py-3 rounded-full bg-luvmee-rose text-white font-bold text-xs shadow-md hover:bg-luvmee-rose-hover transition-colors"
            >
              Tell me something nice 💗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
