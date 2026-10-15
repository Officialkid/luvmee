# LUVMEE — Design System & UI/UX Standards Manual

**Brand:** LUVMEE  
**Version:** 1.0.0 (Production Release)  
**Status:** Certified & Standardized  

---

## 1. Brand Identity & Color Tokens

LUVMEE's visual language evokes romance, thoughtful consideration, and warmth. We do not use loud neon tones, harsh black borders, or competing color palettes.

### 1.1 Color Tokens
| Token Key | Hex Value | Semantic Usage |
|:---|:---|:---|
| `background` | `#FFF9F2` | **Soft Ivory** — primary application background / canvas |
| `surface` | `#FFFFFF` | **Pure White** — cards, sheets, modals, elevated surfaces |
| `surfaceHighlight` | `#FCE7ED` | **Blush Pink** — active badges, subtle avatars, hero cards |
| `surfaceAlt` | `rgba(255, 249, 242, 0.85)` | Translucent ivory for floating bars |
| `primary` / `rose` | `#E85D75` | **Rose** — primary actions, highlights, active icons |
| `primaryHover` | `#D6465F` | Active press state for buttons |
| `primarySubtle` | `rgba(232, 93, 117, 0.1)` | Pill backgrounds, tags, subtle highlights |
| `textHeading` / `burgundy` | `#542838` | **Deep Burgundy** — page headers, card titles, hero labels |
| `textPrimary` | `#25212A` | **Dark Slate** — readable body copy, input text |
| `textMuted` | `#733E53` | Soft burgundy secondary copy, captions, timestamps |
| `textMutedSubtle` | `#8E6072` | Muted auxiliary hints |
| `border` | `rgba(84, 40, 56, 0.08)` | Hairline card border (0.8px – 1px) |
| `borderHighlight` | `rgba(232, 93, 117, 0.25)` | Active input and selection border |
| `success` / `successBg` | `#059669` / `#ECFDF5` | Success indicators, online presence dots |
| `warning` / `warningBg` | `#D97706` / `#FFFBEB` | Warning alerts and notices |
| `danger` / `errorBg` | `#DC2626` / `#FEF2F2` | Destructive actions, delete account, validation errors |

---

## 2. Typography Scale

Clean editorial hierarchy using system sans-serif fonts with balanced letter spacing:

- **Hero Title**: 24–28px, Bold (`700`), `-0.4px` letter-spacing, Deep Burgundy (`#542838`)
- **Section Heading**: 18–20px, Semi-Bold (`600`–`700`), Deep Burgundy
- **Card Title / Row Name**: 14–15px, Bold (`700`), Deep Burgundy
- **Body Regular**: 13–14px, Regular (`400`), Line Height 19–20px, Dark Slate (`#25212A`)
- **Caption / Metadata**: 11–12px, Regular/Medium (`500`), Soft Burgundy Muted (`#733E53`)
- **Overline / Category Tag**: 10–11px, Bold (`700`), Uppercase, `+1.2px` letter-spacing

---

## 3. Core Component Primitives

All components must be consumed from centralized, standardized modules:

### 3.1 Card (`Card.tsx`)
```tsx
<Card variant="surface" style={styles.card}>
  {/* Content */}
</Card>
```
- **Variants**:
  - `surface` (default): Pure white background, hairline border (`rgba(84, 40, 56, 0.08)`), subtle depth.
  - `highlight`: Blush pink background (`#FCE7ED`), delicate rose border tint.
  - `flat`: Soft ivory background (`rgba(84, 40, 56, 0.03)`), no shadow, minimal border.

### 3.2 Button (`Button.tsx`)
```tsx
<Button
  title="Create Surprise"
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size="md"         // 'sm' | 'md' | 'lg'
  icon={<Sparkles size={16} color="#FFFFFF" />}
  onPress={handlePress}
/>
```
- Minimum touch target: 44px height for accessibility.
- Automatic loading spinner when `loading={true}`.

### 3.3 UIPrimitives (`UIPrimitives.tsx`)
- **`SectionHeader`**: Standardized section title with optional right action button.
- **`Badge`**: Clean semantic pill tag (`primary`, `neutral`, `success`, `warning`, `outline`).
- **`Avatar`**: Clean circular avatar with uppercase initials and optional online dot indicator.
- **`EmptyState`**: Calm, helpful empty placeholder with icon, message, and call to action.
- **`SkeletonLoader`**: Smooth placeholder card for content loading states.
- **`InlineNotice`**: Standardized alert/feedback banners (`info`, `success`, `warning`, `error`).

---

## 4. Navigation Architecture

To prevent tab label truncation and visual congestion across varying mobile screen sizes, LUVMEE standardizes on **5 primary bottom tabs**:

1. **Home (`index`)**: Relationship hub, upcoming dates preview, partner status banner, quick action bar.
2. **Love Notes (`messages`)**: Dedicated couple communication space, daily love spark question, private note stream.
3. **People (`people`)**: Contact directory, annual recurring birthdays, anniversaries, and relationship labels.
4. **Calendar (`calendar`)**: Monthly milestone matrix, date countdown chips, and quick card triggers.
5. **Profile (`profile`)**: Identity management, username editor, partner settings, data reset, and account deletion.

*Note:* `templates` (Experience Studio) and `my-experiences` (Surprises) remain active routes in the navigation stack (`href: null` in the tab bar) to ensure seamless routing and deep linking without cluttering the bottom bar.
