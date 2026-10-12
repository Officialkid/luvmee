import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
  ChevronRight
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { supabase } from '../../services/supabase';
import { experienceService } from '../../services/experienceService';

export default function ProfileScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, published: 0 });

  useEffect(() => {
    checkUser();
    loadStats();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(null);
      }
    } catch {
      setUserEmail(null);
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
          await supabase.auth.signOut();
          setUserEmail(null);
          Alert.alert('Signed Out', 'You are now in local guest mode.');
        }
      }
    ]);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Sample Data',
      'This will reload default starter surprises in local storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            // Re-seed by deleting storage key
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem('@luvmee_experiences_v1');
            await loadStats();
            Alert.alert('Reset Complete', 'Default starter surprises restored.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ACCOUNT & SETTINGS</Text>
          <Text style={styles.headerTitle}>Profile 👤</Text>
        </View>

        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>💝</Text>
          </View>
          <Text style={styles.userName}>
            {userEmail ? userEmail.split('@')[0] : 'Romantic Creator'}
          </Text>
          <Text style={styles.userEmail}>
            {userEmail ? userEmail : 'Guest Mode (Local Storage)'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Created</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.published}</Text>
              <Text style={styles.statLabel}>Published</Text>
            </View>
          </View>
        </Card>

        {/* Auth CTA if guest */}
        {!userEmail ? (
          <Card style={styles.authCtaCard}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Sparkles size={24} color={THEME.colors.rose} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Sync With Supabase Cloud</Text>
                <Text style={styles.ctaBody}>
                  Sign in or create an account to back up your romantic surprises across devices.
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              <Button
                title="Sign In / Register"
                onPress={() => router.push('/(auth)/sign-in')}
              />
            </View>
          </Card>
        ) : null}

        {/* Section: Product Highlights */}
        <Text style={styles.sectionHeading}>Product Principles</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <ShieldCheck size={20} color={THEME.colors.rose} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>No App Install For Recipients</Text>
              <Text style={styles.infoDesc}>
                Recipients open your published surprise directly on any browser with zero login required.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Heart size={20} color={THEME.colors.rose} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Curated Romantic Themes</Text>
              <Text style={styles.infoDesc}>
                6 handcrafted templates with escaping NO buttons, gentle audio, and confetti celebrations.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section: Data & Utilities */}
        <Text style={styles.sectionHeading}>Preferences & Actions</Text>
        <Card style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionItem} onPress={handleResetData}>
            <View style={styles.actionIcon}>
              <RotateCcw size={18} color={THEME.colors.burgundy} />
            </View>
            <Text style={styles.actionLabel}>Reset Demo Surprises</Text>
            <ChevronRight size={18} color={THEME.colors.muted} />
          </TouchableOpacity>

          {userEmail && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <LogOut size={18} color="#DC2626" />
                </View>
                <Text style={[styles.actionLabel, { color: '#DC2626' }]}>Sign Out</Text>
                <ChevronRight size={18} color={THEME.colors.muted} />
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerApp}>LUVMEE V1.0.0</Text>
          <Text style={styles.footerNote}>Crafted with ❤️ for Alikah & romantic creators worldwide</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.rose,
    letterSpacing: 1.2
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    marginTop: 2
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 20,
    marginBottom: 16
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FCE7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    marginBottom: 2
  },
  userEmail: {
    fontSize: 13,
    color: THEME.colors.muted,
    marginBottom: 18
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 93, 117, 0.1)'
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.rose
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.muted,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(232, 93, 117, 0.15)'
  },
  authCtaCard: {
    backgroundColor: '#FFF9F2',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 93, 117, 0.25)',
    marginBottom: 20,
    borderRadius: 16
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  ctaBody: {
    fontSize: 12,
    color: THEME.colors.muted,
    marginTop: 2,
    lineHeight: 18
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  infoDesc: {
    fontSize: 12,
    color: THEME.colors.muted,
    lineHeight: 17,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    marginVertical: 12
  },
  actionsCard: {
    padding: 8,
    borderRadius: 16,
    marginBottom: 24
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.burgundy
  },
  footer: {
    alignItems: 'center',
    marginTop: 10
  },
  footerApp: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.rose,
    letterSpacing: 1
  },
  footerNote: {
    fontSize: 11,
    color: THEME.colors.muted,
    marginTop: 4,
    textAlign: 'center'
  }
});
