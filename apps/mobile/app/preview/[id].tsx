import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Volume2, VolumeX, Sparkles, Heart, Gift, Award } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/Button';
import {
  getTemplateById,
  interpolatePlaceholders,
  DEFAULT_ROMANTIC_THEME,
  GOLDEN_SUNSET_THEME,
  MIDNIGHT_STARS_THEME,
  ThemeConfig
} from '@luvmee/shared';

const EVASIVE_MESSAGES = [
  'NO 🙄',
  'Are you sure? 🤨',
  'Please reconsider! 😂',
  'Error 404: Denial not found.',
  'Physics won’t allow this tap ✨',
  'Accept your fate! ❤️'
];

export default function MobilePreviewScreen() {
  const {
    id,
    creator,
    recipient,
    title,
    themeId,
    headline,
    letter,
    music
  } = useLocalSearchParams<{
    id: string;
    creator?: string;
    recipient?: string;
    title?: string;
    themeId?: string;
    headline?: string;
    letter?: string;
    music?: string;
  }>();

  const router = useRouter();

  const creatorName = creator || 'John';
  const recipientName = recipient || 'Cynthia';

  // Resolve theme
  let currentTheme: ThemeConfig = DEFAULT_ROMANTIC_THEME;
  if (themeId === 'midnight-stars') {
    currentTheme = MIDNIGHT_STARS_THEME;
  } else if (themeId === 'golden-sunset') {
    currentTheme = GOLDEN_SUNSET_THEME;
  }

  const template = getTemplateById(id || 'playful-yes-no') || getTemplateById('playful-yes-no')!;

  // Dynamic scenes applying user's customized content
  const scenes = template.defaultConfig.scenes.map((scene) => {
    if (scene.type === 'greeting' && headline) {
      return { ...scene, title: headline };
    }
    if (scene.type === 'letter' && letter) {
      return { ...scene, bodyText: letter };
    }
    return scene;
  });

  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [noDodgeCount, setNoDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [giftOpened, setGiftOpened] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(music === '1');

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  const t = (text?: string) =>
    interpolatePlaceholders(text, creatorName, recipientName);

  const handleNext = () => {
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
      setNoDodgeCount(0);
      setNoPosition({ x: 0, y: 0 });
    }
  };

  const handleNoDodge = () => {
    setNoDodgeCount((prev) => prev + 1);
    const randX = (Math.random() * 2 - 1) * 90;
    const randY = (Math.random() * 2 - 1) * 45;
    setNoPosition({ x: randX, y: randY });
  };

  const currentEvasiveLabel =
    EVASIVE_MESSAGES[Math.min(noDodgeCount, EVASIVE_MESSAGES.length - 1)];

  const yesScale = 1 + Math.min(noDodgeCount * 0.08, 0.4);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View
          style={[
            styles.previewTag,
            {
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '40'
            }
          ]}
        >
          <Sparkles size={13} color={currentTheme.colors.primary} />
          <Text style={[styles.previewTagText, { color: currentTheme.colors.primary }]}>
            Live Surprise Preview
          </Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '40'
              }
            ]}
            onPress={() => setIsMusicPlaying(!isMusicPlaying)}
          >
            {isMusicPlaying ? (
              <Volume2 size={16} color={currentTheme.colors.primary} />
            ) : (
              <VolumeX size={16} color={currentTheme.colors.textMuted} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '40'
              }
            ]}
            onPress={() => router.back()}
          >
            <X size={16} color={currentTheme.colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Music Playing Indicator */}
      {isMusicPlaying && (
        <View style={[styles.musicBanner, { backgroundColor: currentTheme.colors.primary + '18' }]}>
          <Text style={[styles.musicBannerText, { color: currentTheme.colors.primary }]}>
            🎵 Ambient Chimes: Soft Piano Chimes playing
          </Text>
        </View>
      )}

      {/* Main Interactive Stage */}
      <View style={styles.stage}>
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '30'
            }
          ]}
        >
          {/* Badge */}
          {currentScene.badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: currentTheme.colors.primary + '20' }
              ]}
            >
              <Text style={[styles.badgeText, { color: currentTheme.colors.primary }]}>
                {t(currentScene.badge)}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: currentTheme.colors.textDark }]}>
            {t(currentScene.title)}
          </Text>

          {/* Subtitle */}
          {currentScene.subtitle && (
            <Text style={[styles.subtitle, { color: currentTheme.colors.primary }]}>
              {t(currentScene.subtitle)}
            </Text>
          )}

          {/* Body Content */}
          {currentScene.bodyText && (
            <Text style={[styles.body, { color: currentTheme.colors.textMuted }]}>
              {t(currentScene.bodyText)}
            </Text>
          )}

          {/* SCENE TYPE 1: Evasive Choice (The Playful NO Button) */}
          {currentScene.interaction.type === 'evasive_no' ? (
            <View style={styles.evasiveArena}>
              <View style={{ transform: [{ scale: yesScale }] }}>
                <Button
                  title={currentScene.interaction.primaryButtonText || 'YES OF COURSE ❤️'}
                  onPress={handleNext}
                  size="md"
                />
              </View>

              <TouchableOpacity
                onPress={handleNoDodge}
                activeOpacity={0.8}
                style={[
                  styles.noBtn,
                  {
                    transform: [
                      { translateX: noPosition.x },
                      { translateY: noPosition.y }
                    ],
                    borderColor: currentTheme.colors.primary + '40',
                    backgroundColor: currentTheme.colors.surface
                  }
                ]}
              >
                <Text style={[styles.noBtnText, { color: currentTheme.colors.textDark }]}>
                  {currentEvasiveLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ) : currentScene.type === 'gift_box' ? (
            /* SCENE TYPE 2: Gift Box Unwrap */
            <View style={styles.giftArena}>
              {!giftOpened ? (
                <TouchableOpacity
                  style={[styles.giftBox, { borderColor: currentTheme.colors.primary }]}
                  onPress={() => setGiftOpened(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.giftEmoji}>🎁</Text>
                  <Text style={[styles.giftTapText, { color: currentTheme.colors.primary }]}>
                    Tap to unwrap Cynthia's gift! ✨
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.unwrappedReveal}>
                  <Text style={styles.unwrappedEmoji}>💖✨</Text>
                  <Text style={[styles.unwrappedTitle, { color: currentTheme.colors.textDark }]}>
                    Unwrapped with Love!
                  </Text>
                  <Text style={[styles.unwrappedBody, { color: currentTheme.colors.textMuted }]}>
                    “You are my favorite thought every single day.” — {creatorName}
                  </Text>
                  <Button
                    title="Replay Experience ↺"
                    variant="outline"
                    onPress={() => {
                      setCurrentSceneIdx(0);
                      setGiftOpened(false);
                    }}
                    style={{ marginTop: 16 }}
                  />
                </View>
              )}
            </View>
          ) : currentSceneIdx === scenes.length - 1 ? (
            /* Last Scene */
            <Button
              title="Replay Experience ↺"
              variant="outline"
              onPress={() => setCurrentSceneIdx(0)}
            />
          ) : (
            /* Standard Next Scene */
            <Button
              title={currentScene.interaction.primaryButtonText || 'Continue ✨'}
              onPress={handleNext}
            />
          )}

          {/* Step Indicator */}
          <View style={styles.stepIndicatorRow}>
            {scenes.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      idx === currentSceneIdx
                        ? currentTheme.colors.primary
                        : currentTheme.colors.primary + '30',
                    width: idx === currentSceneIdx ? 18 : 6
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  previewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1
  },
  previewTagText: {
    fontSize: 12,
    fontWeight: '700'
  },
  topActions: {
    flexDirection: 'row',
    gap: 8
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  musicBanner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    alignSelf: 'center',
    marginBottom: 10
  },
  musicBannerText: {
    fontSize: 11,
    fontWeight: '600'
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewCard: {
    width: '100%',
    padding: 26,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    marginBottom: 14
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  evasiveArena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    minHeight: 110,
    width: '100%'
  },
  noBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: THEME.radius.full,
    borderWidth: 1.5,
    elevation: 3
  },
  noBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  giftArena: {
    alignItems: 'center',
    marginVertical: 10
  },
  giftBox: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 93, 117, 0.05)'
  },
  giftEmoji: {
    fontSize: 54,
    marginBottom: 8
  },
  giftTapText: {
    fontSize: 14,
    fontWeight: '700'
  },
  unwrappedReveal: {
    alignItems: 'center',
    padding: 10
  },
  unwrappedEmoji: {
    fontSize: 48,
    marginBottom: 8
  },
  unwrappedTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6
  },
  unwrappedBody: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24
  },
  stepDot: {
    height: 6,
    borderRadius: 3
  }
});
