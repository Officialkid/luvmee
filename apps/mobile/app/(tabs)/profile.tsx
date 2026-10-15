import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  User,
  Heart,
  Share2,
  Sparkles,
  ShieldCheck,
  LogOut,
  LogIn,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  PenSquare,
  Trash2,
  Bookmark
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar, Badge, SectionHeader } from '../../components/UIPrimitives';
import { supabase } from '../../services/supabase';
import { experienceService } from '../../services/experienceService';
import { partnerService } from '../../services/partnerService';
import { notificationService } from '../../services/notificationService';
import { loveNotesService } from '../../services/loveNotesService';
import { authService } from '../../services/authService';
import { PartnerState } from '@luvmee/shared';
import { PartnerConnectModal } from '../../components/PartnerConnectModal';
import { EditUsernameModal } from '../../components/EditUsernameModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';

export default function ProfileScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [partnerState, setPartnerState] = useState<PartnerState>({
    state: 'not_connected',
    myPartnerCode: null
  });
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [editUsernameVisible, setEditUsernameVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0 });

  useEffect(() => {
    checkUser();
    loadStats();
    loadPartner();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUser();
      loadStats();
      loadPartner();
    }, [])
  );

  const checkUser = async () => {
    try {
      const session = await authService.getValidSession();
      if (session?.user) {
        setUserEmail(session.user.email || null);
        const metaName = session.user.user_metadata?.display_name || session.user.email?.split('@')[0];
        setUserName(metaName || 'Romantic Creator');

        // Fetch application profile including username
        const profile = await authService.getProfile();
        if (profile?.username) {
          setUserHandle(profile.username);
        } else {
          setUserHandle(null);
        }

        // Register device push token in background
        notificationService.registerDeviceForPush().catch(() => {});
      } else {
        setUserEmail(null);
        setUserName(null);
        setUserHandle(null);
      }
    } catch {
      setUserEmail(null);
      setUserName(null);
      setUserHandle(null);
    }
  };

  const loadPartner = async () => {
    try {
      const state = await partnerService.getPartnerState();
      setPartnerState(state);
    } catch {
      // Fallback
    }
  };

  const loadStats = async () => {
    try {
      const list = await experienceService.getExperiences();
      const published = list.filter((e) => e.status === 'published').length;
      setStats({ total: list.length, published });
    } catch {
      // Fallback
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { data } = await supabase.auth.getSession();
          const uid = data?.session?.user?.id;
          await loveNotesService.clearCache(uid);
          await AsyncStorage.removeItem('@luvmee_partner_messages_v1');
          await authService.signOut();
          setUserEmail(null);
          setUserName(null);
          await loadPartner();
          Alert.alert('Signed Out', 'You are now exploring as a guest.');
        }
      }
    ]);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will clear local cache and re-fetch from cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            await AsyncStorage.removeItem('@luvmee_experiences_v1');
            await loadStats();
            await loadPartner();
            Alert.alert('Reset Complete', 'Local cache refreshed.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ACCOUNT & SETTINGS</Text>
          <Text style={styles.headerTitle}>Profile & Preferences</Text>
        </View>

        {/* User Card */}
        <Card variant="surface" style={styles.userCard}>
          <Avatar name={userName || 'User'} size="lg" style={{ marginBottom: 10 }} />
          <Text style={styles.userName}>
            {userName || 'Guest Creator'}
          </Text>

          {userHandle ? (
            <TouchableOpacity
              style={styles.handleBadge}
              onPress={() => setEditUsernameVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.handleText}>@{userHandle}</Text>
              <PenSquare size={12} color={THEME.colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : null}

          <Text style={styles.userEmail}>
            {userEmail ? userEmail : 'Guest Mode • Sign in to sync across devices'}
          </Text>

          {partnerState.myPartnerCode ? (
            <TouchableOpacity
              style={styles.partnerCodeBanner}
              onPress={() => setConnectModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.partnerCodeBannerLabel}>YOUR PARTNER CODE:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.partnerCodeBannerCode}>{partnerState.myPartnerCode}</Text>
                <Share2 size={13} color={THEME.colors.primary} />
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.published}</Text>
              <Text style={styles.statLabel}>Published</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {partnerState.state === 'connected' && partnerState.daysInLove !== undefined
                  ? partnerState.daysInLove
                  : '—'}
              </Text>
              <Text style={styles.statLabel}>Days in Love</Text>
            </View>
          </View>
        </Card>

        {/* Partner Connection Card */}
        <SectionHeader title="Connected Partner" />
        <Card variant="surface" style={styles.userCard}>
          {partnerState.state === 'connected' ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 14 }}>
                <Avatar name={partnerState.partnerName || 'Partner'} size="md" showOnlineDot />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.partnerNameHeading}>{partnerState.partnerName || 'Partner'}</Text>
                    <Badge label="Partner" variant="primary" />
                  </View>
                  <Text style={styles.partnerSubtext}>Connected Partner • Love Notes Enabled</Text>
                </View>
              </View>
              <View style={{ width: '100%', gap: 10 }}>
                <Button
                  title="Open Love Notes & Sparks"
                  onPress={() => router.push('/(tabs)/messages')}
                />
                <Button
                  title="Manage Connection / Disconnect"
                  variant="outline"
                  onPress={() => setConnectModalVisible(true)}
                />
              </View>
            </>
          ) : partnerState.state === 'incoming_pending' ? (
            <View style={{ alignItems: 'center', paddingVertical: 12, width: '100%' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>💌</Text>
              <Text style={[styles.userName, { textAlign: 'center', marginBottom: 4 }]}>
                Incoming Request: {partnerState.partnerName || 'Partner'}
              </Text>
              <Text style={[styles.userEmail, { textAlign: 'center', marginBottom: 14 }]}>
                Wants to connect as your partner on LUVMEE.
              </Text>
              <Button
                title="Review & Accept Connection"
                onPress={() => setConnectModalVisible(true)}
              />
            </View>
          ) : partnerState.state === 'outgoing_pending' ? (
            <View style={{ alignItems: 'center', paddingVertical: 12, width: '100%' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>⏳</Text>
              <Text style={[styles.userName, { textAlign: 'center', marginBottom: 4 }]}>
                Invite Sent to {partnerState.partnerName || 'Partner'}
              </Text>
              <Text style={[styles.userEmail, { textAlign: 'center', marginBottom: 14 }]}>
                Waiting for your partner to accept your connection request.
              </Text>
              <Button
                title="View Status / Cancel"
                variant="outline"
                onPress={() => setConnectModalVisible(true)}
              />
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 12, width: '100%' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>💌</Text>
              <Text style={[styles.userName, { textAlign: 'center', marginBottom: 4 }]}>
                No Partner Connected Yet
              </Text>
              <Text style={[styles.userEmail, { textAlign: 'center', marginBottom: 14 }]}>
                Invite your partner to connect, exchange daily love sparks, and see relationship milestones together.
              </Text>
              <Button
                title="Connect With Partner"
                onPress={() => setConnectModalVisible(true)}
              />
            </View>
          )}
        </Card>

        {/* Auth CTA if guest */}
        {!userEmail ? (
          <Card variant="highlight" style={styles.authCtaCard}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Sparkles size={22} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Sign In with Email</Text>
                <Text style={styles.ctaBody}>
                  Sign in with an email code to securely sync your surprises, celebration calendar, and love notes.
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <Button
                title="Sign In with Email"
                onPress={async () => {
                  await authService.setAuthRedirect('/(tabs)/profile');
                  router.push('/(auth)/sign-in');
                }}
              />
            </View>
          </Card>
        ) : null}

        {/* Section: Product Principles */}
        <SectionHeader title="Product Principles" />
        <Card variant="surface" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <ShieldCheck size={18} color={THEME.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>No App Required for Recipients</Text>
              <Text style={styles.infoDesc}>
                Recipients open your published surprises in any mobile or desktop browser with zero signup.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Heart size={18} color={THEME.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Curated Romantic Themes</Text>
              <Text style={styles.infoDesc}>
                Interactive templates with escaping buttons, hidden letters, and celebration confetti.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section: Preferences & Actions */}
        <SectionHeader title="Preferences & Account" />
        <Card variant="surface" style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/(tabs)/plans')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: THEME.colors.surfaceHighlight }]}>
              <Bookmark size={16} color={THEME.colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Personal Plans & Wishlist</Text>
            <ChevronRight size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionItem} onPress={handleResetData} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <RotateCcw size={16} color={THEME.colors.textHeading} />
            </View>
            <Text style={styles.actionLabel}>Reset Local Cache</Text>
            <ChevronRight size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {userEmail && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setEditUsernameVisible(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: THEME.colors.surfaceHighlight }]}>
                  <PenSquare size={16} color={THEME.colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Edit Username</Text>
                <ChevronRight size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.actionItem} onPress={handleSignOut} activeOpacity={0.7}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <LogOut size={16} color={THEME.colors.danger} />
                </View>
                <Text style={[styles.actionLabel, { color: THEME.colors.danger }]}>Sign Out</Text>
                <ChevronRight size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setDeleteAccountVisible(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Trash2 size={16} color={THEME.colors.danger} />
                </View>
                <Text style={[styles.actionLabel, { color: THEME.colors.danger }]}>Permanently Delete Account</Text>
                <ChevronRight size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerApp}>LUVMEE V1.0</Text>
          <Text style={styles.footerNote}>Remember who matters • Celebrate what counts</Text>
        </View>
      </ScrollView>

      <PartnerConnectModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        partnerState={partnerState}
        onStateChange={loadPartner}
      />

      <EditUsernameModal
        visible={editUsernameVisible}
        currentUsername={userHandle || ''}
        onClose={() => setEditUsernameVisible(false)}
        onUsernameUpdated={(newHandle) => {
          setUserHandle(newHandle);
          Alert.alert('Username Updated', `@${newHandle} is now your active username.`);
        }}
      />

      <DeleteAccountModal
        visible={deleteAccountVisible}
        onClose={() => setDeleteAccountVisible(false)}
        onDeleted={async () => {
          setDeleteAccountVisible(false);
          setUserEmail(null);
          setUserName(null);
          setUserHandle(null);
          await loadPartner();
          Alert.alert('Account Deleted', 'Your LUVMEE account and data have been permanently removed.');
          router.replace('/(tabs)');
        }}
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
    paddingTop: 8,
    paddingBottom: 16
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1.2
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: -0.3,
    marginTop: 2
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.lg,
    marginBottom: 16
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    marginBottom: 2
  },
  partnerNameHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  partnerSubtext: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  handleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    marginBottom: 6
  },
  handleText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary
  },
  userEmail: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginBottom: 16
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.primary
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.border
  },
  authCtaCard: {
    marginBottom: 16,
    padding: 14,
    borderRadius: THEME.radius.lg
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  ctaBody: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
    lineHeight: 16
  },
  infoCard: {
    padding: 14,
    borderRadius: THEME.radius.md,
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  infoDesc: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 10
  },
  actionsCard: {
    padding: 6,
    borderRadius: THEME.radius.md,
    marginBottom: 20
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  footer: {
    alignItems: 'center',
    marginTop: 6
  },
  footerApp: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 1
  },
  footerNote: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    textAlign: 'center'
  },
  partnerCodeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    width: '100%',
    marginBottom: 14
  },
  partnerCodeBannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 0.8
  },
  partnerCodeBannerCode: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: 1
  }
});
