import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Heart,
  Sparkles,
  Plus,
  Gift,
  ArrowRight,
  LogIn,
  Eye,
  CalendarDays,
  Users,
  MessageCircleHeart,
  Share2,
  Bookmark
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { SectionHeader, Badge, Avatar } from '../../components/UIPrimitives';
import { STARTER_TEMPLATES, PartnerState, ImportantDate, calculateNextOccurrence } from '@luvmee/shared';
import { supabase } from '../../services/supabase';
import { partnerService } from '../../services/partnerService';
import { peopleService } from '../../services/peopleService';
import { PartnerConnectModal } from '../../components/PartnerConnectModal';
import { AuthGateModal } from '../../components/AuthGateModal';

export default function HomeScreen() {
  const router = useRouter();
  // Elevate mature, heartfelt celebration template (The Digital Love Letter) as primary
  const featuredTemplate = STARTER_TEMPLATES[1] || STARTER_TEMPLATES[0];

  const [session, setSession] = useState<any>(null);
  const [partnerState, setPartnerState] = useState<PartnerState>({
    state: 'not_connected',
    myPartnerCode: null
  });
  const [upcomingDates, setUpcomingDates] = useState<Array<ImportantDate & { daysRemaining: number }>>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [authGateVisible, setAuthGateVisible] = useState(false);
  const [authGateProps, setAuthGateProps] = useState({
    title: 'Sign in to continue',
    description: 'Save your personal relationship moments securely in the cloud.',
    targetRoute: '/(tabs)',
    actionName: 'Sign In / Register'
  });

  const checkAuthAndPartner = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        const [state, datesList] = await Promise.all([
          partnerService.getPartnerState(),
          peopleService.getImportantDates()
        ]);
        setPartnerState(state);

        // Calculate upcoming dates in next 60 days
        const sortedUpcoming = datesList
          .map((d) => {
            const nextOccur = calculateNextOccurrence(d.month, d.day);
            return { ...d, daysRemaining: nextOccur.daysRemaining };
          })
          .filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 60)
          .sort((a, b) => a.daysRemaining - b.daysRemaining)
          .slice(0, 3);
        setUpcomingDates(sortedUpcoming);
      } else {
        setPartnerState({ state: 'not_connected', myPartnerCode: null });
        setUpcomingDates([]);
      }
    } catch {
      // Fallback
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuthAndPartner();
    setRefreshing(false);
  };

  useEffect(() => {
    checkAuthAndPartner();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        partnerService.getPartnerState().then(setPartnerState).catch(() => {});
      } else {
        setPartnerState({ state: 'not_connected', myPartnerCode: null });
        setUpcomingDates([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAuthAndPartner();
    }, [])
  );

  const triggerAuthGate = (title: string, description: string, targetRoute: string, actionName: string) => {
    setAuthGateProps({ title, description, targetRoute, actionName });
    setAuthGateVisible(true);
  };

  const handlePartnerBannerPress = () => {
    if (!session) {
      triggerAuthGate(
        'Connect with Your Partner',
        'Sign in to link profiles, exchange private love notes, and celebrate your days together.',
        '/(tabs)',
        'Sign In to Connect'
      );
      return;
    }

    if (partnerState.state === 'connected') {
      router.push('/(tabs)/messages');
    } else {
      setConnectModalVisible(true);
    }
  };

  const handleCreateSurprise = (templateId?: string) => {
    const route = templateId ? `/editor/${templateId}` : '/(tabs)/templates';
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Logo variant="horizontal" width={135} height={34} style={{ marginBottom: 4 }} />
            <Text style={styles.greetingTitle}>
              {session ? 'Celebrate who matters' : 'Meaningful celebrations'}
            </Text>
          </View>
          {session ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Avatar
                name={session.user.email || 'You'}
                size="md"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInPill}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <LogIn size={15} color={THEME.colors.primary} />
              <Text style={styles.signInPillText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Guest Landing View vs Authenticated View */}
        {!session ? (
          /* GUEST-FIRST PUBLIC LANDING VIEW */
          <View style={styles.guestContainer}>
            {/* Landing Hero Card */}
            <Card variant="highlight" style={styles.guestHeroCard}>
              <Badge label="Welcome to LUVMEE" variant="primary" style={{ marginBottom: 12 }} />
              <Text style={styles.guestHeroTitle}>
                Remember who matters.{'\n'}Celebrate what counts.
              </Text>
              <Text style={styles.guestHeroBody}>
                Close the gap between caring and showing it. Keep track of meaningful dates, send private Love Notes, and craft interactive surprises with zero app install for recipients.
              </Text>
              <View style={styles.guestHeroActions}>
                <Button
                  title="Sign In with Email"
                  icon={<LogIn size={16} color="#FFFFFF" />}
                  onPress={() => router.push('/(auth)/sign-in')}
                />
                <Button
                  title="Preview Sample Surprise"
                  variant="outline"
                  icon={<Eye size={16} color={THEME.colors.primary} />}
                  onPress={() => router.push(`/preview/${featuredTemplate.id}`)}
                />
              </View>
            </Card>

            {/* Core Value Pillars */}
            <View style={styles.pillarsGrid}>
              <Card variant="surface" style={styles.pillarItem}>
                <View style={styles.pillarIconWrap}>
                  <Heart size={18} color={THEME.colors.primary} />
                </View>
                <Text style={styles.pillarTitle}>Interactive Surprises</Text>
                <Text style={styles.pillarText}>Playful cards with escaping buttons, hidden letters, and confetti.</Text>
              </Card>

              <Card variant="surface" style={styles.pillarItem}>
                <View style={styles.pillarIconWrap}>
                  <CalendarDays size={18} color={THEME.colors.primary} />
                </View>
                <Text style={styles.pillarTitle}>Date Reminders</Text>
                <Text style={styles.pillarText}>Never forget a partner, friend, or family birthday or anniversary.</Text>
              </Card>

              <Card variant="surface" style={styles.pillarItem}>
                <View style={styles.pillarIconWrap}>
                  <MessageCircleHeart size={18} color={THEME.colors.primary} />
                </View>
                <Text style={styles.pillarTitle}>Private Love Notes</Text>
                <Text style={styles.pillarText}>Encrypted, intimate daily connection exclusively between partners.</Text>
              </Card>

              <Card variant="surface" style={styles.pillarItem}>
                <View style={styles.pillarIconWrap}>
                  <Gift size={18} color={THEME.colors.primary} />
                </View>
                <Text style={styles.pillarTitle}>Instant Browser Links</Text>
                <Text style={styles.pillarText}>Recipients open surprises instantly without installing an app or signing in.</Text>
              </Card>
            </View>

            {/* Starter Templates Safe Previews */}
            <SectionHeader
              title="Explore Safe Previews"
              actionLabel={`View All (${STARTER_TEMPLATES.length})`}
              onAction={() => router.push('/(tabs)/templates')}
            />

            {STARTER_TEMPLATES.slice(0, 3).map((template) => (
              <Card key={template.id} variant="surface" style={styles.templatePreviewCard}>
                <View style={styles.featuredTop}>
                  <View style={styles.featuredEmojiCircle}>
                    <Text style={{ fontSize: 26 }}>{template.previewEmoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featuredName}>{template.name}</Text>
                    <Badge label={template.occasion} variant="primary" style={{ marginTop: 2, alignSelf: 'flex-start' }} />
                  </View>
                </View>
                <Text style={styles.featuredDesc}>{template.description}</Text>
                <View style={styles.templateActionRow}>
                  <Button
                    title="Live Preview"
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                    icon={<Eye size={14} color={THEME.colors.primary} />}
                    onPress={() => router.push(`/preview/${template.id}`)}
                  />
                  <Button
                    title="Customize"
                    variant="primary"
                    size="sm"
                    style={{ flex: 1 }}
                    icon={<Sparkles size={14} color="#FFFFFF" />}
                    onPress={() => handleCreateSurprise(template.id)}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          /* AUTHENTICATED CREATOR VIEW */
          <View>
            {/* Partner Connection Banner */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePartnerBannerPress}
              style={{ marginBottom: 18 }}
            >
              <Card variant={partnerState.state === 'connected' ? 'highlight' : 'surface'} style={styles.partnerBannerCard}>
                <View style={styles.partnerBannerLeft}>
                  <Avatar
                    name={partnerState.partnerName || 'Partner'}
                    size="md"
                    showOnlineDot={partnerState.state === 'connected'}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.partnerBannerName}>
                        {partnerState.state === 'connected'
                          ? partnerState.partnerName
                          : partnerState.state === 'incoming_pending'
                          ? `Invite from ${partnerState.partnerName || 'Partner'}`
                          : partnerState.state === 'outgoing_pending'
                          ? `Invite Sent to ${partnerState.partnerName || 'Partner'}`
                          : 'Connect with Partner'}
                      </Text>
                      {partnerState.state === 'connected' && partnerState.daysInLove !== undefined ? (
                        <Badge label={`${partnerState.daysInLove} days in love`} variant="primary" />
                      ) : null}
                    </View>
                    <Text style={styles.partnerBannerStatus} numberOfLines={1}>
                      {partnerState.state === 'connected'
                        ? 'Exchange sweet love notes & surprise reveals'
                        : partnerState.state === 'incoming_pending'
                        ? 'Tap to accept and link your partner profile'
                        : partnerState.state === 'outgoing_pending'
                        ? 'Waiting for partner to accept invitation'
                        : 'Connect with your favorite person to share private notes'}
                    </Text>
                  </View>
                  <ArrowRight size={16} color={THEME.colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>

            {/* Quick Action Hub */}
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.actionHubCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/templates')}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: THEME.colors.surfaceHighlight }]}>
                  <Sparkles size={20} color={THEME.colors.primary} />
                </View>
                <Text style={styles.actionHubTitle}>Create Surprise</Text>
                <Text style={styles.actionHubSub}>Interactive web card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionHubCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/messages')}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(232, 93, 117, 0.12)' }]}>
                  <MessageCircleHeart size={20} color={THEME.colors.primary} />
                </View>
                <Text style={styles.actionHubTitle}>Messages</Text>
                <Text style={styles.actionHubSub}>Daily sparks & notes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionHubCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/people')}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: '#F0F9FF' }]}>
                  <Users size={20} color="#0284C7" />
                </View>
                <Text style={styles.actionHubTitle}>People</Text>
                <Text style={styles.actionHubSub}>Birthdays & dates</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionHubCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/calendar')}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <CalendarDays size={20} color="#16A34A" />
                </View>
                <Text style={styles.actionHubTitle}>Calendar</Text>
                <Text style={styles.actionHubSub}>Occasion roadmap</Text>
              </TouchableOpacity>
            </View>

            {/* Plans Discovery Banner */}
            <TouchableOpacity
              style={styles.plansBanner}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/plans')}
            >
              <View style={styles.plansBannerLeft}>
                <View style={styles.plansBannerIconWrap}>
                  <Bookmark size={20} color={THEME.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.plansBannerTitle}>Personal Plans & Wishlist</Text>
                  <Text style={styles.plansBannerSub}>
                    Save date ideas, places to visit & gift lists
                  </Text>
                </View>
              </View>
              <ArrowRight size={16} color={THEME.colors.primary} />
            </TouchableOpacity>

            {/* Upcoming Celebrations Preview (if any) */}
            {upcomingDates.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader
                  title="Upcoming Celebrations"
                  actionLabel="View Calendar"
                  onAction={() => router.push('/(tabs)/calendar')}
                />
                {upcomingDates.map((d) => (
                  <Card key={d.id} variant="surface" style={styles.upcomingCard}>
                    <View style={styles.upcomingLeft}>
                      <View style={styles.upcomingDayBadge}>
                        <Text style={styles.upcomingDayNumber}>
                          {d.daysRemaining === 0 ? 'Today' : d.daysRemaining === 1 ? '1d' : `${d.daysRemaining}d`}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.upcomingTitle}>{d.title}</Text>
                        <Text style={styles.upcomingSubtitle}>
                          {d.category.charAt(0).toUpperCase() + d.category.slice(1)} • in {d.daysRemaining} day{d.daysRemaining === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                    <Button
                      title="Surprise"
                      variant="outline"
                      size="sm"
                      icon={<Gift size={13} color={THEME.colors.primary} />}
                      onPress={() => router.push('/(tabs)/templates')}
                    />
                  </Card>
                ))}
              </View>
            )}

            {/* Featured Studio Surprise */}
            <SectionHeader
              title="Experience Studio"
              actionLabel="Browse Templates"
              onAction={() => router.push('/(tabs)/templates')}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/editor/${featuredTemplate.id}`)}
            >
              <Card variant="surface" style={styles.featuredCard}>
                <View style={styles.featuredTop}>
                  <View style={styles.featuredEmojiCircle}>
                    <Text style={{ fontSize: 26 }}>{featuredTemplate.previewEmoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featuredName}>{featuredTemplate.name}</Text>
                    <Text style={styles.featuredOccasion}>{featuredTemplate.occasion}</Text>
                  </View>
                </View>
                <Text style={styles.featuredDesc}>{featuredTemplate.description}</Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.useTemplateText}>Customize Experience</Text>
                  <ArrowRight size={15} color={THEME.colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>

            {/* Recipient Privacy Notice */}
            <Card variant="flat" style={styles.tipCard}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Share2 size={20} color={THEME.colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>No App Required for Recipients</Text>
                  <Text style={styles.tipBody}>
                    Recipients open your surprises in any mobile or desktop browser without account setup.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Partner Connection Modal */}
      <PartnerConnectModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        partnerState={partnerState}
        onStateChange={checkAuthAndPartner}
      />

      {/* Auth Gate Modal */}
      <AuthGateModal
        visible={authGateVisible}
        onClose={() => setAuthGateVisible(false)}
        title={authGateProps.title}
        description={authGateProps.description}
        targetRoute={authGateProps.targetRoute}
        actionName={authGateProps.actionName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: -0.3
  },
  signInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  signInPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary
  },
  guestContainer: {
    gap: THEME.spacing.md
  },
  guestHeroCard: {
    padding: THEME.spacing.lg,
    borderRadius: THEME.radius.lg
  },
  guestHeroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.4
  },
  guestHeroBody: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    lineHeight: 20,
    marginBottom: 18
  },
  guestHeroActions: {
    gap: 10
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between'
  },
  pillarItem: {
    width: '48%',
    padding: 14,
    borderRadius: THEME.radius.md
  },
  pillarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    marginBottom: 4
  },
  pillarText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 15
  },
  templatePreviewCard: {
    padding: 16,
    marginBottom: 12
  },
  templateActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  partnerBannerCard: {
    padding: 14,
    borderRadius: THEME.radius.lg
  },
  partnerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  partnerBannerName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  partnerBannerStatus: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8
  },
  actionHubCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  actionHubTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    textAlign: 'center'
  },
  actionHubSub: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 1
  },
  plansBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceHighlight,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
    ...THEME.shadows.subtle
  },
  plansBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  plansBannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  plansBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  plansBannerSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: THEME.radius.md
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  upcomingDayBadge: {
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  upcomingDayNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  upcomingSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1
  },
  featuredCard: {
    padding: 16,
    marginBottom: 16
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  },
  featuredEmojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  featuredOccasion: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '600'
  },
  featuredDesc: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginBottom: 12
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4
  },
  useTemplateText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary
  },
  tipCard: {
    padding: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: 'rgba(84, 40, 56, 0.03)'
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading,
    marginBottom: 2
  },
  tipBody: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 15
  }
});
