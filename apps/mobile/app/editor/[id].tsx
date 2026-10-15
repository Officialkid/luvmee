import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles, Eye, Send, Check, BookmarkCheck, ArrowLeft, Lock, Globe, Heart } from 'lucide-react-native';
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
  Experience,
  SharingMode,
  PartnerState,
  buildRecipientExperienceUrl
} from '@luvmee/shared';
import { experienceService } from '../../services/experienceService';
import { partnerService } from '../../services/partnerService';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabase';

const THEMES = [DEFAULT_ROMANTIC_THEME, GOLDEN_SUNSET_THEME, MIDNIGHT_STARS_THEME];

export default function EditorScreen() {
  const { id, experienceId: paramExpId } = useLocalSearchParams<{ id: string; experienceId?: string }>();
  const router = useRouter();

  // Determine if editing an existing experience or creating from a template
  const [existingExperienceId, setExistingExperienceId] = useState<string | null>(paramExpId || null);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(id || 'playful-yes-no');
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const starterTemplate = getTemplateById(activeTemplateId) || getTemplateById('playful-yes-no')!;

  const [creatorName, setCreatorName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [title, setTitle] = useState(starterTemplate.defaultConfig.title);
  const [selectedTheme, setSelectedTheme] = useState(starterTemplate.defaultConfig.theme);
  const [musicEnabled, setMusicEnabled] = useState(starterTemplate.defaultConfig.music.enabled);
  const [sharingMode, setSharingMode] = useState<SharingMode>('public_link');
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [partnerState, setPartnerState] = useState<PartnerState>({ state: 'not_connected' });

  // Editable scene texts
  const [headline, setHeadline] = useState(starterTemplate.defaultConfig.scenes[0]?.title || 'Hii {recipientName}! ✨');
  const [letterBody, setLetterBody] = useState(
    starterTemplate.defaultConfig.scenes.find((s) => s.type === 'letter')?.bodyText ||
    'I made this little thing just to give you a reason to smile today. ❤️'
  );

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Initial load: resolve session & check if loading an existing experience
  useEffect(() => {
    async function initializeEditor() {
      // 1. Resolve user profile for default creator name if empty
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userMeta = session.user.user_metadata;
          const userDisplayName = userMeta?.display_name || session.user.email?.split('@')[0] || '';
          setCreatorName((prev) => prev || userDisplayName);
        }

        const pState = await partnerService.getPartnerState();
        setPartnerState(pState);
        if (pState.state === 'connected' && pState.partnerName && !paramExpId) {
          setRecipientName((prev) => prev || pState.partnerName || '');
          setRecipientId(pState.partnerId || null);
        }
      } catch {
        // Fallback
      }

      // 2. Check if paramExpId or id is an existing experience ID
      const targetId = paramExpId || id;
      if (targetId && !getTemplateById(targetId)) {
        setIsLoadingExisting(true);
        try {
          const existing = await experienceService.getExperienceById(targetId);
          if (existing) {
            setExistingExperienceId(existing.id);
            setActiveTemplateId(existing.templateId);
            setExistingSlug(existing.slug);
            setCreatorName(existing.creatorName || '');
            setRecipientName(existing.recipientName || '');
            setTitle(existing.title || '');
            setSharingMode(existing.sharingMode || 'public_link');
            setRecipientId(existing.recipientId || null);
            setSelectedTheme(existing.config.theme || DEFAULT_ROMANTIC_THEME);
            setMusicEnabled(!!existing.config.music?.enabled);

            const firstGreeting = existing.config.scenes.find((s) => s.type === 'greeting');
            if (firstGreeting) setHeadline(firstGreeting.title);

            const letterScene = existing.config.scenes.find((s) => s.type === 'letter');
            if (letterScene && letterScene.bodyText) setLetterBody(letterScene.bodyText);
          }
        } catch (err) {
          console.warn('Could not load existing experience:', err);
        } finally {
          setIsLoadingExisting(false);
        }
      }
    }

    initializeEditor();
  }, [id, paramExpId]);

  // Construct config object from current state
  const buildCurrentConfig = () => {
    const template = getTemplateById(activeTemplateId) || starterTemplate;
    const updatedScenes = template.defaultConfig.scenes.map((scene) => {
      if (scene.type === 'greeting') {
        return { ...scene, title: headline };
      }
      if (scene.type === 'letter') {
        return { ...scene, bodyText: letterBody };
      }
      return scene;
    });

    return {
      ...template.defaultConfig,
      creatorName: creatorName.trim(),
      recipientName: recipientName.trim(),
      title: title.trim(),
      theme: selectedTheme,
      music: { ...template.defaultConfig.music, enabled: musicEnabled },
      scenes: updatedScenes
    };
  };

  // Validate fields before saving
  const validateInputs = () => {
    if (!creatorName.trim()) {
      Alert.alert('Missing Name', 'Please enter your name so your recipient knows who this is from.');
      return false;
    }
    if (!recipientName.trim()) {
      Alert.alert('Missing Recipient', 'Please enter your recipient’s name.');
      return false;
    }
    return true;
  };

  // 1. SAVE DRAFT HANDLER
  const handleSaveDraft = async () => {
    if (!validateInputs()) return;

    const newConfig = buildCurrentConfig();
    const validation = ExperienceConfigSchema.safeParse(newConfig);
    if (!validation.success) {
      Alert.alert('Validation Error', validation.error.issues[0]?.message || 'Invalid experience configuration');
      return;
    }

    setIsSavingDraft(true);
    try {
      const expId = existingExperienceId || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const slug = existingSlug || generateSlug(recipientName.trim() || 'surprise');
      const now = new Date().toISOString();

      const targetRecipientId = sharingMode === 'partner_exclusive' ? (recipientId || partnerState.partnerId || null) : null;

      const draftExperience: Experience = {
        id: expId,
        userId: 'local-guest', // Will be overridden dynamically in experienceService if authenticated
        templateId: activeTemplateId,
        title: title.trim() || `${recipientName}'s Surprise`,
        creatorName: creatorName.trim(),
        recipientName: recipientName.trim(),
        slug,
        config: newConfig,
        status: 'draft',
        sharingMode,
        recipientId: targetRecipientId,
        publishedAt: null,
        createdAt: now,
        updatedAt: now
      };

      await experienceService.saveExperience(draftExperience, false);
      setExistingExperienceId(expId);
      setExistingSlug(slug);
      setIsSavingDraft(false);

      Alert.alert(
        'Draft Saved 📝',
        'Your surprise has been saved. You can continue customizing or publish when you are ready.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'View in My Surprises',
            onPress: () => router.push('/(tabs)/my-experiences')
          }
        ]
      );
    } catch (err: any) {
      setIsSavingDraft(false);
      Alert.alert('Error Saving Draft', err?.message || 'Could not save draft.');
    }
  };

  // 2. PUBLISH SURPRISE HANDLER
  const handlePublish = async () => {
    if (!validateInputs()) return;

    // Verify authentication with Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      Alert.alert(
        'Sign In Required to Publish 💖',
        'To generate a live public link for your recipient, please sign in or create an account. You can also save your progress as a draft.',
        [
          {
            text: 'Save as Draft',
            onPress: () => handleSaveDraft()
          },
          {
            text: 'Sign In / Register',
            onPress: async () => {
              const currentId = existingExperienceId || activeTemplateId;
              await authService.setAuthRedirect(`/editor/${currentId}`);
              router.push('/(auth)/sign-in');
            }
          }
        ]
      );
      return;
    }

    const targetRecipientId = sharingMode === 'partner_exclusive' ? (recipientId || partnerState.partnerId || null) : null;
    if (sharingMode === 'partner_exclusive' && !targetRecipientId) {
      Alert.alert(
        'Partner Connection Required 🔒',
        'Partner-exclusive surprises require an active connected partner. Please connect with your partner in Profile, or switch to Public Link sharing.'
      );
      return;
    }

    const newConfig = buildCurrentConfig();
    const validation = ExperienceConfigSchema.safeParse(newConfig);
    if (!validation.success) {
      Alert.alert('Validation Error', validation.error.issues[0]?.message || 'Invalid experience configuration');
      return;
    }

    setIsPublishing(true);
    const slug = existingSlug || generateSlug(recipientName.trim());
    const now = new Date().toISOString();
    const expId = existingExperienceId || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const publishedExperience: Experience = {
      id: expId,
      userId: session.user.id,
      templateId: activeTemplateId,
      title: title.trim() || `${recipientName}'s Surprise`,
      creatorName: creatorName.trim(),
      recipientName: recipientName.trim(),
      slug,
      config: newConfig,
      status: 'published',
      sharingMode,
      recipientId: targetRecipientId,
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    };

    try {
      // Require cloud sync verification
      await experienceService.saveExperience(publishedExperience, true);
      setExistingExperienceId(expId);
      setExistingSlug(slug);
      setIsPublishing(false);

      const publicUrl = buildRecipientExperienceUrl(slug, process.env.EXPO_PUBLIC_RECIPIENT_BASE_URL);

      Alert.alert(
        'Surprise Published! 💖',
        `Your unique romantic link is live and ready to share:\n\n${publicUrl}`,
        [
          {
            text: 'View in My Surprises',
            onPress: () => router.push('/(tabs)/my-experiences')
          }
        ]
      );
    } catch (err: any) {
      setIsPublishing(false);
      Alert.alert(
        'Publishing Failed',
        err?.message || 'Could not connect to Supabase cloud. Please check your internet connection and verify you are signed in.'
      );
    }
  };

  if (isLoadingExisting) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={THEME.colors.rose} />
        <Text style={{ marginTop: 12, color: THEME.colors.burgundy, fontWeight: '600' }}>
          Loading surprise...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Existing draft notice banner */}
      {existingExperienceId ? (
        <View style={styles.draftBanner}>
          <Sparkles size={16} color={THEME.colors.rose} />
          <Text style={styles.draftBannerText}>Editing saved surprise</Text>
        </View>
      ) : null}

      {/* Step 1: Who is this for? */}
      <Card>
        <Text style={styles.cardHeader}>1. Who is this surprise for?</Text>
        <Input
          label="Your Name (Creator)"
          value={creatorName}
          onChangeText={setCreatorName}
          placeholder="e.g. Jordan"
        />
        <Input
          label="Recipient Name"
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="e.g. Taylor"
        />
        <Input
          label="Experience Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. A Special Surprise For You"
        />

        {/* Sharing Mode & Privacy Selector */}
        <Text style={styles.sharingSectionTitle}>Audience & Privacy</Text>
        <View style={styles.sharingModeContainer}>
          <TouchableOpacity
            style={[
              styles.sharingOption,
              sharingMode === 'public_link' && styles.sharingOptionActive
            ]}
            onPress={() => setSharingMode('public_link')}
          >
            <View style={styles.sharingOptionHeader}>
              <Globe size={16} color={sharingMode === 'public_link' ? THEME.colors.rose : THEME.colors.burgundySoft} />
              <Text style={[styles.sharingOptionTitle, sharingMode === 'public_link' && styles.sharingOptionTitleActive]}>
                Public Link
              </Text>
            </View>
            <Text style={styles.sharingOptionDesc}>
              Anyone with the link can open and experience on web.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sharingOption,
              sharingMode === 'partner_exclusive' && styles.sharingOptionActive
            ]}
            onPress={() => {
              if (partnerState.state !== 'connected') {
                Alert.alert(
                  'Partner Connection Needed 🔒',
                  'To create a private partner-exclusive surprise, connect with your partner first in the Profile tab.'
                );
                return;
              }
              setSharingMode('partner_exclusive');
              if (partnerState.partnerName && !recipientName.trim()) {
                setRecipientName(partnerState.partnerName);
              }
              if (partnerState.partnerId) {
                setRecipientId(partnerState.partnerId);
              }
            }}
          >
            <View style={styles.sharingOptionHeader}>
              <Lock size={16} color={sharingMode === 'partner_exclusive' ? THEME.colors.rose : THEME.colors.burgundySoft} />
              <Text style={[styles.sharingOptionTitle, sharingMode === 'partner_exclusive' && styles.sharingOptionTitleActive]}>
                Partner Exclusive 🔒
              </Text>
            </View>
            <Text style={styles.sharingOptionDesc}>
              {partnerState.state === 'connected'
                ? `Private for ${partnerState.partnerName || 'your partner'}. Protected in app.`
                : 'Connect with partner to unlock private surprises.'}
            </Text>
          </TouchableOpacity>
        </View>
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
      <View style={styles.actionContainer}>
        {/* Preview Button */}
        <Button
          title="Preview Surprise"
          variant="outline"
          icon={<Eye size={16} color={THEME.colors.burgundy} />}
          onPress={() => {
            router.push({
              pathname: '/preview/[id]',
              params: {
                id: activeTemplateId,
                creator: creatorName || 'Someone Special',
                recipient: recipientName || 'My Love',
                title: title,
                themeId: selectedTheme.id,
                headline: headline,
                letter: letterBody,
                music: musicEnabled ? '1' : '0'
              }
            } as any);
          }}
          style={{ marginBottom: 12 }}
        />

        {/* Primary Save & Publish Actions */}
        <View style={styles.actionButtons}>
          <Button
            title="Save Draft"
            variant="outline"
            icon={<BookmarkCheck size={16} color={THEME.colors.rose} />}
            loading={isSavingDraft}
            onPress={handleSaveDraft}
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
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(232, 93, 117, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    marginBottom: 16
  },
  draftBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.rose
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
  actionContainer: {
    marginBottom: 40
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  sharingSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.burgundySoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8
  },
  sharingModeContainer: {
    flexDirection: 'row',
    gap: 10
  },
  sharingOption: {
    flex: 1,
    padding: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(84, 38, 56, 0.1)',
    backgroundColor: '#FFFFFF'
  },
  sharingOptionActive: {
    borderColor: THEME.colors.rose,
    backgroundColor: 'rgba(232, 93, 117, 0.05)'
  },
  sharingOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  sharingOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  sharingOptionTitleActive: {
    color: THEME.colors.rose
  },
  sharingOptionDesc: {
    fontSize: 11,
    color: THEME.colors.burgundySoft,
    lineHeight: 15
  }
});
