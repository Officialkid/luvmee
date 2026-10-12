import { Template, ThemeConfig } from '../types/index.js';

export const DEFAULT_ROMANTIC_THEME: ThemeConfig = {
  id: 'romantic-rose',
  name: 'Romantic Rose',
  colors: {
    primary: '#E85D75',
    background: '#FCE7ED',
    surface: '#FFF9F2',
    textDark: '#542638',
    textMuted: '#8E6072',
    white: '#FFFFFF'
  },
  fontHeading: 'serif',
  fontBody: 'sans',
  backgroundEffect: 'floating_hearts'
};

export const GOLDEN_SUNSET_THEME: ThemeConfig = {
  id: 'golden-sunset',
  name: 'Golden Sunset',
  colors: {
    primary: '#E06D53',
    background: '#FFF3EB',
    surface: '#FFFFFF',
    textDark: '#4A2820',
    textMuted: '#965E50',
    white: '#FFFFFF'
  },
  fontHeading: 'serif',
  fontBody: 'sans',
  backgroundEffect: 'sparkles'
};

export const MIDNIGHT_STARS_THEME: ThemeConfig = {
  id: 'midnight-stars',
  name: 'Midnight Romance',
  colors: {
    primary: '#F08080',
    background: '#1F1B2C',
    surface: '#2B263D',
    textDark: '#FFF9F2',
    textMuted: '#C2B6D6',
    white: '#FFFFFF'
  },
  fontHeading: 'serif',
  fontBody: 'sans',
  backgroundEffect: 'sparkles'
};

