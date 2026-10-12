import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles, Eye, Send, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import {
  getTemplateById,
  DEFAULT_ROMANTIC_THEME,
  GOLDEN_SUNSET_THEME,
  MIDNIGHT_STARS_THEME,
  generateSlug,
  ExperienceConfigSchema,
  Experience
} from '@luvmee/shared';
import { experienceService } from '../../services/experienceService';

const THEMES = [DEFAULT_ROMANTIC_THEME, GOLDEN_SUNSET_THEME, MIDNIGHT_STARS_THEME];

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const starterTemplate = getTemplateById(id || 'playful-yes-no') || getTemplateById('playful-yes-no')!;

  const [creatorName, setCreatorName] = useState('Daniel');
  const [recipientName, setRecipientName] = useState('Alikah');
  const [title, setTitle] = useState(starterTemplate.defaultConfig.title);
  const [selectedTheme, setSelectedTheme] = useState(starterTemplate.defaultConfig.theme);
  const [musicEnabled, setMusicEnabled] = useState(starterTemplate.defaultConfig.music.enabled);

  // Editable scene texts
  const [headline, setHeadline] = useState(starterTemplate.defaultConfig.scenes[0]?.title || 'Hii {recipientName}! ✨');
  const [letterBody, setLetterBody] = useState(
    starterTemplate.defaultConfig.scenes.find((s) => s.type === 'letter')?.bodyText ||
    'I made this little thing just to give you a reason to smile today. ❤️'
  );

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    // Construct updated config
    const updatedScenes = starterTemplate.defaultConfig.scenes.map((scene) => {
      if (scene.type === 'greeting') {
        return { ...scene, title: headline };
      }
      if (scene.type === 'letter') {
        return { ...scene, bodyText: letterBody };
      }
      return scene;
    });

    const newConfig = {
      ...starterTemplate.defaultConfig,
      creatorName,
      recipientName,
      title,
      theme: selectedTheme,
      music: { ...starterTemplate.defaultConfig.music, enabled: musicEnabled },
      scenes: updatedScenes
    };

    // Zod validation check
    const validation = ExperienceConfigSchema.safeParse(newConfig);
    if (!validation.success) {
      Alert.alert('Validation Error', validation.error.issues[0]?.message || 'Invalid experience configuration');
      return;
    }

    setIsPublishing(true);
    const slug = generateSlug(recipientName);

    const now = new Date().toISOString();
    const newExperience: Experience = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: 'user-demo',
      templateId: starterTemplate.id,
      title: title || `${recipientName}'s Surprise`,
      creatorName,
      recipientName,
      slug,
      config: newConfig,
      status: 'published',
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    };

    try {
      await experienceService.saveExperience(newExperience);
      setIsPublishing(false);
      Alert.alert(
        'Surprise Published! 💖',
        `Your unique link is ready: https://luvmee.vercel.app/e/${slug}`,
        [
          {
            text: 'View in My Surprises',
            onPress: () => router.push('/(tabs)/my-experiences')
          }
        ]
      );
    } catch (err: any) {
      setIsPublishing(false);
      Alert.alert('Publish Error', err?.message || 'Failed to save experience');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Step 1: Who is this for? */}
      <Card>
        <Text style={styles.cardHeader}>1. Who is this surprise for?</Text>
        <Input
          label="Your Name (Creator)"
          value={creatorName}
          onChangeText={setCreatorName}
          placeholder="e.g. Daniel"
        />
        <Input
          label="Recipient Name"
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="e.g. Alikah"
        />
        <Input
          label="Experience Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. A Special Surprise For You"
        />
      </Card>

      {/* Step 2: Content Customization */}
      <Card>
        <Text style={styles.cardHeader}>2. Customize the Words</Text>
        <Input
          label="Opening Greeting Headline"
          value={headline}
          onChangeText={setHeadline}
          placeholder="e.g. Hii {recipientName}! ✨"
        />
        <Input
          label="Personal Letter Message"
          value={letterBody}
          onChangeText={setLetterBody}
          multiline
          placeholder="Write your heartfelt note here..."
        />
      </Card>

      {/* Step 3: Theme Selection */}
      <Card>
        <Text style={styles.cardHeader}>3. Pick a Visual Theme</Text>
        <View style={styles.themeRow}>
          {THEMES.map((th) => {
            const isSelected = selectedTheme.id === th.id;
            return (
              <TouchableOpacity
                key={th.id}
                onPress={() => setSelectedTheme(th)}
                style={[
                  styles.themeBox,
                  { backgroundColor: th.colors.background },
                  isSelected && styles.themeBoxActive
                ]}
              >
                <View style={[styles.themeColorDot, { backgroundColor: th.colors.primary }]} />
                <Text style={[styles.themeName, { color: th.colors.textDark }]}>{th.name}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Step 4: Music Controls */}
      <Card>
        <Text style={styles.cardHeader}>4. Romantic Background Music</Text>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setMusicEnabled(!musicEnabled)}
        >
          <View>
            <Text style={styles.toggleTitle}>Enable Instrumental Ambient Music</Text>
            <Text style={styles.toggleSubtitle}>Plays soft romantic chimes when recipient taps play</Text>
          </View>
          <View style={[styles.togglePill, musicEnabled && styles.togglePillActive]}>
            <Text style={styles.togglePillText}>{musicEnabled ? 'ON' : 'OFF'}</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Actions */}
      <View style={styles.actionButtons}>
        <Button
          title="Preview Surprise"
          variant="outline"
          icon={<Eye size={16} color={THEME.colors.burgundy} />}
          onPress={() => router.push(`/preview/${starterTemplate.id}`)}
          style={{ flex: 1 }}
        />
        <Button
          title="Publish Surprise"
          icon={<Send size={16} color="#FFFFFF" />}
          loading={isPublishing}
          onPress={handlePublish}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  content: {
    padding: 20
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 14
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10
  },
  themeBox: {
    flex: 1,
    padding: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    position: 'relative'
  },
  themeBoxActive: {
    borderColor: THEME.colors.rose
  },
  themeColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 6
  },
  themeName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.colors.rose,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  toggleSubtitle: {
    fontSize: 12,
    color: THEME.colors.burgundySoft,
    marginTop: 2
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: 'rgba(84, 38, 56, 0.1)'
  },
  togglePillActive: {
    backgroundColor: THEME.colors.rose
  },
  togglePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40
  }
});
