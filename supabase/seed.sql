-- ==============================================================================
-- LUVMEE V1 — STARTER TEMPLATES SEED DATA (DOLLAR-QUOTED)
-- ==============================================================================

INSERT INTO public.templates (id, name, category, description, occasion, preview_color, preview_emoji, default_config, is_active)
VALUES
(
    'playful-yes-no',
    'The Playful Yes-or-No',
    'playful_questions',
    'An interactive romantic journey featuring the famously playful escaping NO button and celebration.',
    'Dating, Flirting, Crushes',
    '#E85D75',
    '🥹❤️',
    $json${
        "creatorName": "Someone Special",
        "recipientName": "My Favorite Person",
        "title": "A Little Surprise For You",
        "theme": {
            "id": "romantic-rose",
            "name": "Romantic Rose",
            "colors": {
                "primary": "#E85D75",
                "background": "#FCE7ED",
                "surface": "#FFF9F2",
                "textDark": "#542638",
                "textMuted": "#8E6072",
                "white": "#FFFFFF"
            },
            "fontHeading": "serif",
            "fontBody": "sans",
            "backgroundEffect": "floating_hearts"
        },
        "music": { "enabled": true, "trackTitle": "Romantic Chimes" },
        "scenes": [
            {
                "id": "s1",
                "type": "greeting",
                "title": "Hii {recipientName}! ✨",
                "subtitle": "I hope you have smiled today.",
                "bodyText": "Because if you have not, I crafted a little something just for you.",
                "badge": "A Special Check-in",
                "interaction": { "type": "next_button", "primaryButtonText": "Show me! 👀" },
                "order": 0
            },
            {
                "id": "s2",
                "type": "suspense",
                "title": "Hold on a second... 💭",
                "bodyText": "I have a very important question, and I need you to be completely honest with me.",
                "interaction": { "type": "reveal_text", "primaryButtonText": "Okay, ask me! 💌", "revealDelayMs": 600 },
                "order": 1
            },
            {
                "id": "s3",
                "type": "evasive_choice",
                "title": "Do you love me? 🥹❤️",
                "subtitle": "Choose wisely. This answer may affect my entire existence.",
                "interaction": {
                    "type": "evasive_no",
                    "primaryButtonText": "YES, OF COURSE! ❤️",
                    "secondaryButtonText": "NO 🙄",
                    "evasiveMessages": [
                        "Are you sure? 🤨",
                        "Please reconsider your life choices. 😂",
                        "Error 404: Denial not found.",
                        "Nice try! Still not an option. 😌",
                        "Physics will not allow this tap. ✨",
                        "Accept your fate! ❤️"
                    ]
                },
                "order": 2
            },
            {
                "id": "s4",
                "type": "celebration",
                "title": "HAHA! I KNEW IT! 😭❤️",
                "subtitle": "You see? My heart has excellent taste.",
                "bodyText": "I love you too. More than this little screen can explain.",
                "interaction": { "type": "next_button", "primaryButtonText": "Read my letter 💌" },
                "order": 3
            },
            {
                "id": "s5",
                "type": "letter",
                "title": "A note just for you...",
                "bodyText": "I made this little thing just to give you a reason to smile today. Sometimes the smallest gestures make ordinary days feel a little more special. ❤️",
                "interaction": { "type": "next_button", "primaryButtonText": "One last surprise ✨" },
                "order": 4
            },
            {
                "id": "s6",
                "type": "gift_box",
                "title": "The Grand Finale 🎁",
                "subtitle": "Tap the gift box to unwrap it",
                "bodyText": "Have a beautiful day. You truly deserve it. 🥰",
                "interaction": { "type": "open_gift", "primaryButtonText": "Experience Again ↺" },
                "order": 5
            }
        ]
    }$json$::jsonb,
    TRUE
),
(
    'digital-love-letter',
    'The Digital Love Letter',
    'love_letters',
    'An elegant, heartfelt stationery letter delivered with soft music, intimate reveals, and warm memories.',
    'Anniversary, Just Because, Romance',
    '#C86B85',
    '💌',
    $json${
        "creatorName": "Yours Truly",
        "recipientName": "Darling",
        "title": "A Love Letter For You",
        "theme": {
            "id": "romantic-rose",
            "name": "Romantic Rose",
            "colors": {
                "primary": "#E85D75",
                "background": "#FCE7ED",
                "surface": "#FFF9F2",
                "textDark": "#542638",
                "textMuted": "#8E6072",
                "white": "#FFFFFF"
            },
            "fontHeading": "serif",
            "fontBody": "sans",
            "backgroundEffect": "floating_hearts"
        },
        "music": { "enabled": true, "trackTitle": "Soft Piano" },
        "scenes": [
            {
                "id": "s1",
                "type": "greeting",
                "title": "For My Favorite Person 💌",
                "bodyText": "Take a quiet moment, take a deep breath, and open this.",
                "interaction": { "type": "next_button", "primaryButtonText": "Open Letter 🗝️" },
                "order": 0
            },
            {
                "id": "s2",
                "type": "letter",
                "title": "Dear {recipientName},",
                "bodyText": "I wanted to write you something you could keep forever. Thank you for being my constant warmth and my favorite part of every single day.",
                "interaction": { "type": "next_button", "primaryButtonText": "Keep Reading ✨" },
                "order": 1
            },
            {
                "id": "s3",
                "type": "celebration",
                "title": "Forever Grateful For You ❤️",
                "bodyText": "Loving you is the easiest choice I have ever made.",
                "interaction": { "type": "next_button", "primaryButtonText": "A Small Gift 🎁" },
                "order": 2
            },
            {
                "id": "s4",
                "type": "gift_box",
                "title": "Sealed With Love",
                "bodyText": "Here is to a thousand more smiles together.",
                "interaction": { "type": "open_gift", "primaryButtonText": "Re-read ↺" },
                "order": 3
            }
        ]
    }$json$::jsonb,
    TRUE
),
(
    'confession-reveal',
    'The Confession Reveal',
    'confessions',
    'Build gentle suspense before revealing genuine feelings that have been kept in your heart.',
    'Crush, Confessing Feelings',
    '#E25B74',
    '🫣💖',
    $json${
        "creatorName": "Someone Shy",
        "recipientName": "You",
        "title": "Something I Need To Say",
        "theme": {
            "id": "golden-sunset",
            "name": "Golden Sunset",
            "colors": {
                "primary": "#E06D53",
                "background": "#FFF3EB",
                "surface": "#FFFFFF",
                "textDark": "#4A2820",
                "textMuted": "#965E50",
                "white": "#FFFFFF"
            },
            "fontHeading": "serif",
            "fontBody": "sans",
            "backgroundEffect": "sparkles"
        },
        "music": { "enabled": true },
        "scenes": [
            {
                "id": "s1",
                "type": "greeting",
                "title": "Hey {recipientName}... 🫣",
                "bodyText": "I have been holding onto something I could not quite say out loud.",
                "interaction": { "type": "next_button", "primaryButtonText": "What is it? 💭" },
                "order": 0
            },
            {
                "id": "s2",
                "type": "suspense",
                "title": "Deep breaths first...",
                "bodyText": "Promise you will not laugh at me?",
                "interaction": { "type": "reveal_text", "primaryButtonText": "I promise! 🤞" },
                "order": 1
            },
            {
                "id": "s3",
                "type": "celebration",
                "title": "I really, truly like you. 💖",
                "bodyText": "More than I know how to put into words. You make my whole world brighter.",
                "interaction": { "type": "next_button", "primaryButtonText": "One more thing ✨" },
                "order": 2
            },
            {
                "id": "s4",
                "type": "gift_box",
                "title": "My Heart Is In Your Hands",
                "bodyText": "Thank you for listening to my little confession. 🥰",
                "interaction": { "type": "open_gift", "primaryButtonText": "Play Again ↺" },
                "order": 3
            }
        ]
    }$json$::jsonb,
    TRUE
),
(
    'anniversary-journey',
    'The Anniversary Journey',
    'anniversaries',
    'Celebrate your shared milestones and cherish every step of the journey together.',
    'Anniversaries, Milestones',
    '#D97D8F',
    '🥂✨',
    $json${
        "creatorName": "Your Love",
        "recipientName": "My Partner",
        "title": "Happy Anniversary, Love",
        "theme": {
            "id": "romantic-rose",
            "name": "Romantic Rose",
            "colors": {
                "primary": "#E85D75",
                "background": "#FCE7ED",
                "surface": "#FFF9F2",
                "textDark": "#542638",
                "textMuted": "#8E6072",
                "white": "#FFFFFF"
            },
            "fontHeading": "serif",
            "fontBody": "sans",
            "backgroundEffect": "floating_hearts"
        },
        "music": { "enabled": true },
        "scenes": [
            {
                "id": "s1",
                "type": "greeting",
                "title": "Happy Anniversary, {recipientName}! 🥂",
                "bodyText": "Looking back on our journey brings the biggest smile to my face.",
                "interaction": { "type": "next_button", "primaryButtonText": "Our Story 📖" },
                "order": 0
            },
            {
                "id": "s2",
                "type": "letter",
                "title": "Every Chapter With You",
                "bodyText": "From the day we met until right now, every moment has been a blessing. I would choose you all over again in every lifetime.",
                "interaction": { "type": "next_button", "primaryButtonText": "Celebrate Us 🎉" },
                "order": 1
            },
            {
                "id": "s3",
                "type": "celebration",
                "title": "Cheers To Us! 💖",
                "bodyText": "To all the laughs, the late nights, and the future we are building.",
                "interaction": { "type": "next_button", "primaryButtonText": "Unwrap Surprise 🎁" },
                "order": 2
            },
            {
                "id": "s4",
                "type": "gift_box",
                "title": "My Promise To You",
                "bodyText": "I love you more today than yesterday, and even more tomorrow.",
                "interaction": { "type": "open_gift", "primaryButtonText": "Experience Again ↺" },
                "order": 3
            }
        ]
    }$json$::jsonb,
    TRUE
),
(
    'birthday-surprise',
    'The Birthday Surprise',
    'birthday_surprises',
    'A colorful, joy-filled birthday delivery with celebratory confetti, wishes, and gift unwrapping.',
    'Birthdays',
    '#FF708A',
    '🎂🎉',
    $json${
        "creatorName": "With Love",
        "recipientName": "Birthday Star",
        "title": "Happy Birthday!",
        "theme": {
            "id": "golden-sunset",
            "name": "Golden Sunset",
            "colors": {
                "primary": "#E06D53",
                "background": "#FFF3EB",
                "surface": "#FFFFFF",
                "textDark": "#4A2820",
                "textMuted": "#965E50",
                "white": "#FFFFFF"
            },
            "fontHeading": "serif",
            "fontBody": "sans",
            "backgroundEffect": "sparkles"
        },
        "music": { "enabled": true },
        "scenes": [
            {
                "id": "s1",
                "type": "greeting",
                "title": "Happy Birthday, {recipientName}! 🎂",
                "bodyText": "Today is all about celebrating the wonderful human being that you are.",
                "interaction": { "type": "next_button", "primaryButtonText": "Make A Wish 🕯️" },
                "order": 0
            },
            {
                "id": "s2",
                "type": "celebration",
                "title": "Another Year More Wonderful! 🎉",
                "bodyText": "May this year bring you all the warmth, love, and dreams your heart desires.",
                "interaction": { "type": "next_button", "primaryButtonText": "Your Birthday Note 💌" },
                "order": 1
            },
            {
                "id": "s3",
                "type": "letter",
                "title": "Why You Are Cherished",
                "bodyText": "The world is so much brighter with you in it. Thank you for simply existing.",
                "interaction": { "type": "next_button", "primaryButtonText": "Your Virtual Gift 🎁" },
                "order": 2
            },
            {
                "id": "s4",
                "type": "gift_box",
                "title": "Have The Happiest Birthday!",
                "bodyText": "Go shine bright today! You deserve all the joy in the world. ✨",
                "interaction": { "type": "open_gift", "primaryButtonText": "Replay ↺" },
                "order": 3
            }
        ]
    }$json$::jsonb,
    TRUE
),
(
    'appreciation-experience',
    'The Appreciation Experience',
    'appreciation',
    'Brighten someone’s ordinary day with heartfelt gratitude and affirmation cards.',
    'Appreciation, Encouragement, Gratitude',
    '#733E53',
    '🌸🤍',
    $json${
        "creatorName": "A Grateful Heart",
        "recipientName": "You",
        "title": "Just Wanted To Remind You",
        "theme": {
            "id": "romantic-rose",
            "name": "Romantic Rose",
            "colors": {
                "primary": "#E85D75",
                "background": "#FCE7ED",
                "surface": "#FFF9F2",
                "textDark": "#542638",
                "textMuted": "#8E6072",
                "white": "#FFFFFF"
            },
            "fontHeading": "serif",
            "fontBody": "sans",
            "backgroundEffect": "floating_hearts"
        },
        "music": { "enabled": true },
        "scenes": [
            {
                "id": "s1",
                "type": "greeting",
                "title": "You Are Appreciated 🌸",
                "bodyText": "Just in case nobody told you today: you matter immensely.",
                "interaction": { "type": "next_button", "primaryButtonText": "Remind Me ✨" },
                "order": 0
            },
            {
                "id": "s2",
                "type": "letter",
                "title": "A Little Appreciation Note",
                "bodyText": "Your kindness, your humor, and your strength never go unnoticed. Never underestimate the happiness you bring into a room.",
                "interaction": { "type": "next_button", "primaryButtonText": "A Little Gift 🎁" },
                "order": 1
            },
            {
                "id": "s3",
                "type": "gift_box",
                "title": "Keep Shining Bright",
                "bodyText": "Have a beautiful day. You deserve good things and reasons to smile. ❤️",
                "interaction": { "type": "open_gift", "primaryButtonText": "Read Again ↺" },
                "order": 2
            }
        ],
        "complimentsList": [
            "You make ordinary days feel a little more special.",
            "Some people have a way of making the world feel warmer.",
            "You deserve good things, beautiful moments, and reasons to smile.",
            "Consider this your reminder that you are deeply appreciated."
        ]
    }$json$::jsonb,
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    occasion = EXCLUDED.occasion,
    preview_color = EXCLUDED.preview_color,
    preview_emoji = EXCLUDED.preview_emoji,
    default_config = EXCLUDED.default_config,
    is_active = EXCLUDED.is_active;