export const STARTER_TEMPLATES: Template[] = [
  // 1. The Playful Yes-or-No Surprise
  {
    id: 'playful-yes-no',
    name: 'The Playful Yes-or-No',
    category: 'playful_questions',
    description: 'An interactive romantic journey featuring the famously playful escaping NO button and celebration.',
    occasion: 'Dating, Flirting, Crushes',
    previewColor: '#E85D75',
    previewEmoji: '🥹❤️',
    isActive: true,
    defaultConfig: {
      creatorName: 'Someone Special',
      recipientName: 'My Favorite Person',
      title: 'A Little Surprise For You',
      theme: DEFAULT_ROMANTIC_THEME,
      music: { enabled: true, trackTitle: 'Romantic Chimes' },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'Hii {recipientName}! ✨',
          subtitle: "I hope you've smiled today.",
          bodyText: "Because if you haven't, I crafted a little something just for you.",
          badge: 'A Special Check-in',
          interaction: { type: 'next_button', primaryButtonText: 'Show me! 👀' },
          order: 0
        },
        {
          id: 's2',
          type: 'suspense',
          title: 'Hold on a second... 💭',
          bodyText: 'I have a very important question, and I need you to be completely honest with me.',
          interaction: { type: 'reveal_text', primaryButtonText: 'Okay, ask me! 💌', revealDelayMs: 600 },
          order: 1
        },
        {
          id: 's3',
          type: 'evasive_choice',
          title: 'Do you love me? 🥹❤️',
          subtitle: 'Choose wisely. This answer may affect my entire existence.',
          interaction: {
            type: 'evasive_no',
            primaryButtonText: 'YES, OF COURSE! ❤️',
            secondaryButtonText: 'NO 🙄',
            evasiveMessages: [
              'Are you sure? 🤨',
              'Please reconsider your life choices. 😂',
              'Error 404: Denial not found.',
              'Nice try! Still not an option. 😌',
              'Physics will not allow this tap. ✨',
              'Accept your fate! ❤️'
            ]
          },
          order: 2
        },
        {
          id: 's4',
          type: 'celebration',
          title: 'HAHA! I KNEW IT! 😭❤️',
          subtitle: 'You see? My heart has excellent taste.',
          bodyText: 'I love you too. More than this little screen can explain.',
          interaction: { type: 'next_button', primaryButtonText: 'Read my letter 💌' },
          order: 3
        },
        {
          id: 's5',
          type: 'letter',
          title: 'A note just for you...',
          bodyText:
            'I made this little thing just to give you a reason to smile today. Sometimes the smallest gestures make ordinary days feel a little more special. ❤️',
          interaction: { type: 'next_button', primaryButtonText: 'One last surprise ✨' },
          order: 4
        },
        {
          id: 's6',
          type: 'gift_box',
          title: 'The Grand Finale 🎁',
          subtitle: 'Tap the gift box to unwrap it',
          bodyText: 'Have a beautiful day. You truly deserve it. 🥰',
          interaction: { type: 'open_gift', primaryButtonText: 'Experience Again ↺' },
          order: 5
        }
      ],
      complimentsList: [
        'You make ordinary days feel a little more special.',
        'Your smile deserves its own appreciation post.',
        'Some people have a way of making the world feel warmer.',
        'Never underestimate the happiness you bring into a room.'
      ]
    }
  },

  // 2. The Digital Love Letter
  {
    id: 'digital-love-letter',
    name: 'The Digital Love Letter',
    category: 'love_letters',
    description: 'An elegant, heartfelt stationery letter delivered with soft music, intimate reveals, and warm memories.',
    occasion: 'Anniversary, Just Because, Romance',
    previewColor: '#C86B85',
    previewEmoji: '💌',
    isActive: true,
    defaultConfig: {
      creatorName: 'Yours Truly',
      recipientName: 'Darling',
      title: 'A Love Letter For You',
      theme: DEFAULT_ROMANTIC_THEME,
      music: { enabled: true, trackTitle: 'Soft Piano' },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'For My Favorite Person 💌',
          bodyText: 'Take a quiet moment, take a deep breath, and open this.',
          interaction: { type: 'next_button', primaryButtonText: 'Open Letter 🗝️' },
          order: 0
        },
        {
          id: 's2',
          type: 'letter',
          title: 'Dear {recipientName},',
          bodyText:
            'I wanted to write you something you could keep forever. Thank you for being my constant warmth and my favorite part of every single day.',
          interaction: { type: 'next_button', primaryButtonText: 'Keep Reading ✨' },
          order: 1
        },
        {
          id: 's3',
          type: 'celebration',
          title: 'Forever Grateful For You ❤️',
          bodyText: 'Loving you is the easiest choice I have ever made.',
          interaction: { type: 'next_button', primaryButtonText: 'A Small Gift 🎁' },
          order: 2
        },
        {
          id: 's4',
          type: 'gift_box',
          title: 'Sealed With Love',
          bodyText: 'Here is to a thousand more smiles together.',
          interaction: { type: 'open_gift', primaryButtonText: 'Re-read ↺' },
          order: 3
        }
      ]
    }
  },

  // 3. The Confession Reveal
  {
    id: 'confession-reveal',
    name: 'The Confession Reveal',
    category: 'confessions',
    description: 'Build gentle suspense before revealing genuine feelings that have been kept in your heart.',
    occasion: 'Crush, Confessing Feelings',
    previewColor: '#E25B74',
    previewEmoji: '🫣💖',
    isActive: true,
    defaultConfig: {
      creatorName: 'Someone Shy',
      recipientName: 'You',
      title: 'Something I Need To Say',
      theme: GOLDEN_SUNSET_THEME,
      music: { enabled: true },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'Hey {recipientName}... 🫣',
          bodyText: "I've been holding onto something I couldn't quite say out loud.",
          interaction: { type: 'next_button', primaryButtonText: 'What is it? 💭' },
          order: 0
        },
        {
          id: 's2',
          type: 'suspense',
          title: 'Deep breaths first...',
          bodyText: 'Promise you will not laugh at me?',
          interaction: { type: 'reveal_text', primaryButtonText: 'I promise! 🤞' },
          order: 1
        },
        {
          id: 's3',
          type: 'celebration',
          title: 'I really, truly like you. 💖',
          bodyText: 'More than I know how to put into words. You make my whole world brighter.',
          interaction: { type: 'next_button', primaryButtonText: 'One more thing ✨' },
          order: 2
        },
        {
          id: 's4',
          type: 'gift_box',
          title: 'My Heart Is In Your Hands',
          bodyText: 'Thank you for listening to my little confession. 🥰',
          interaction: { type: 'open_gift', primaryButtonText: 'Play Again ↺' },
          order: 3
        }
      ]
    }
  },

  // 4. The Anniversary Journey
  {
    id: 'anniversary-journey',
    name: 'The Anniversary Journey',
    category: 'anniversaries',
    description: 'Celebrate your shared milestones and cherish every step of the journey together.',
    occasion: 'Anniversaries, Milestones',
    previewColor: '#D97D8F',
    previewEmoji: '🥂✨',
    isActive: true,
    defaultConfig: {
      creatorName: 'Your Love',
      recipientName: 'My Partner',
      title: 'Happy Anniversary, Love',
      theme: DEFAULT_ROMANTIC_THEME,
      music: { enabled: true },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'Happy Anniversary, {recipientName}! 🥂',
          bodyText: 'Looking back on our journey brings the biggest smile to my face.',
          interaction: { type: 'next_button', primaryButtonText: 'Our Story 📖' },
          order: 0
        },
        {
          id: 's2',
          type: 'letter',
          title: 'Every Chapter With You',
          bodyText: 'From the day we met until right now, every moment has been a blessing. I would choose you all over again in every lifetime.',
          interaction: { type: 'next_button', primaryButtonText: 'Celebrate Us 🎉' },
          order: 1
        },
        {
          id: 's3',
          type: 'celebration',
          title: 'Cheers To Us! 💖',
          bodyText: 'To all the laughs, the late nights, and the future we are building.',
          interaction: { type: 'next_button', primaryButtonText: 'Unwrap Surprise 🎁' },
          order: 2
        },
        {
          id: 's4',
          type: 'gift_box',
          title: 'My Promise To You',
          bodyText: 'I love you more today than yesterday, and even more tomorrow.',
          interaction: { type: 'open_gift', primaryButtonText: 'Experience Again ↺' },
          order: 3
        }
      ]
    }
  },

  // 5. The Birthday Surprise
  {
    id: 'birthday-surprise',
    name: 'The Birthday Surprise',
    category: 'birthday_surprises',
    description: 'A colorful, joy-filled birthday delivery with celebratory confetti, wishes, and gift unwrapping.',
    occasion: 'Birthdays',
    previewColor: '#FF708A',
    previewEmoji: '🎂🎉',
    isActive: true,
    defaultConfig: {
      creatorName: 'With Love',
      recipientName: 'Birthday Star',
      title: 'Happy Birthday!',
      theme: GOLDEN_SUNSET_THEME,
      music: { enabled: true },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'Happy Birthday, {recipientName}! 🎂',
          bodyText: 'Today is all about celebrating the wonderful human being that you are.',
          interaction: { type: 'next_button', primaryButtonText: 'Make A Wish 🕯️' },
          order: 0
        },
        {
          id: 's2',
          type: 'celebration',
          title: 'Another Year More Wonderful! 🎉',
          bodyText: 'May this year bring you all the warmth, love, and dreams your heart desires.',
          interaction: { type: 'next_button', primaryButtonText: 'Your Birthday Note 💌' },
          order: 1
        },
        {
          id: 's3',
          type: 'letter',
          title: 'Why You Are Cherished',
          bodyText: 'The world is so much brighter with you in it. Thank you for simply existing.',
          interaction: { type: 'next_button', primaryButtonText: 'Your Virtual Gift 🎁' },
          order: 2
        },
        {
          id: 's4',
          type: 'gift_box',
          title: 'Have The Happiest Birthday!',
          bodyText: 'Go shine bright today! You deserve all the joy in the world. ✨',
          interaction: { type: 'open_gift', primaryButtonText: 'Replay ↺' },
          order: 3
        }
      ]
    }
  },

  // 6. The Appreciation Experience
  {
    id: 'appreciation-experience',
    name: 'The Appreciation Experience',
    category: 'appreciation',
    description: 'Brighten someone’s ordinary day with heartfelt gratitude and affirmation cards.',
    occasion: 'Appreciation, Encouragement, Gratitude',
    previewColor: '#733E53',
    previewEmoji: '🌸🤍',
    isActive: true,
    defaultConfig: {
      creatorName: 'A Grateful Heart',
      recipientName: 'You',
      title: 'Just Wanted To Remind You',
      theme: DEFAULT_ROMANTIC_THEME,
      music: { enabled: true },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'You Are Appreciated 🌸',
          bodyText: 'Just in case nobody told you today: you matter immensely.',
          interaction: { type: 'next_button', primaryButtonText: 'Remind Me ✨' },
          order: 0
        },
        {
          id: 's2',
          type: 'letter',
          title: 'A Little Appreciation Note',
          bodyText: 'Your kindness, your humor, and your strength never go unnoticed. Never underestimate the happiness you bring into a room.',
          interaction: { type: 'next_button', primaryButtonText: 'A Little Gift 🎁' },
          order: 1
        },
        {
          id: 's3',
          type: 'gift_box',
          title: 'Keep Shining Bright',
          bodyText: 'Have a beautiful day. You deserve good things and reasons to smile. ❤️',
          interaction: { type: 'open_gift', primaryButtonText: 'Read Again ↺' },
          order: 2
        }
      ],
      complimentsList: [
        'You make ordinary days feel a little more special.',
        'Some people have a way of making the world feel warmer.',
        'You deserve good things, beautiful moments, and reasons to smile.',
        'Consider this your reminder that you are deeply appreciated.'
      ]
    }
  }
];

export function getTemplateById(id: string): Template | undefined {
  return STARTER_TEMPLATES.find((t) => t.id === id);
}
