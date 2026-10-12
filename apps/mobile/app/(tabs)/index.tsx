import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Heart, Sparkles, Plus, Gift, ArrowRight, UserPlus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { STARTER_TEMPLATES, PartnerState } from '@luvmee/shared';
import { supabase } from '../../services/supabase';
import { partnerService } from '../../services/partnerService';
import { PartnerConnectModal } from '../../components/PartnerConnectModal';

export default function HomeScreen() {
  const router = useRouter();
  const featuredTemplate = STARTER_TEMPLATES[0]; // The Playful Yes-or-No

  const [partnerState, setPartnerState] = useState<PartnerState>({
    state: 'not_connected',
    myPartnerCode: null
  });
  const [connectModalVisible, setConnectModalVisible] = useState(false);

  useEffect(() => {
    loadPartnerStatus();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPartnerStatus();
    }, [])
  );

  const loadPartnerStatus = async () => {
    try {
      const state = await partnerService.getPartnerState();
      setPartnerState(state);
    } catch {
      // Fallback
    }
  };

  const handlePartnerBannerPress = () => {
    if (partnerState.state === 'connected') {
      router.push('/(tabs)/messages');
    } else {
      setConnectModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Logo variant="horizontal" width={145} height={38} style={{ marginBottom: 6 }} />
            <Text style={styles.greetingTitle}>Craft a romantic surprise</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.avatarText}>✨</Text>
          </TouchableOpacity>
        </View>

        {/* Partner Connection Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePartnerBannerPress}
          style={{ marginBottom: 16 }}
        >
          <Card style={styles.partnerBannerCard}>
            <View style={styles.partnerBannerLeft}>
              <View style={styles.partnerBannerAvatar}>
                <Text style={{ fontSize: 24 }}>
                  {partnerState.state === 'connected'
                    ? '👸🏽'
                    : partnerState.state === 'incoming_pending'
                    ? '💖'
                    : partnerState.state === 'outgoing_pending'
                    ? '⏳'
                    : '💌'}
                </Text>
                {partnerState.state === 'connected' ? <View style={styles.partnerOnlineDot} /> : null}
              </View>
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
                    <Text style={styles.partnerBannerDays}>• {partnerState.daysInLove} days in love 💕</Text>
                  ) : null}
                </View>
                <Text style={styles.partnerBannerStatus}>
                  {partnerState.state === 'connected'
                    ? 'Exchange sweet love notes & surprise links'
                    : partnerState.state === 'incoming_pending'
                    ? 'Tap to accept and link your partner profile 💕'
                    : partnerState.state === 'outgoing_pending'
                    ? 'Waiting for partner to accept connection'
                    : 'Invite your favorite person to share surprises & love notes'}
                </Text>
              </View>
            </View>
            <View style={styles.partnerBannerBtn}>
              <Text style={styles.partnerBannerBtnText}>
                {partnerState.state === 'connected'
                  ? 'Chat & Sparks 💌'
                  : partnerState.state === 'incoming_pending'
                  ? 'Review & Accept 💕'
                  : partnerState.state === 'outgoing_pending'
                  ? 'View Status ⏳'
                  : 'Connect 💌'}
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Hero Create Action */}
        <Card style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Sparkles size={13} color={THEME.colors.rose} />
            <Text style={styles.heroBadgeText}>Romantic Experience Studio</Text>
          </View>
          <Text style={styles.heroHeading}>
            {partnerState.state === 'connected' && partnerState.partnerName
              ? `Craft a surprise for ${partnerState.partnerName}`
              : 'Craft an unforgettable romantic surprise'}
          </Text>
          <Text style={styles.heroBody}>
            Personalized interactive love letters, playful questions with escaping NO buttons, and virtual gift boxes with your unique link.
          </Text>
          <Button
            title="Create Surprise"
            icon={<Plus size={18} color="#FFFFFF" />}
            onPress={() => router.push('/(tabs)/templates')}
          />
        </Card>

        {/* Featured Template */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Template</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/templates')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/editor/${featuredTemplate.id}`)}
        >
          <Card style={styles.featuredCard}>
            <View style={styles.featuredTop}>
              <View style={styles.featuredEmojiCircle}>
                <Text style={{ fontSize: 28 }}>{featuredTemplate.previewEmoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredName}>{featuredTemplate.name}</Text>
                <Text style={styles.featuredOccasion}>{featuredTemplate.occasion}</Text>
              </View>
            </View>
            <Text style={styles.featuredDesc}>{featuredTemplate.description}</Text>
            <View style={styles.featuredFooter}>
              <Text style={styles.useTemplateText}>Use This Template</Text>
              <ArrowRight size={16} color={THEME.colors.rose} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Quick Tips Card */}
        <Card style={styles.tipCard}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Gift size={24} color={THEME.colors.rose} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>No App Install Needed For Recipients</Text>
              <Text style={styles.tipBody}>
                Recipients simply open your published link in their mobile browser—no signup or login required!
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      <PartnerConnectModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        partnerState={partnerState}
        onStateChange={loadPartnerStatus}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  scrollContent: {
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  emojiAnim: {
    fontSize: 18
  },
  appName: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    letterSpacing: 1
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  avatarText: {
    fontSize: 20
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    marginBottom: 24
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
    marginBottom: 12
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose,
    textTransform: 'uppercase'
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 8
  },
  heroBody: {
    fontSize: 14,
    color: THEME.colors.burgundySoft,
    lineHeight: 20,
    marginBottom: 18
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  featuredCard: {
    padding: 18,
    marginBottom: 16
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10
  },
  featuredEmojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.blush,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  featuredOccasion: {
    fontSize: 12,
    color: THEME.colors.rose,
    fontWeight: '600'
  },
  featuredDesc: {
    fontSize: 13,
    color: THEME.colors.burgundySoft,
    lineHeight: 18,
    marginBottom: 14
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4
  },
  useTemplateText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 16
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 2
  },
  tipBody: {
    fontSize: 12,
    color: THEME.colors.burgundySoft,
    lineHeight: 16
  },
  partnerBannerCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 93, 117, 0.25)'
  },
  partnerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  partnerBannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCE7ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  partnerOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  partnerBannerName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.burgundy
  },
  partnerBannerDays: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  partnerBannerStatus: {
    fontSize: 12,
    color: THEME.colors.muted,
    marginTop: 2
  },
  partnerBannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  partnerBannerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose
  }
});
