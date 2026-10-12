import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Heart,
  Send,
  Sparkles,
  Phone,
  Gift,
  Calendar,
  Smile,
  CheckCheck,
  Share2,
  Clock,
  MessageCircleHeart,
  ChevronRight
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PartnerState } from '@luvmee/shared';
import { partnerService } from '../../services/partnerService';
import { PartnerConnectModal } from '../../components/PartnerConnectModal';

interface LoveNote {
  id: string;
  sender: 'me' | 'partner' | string;
  text: string;
  timestamp: string;
  tag?: string;
}

const DEFAULT_MESSAGES: LoveNote[] = [
  {
    id: 'm1',
    sender: 'system',
    text: 'Welcome to Love Notes! Exchange sweet thoughts, romantic nudges, and special surprise reveals here. 💌',
    timestamp: 'Just now',
    tag: 'Welcome ✨'
  }
];

const QUICK_NUDGES = [
  { emoji: '💋', text: 'Sending a sweet kiss' },
  { emoji: '☕', text: 'Coffee date tonight?' },
  { emoji: '🌹', text: 'Thinking of you right now' },
  { emoji: '💌', text: 'You are my favorite person' }
];

export default function MessagesScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<LoveNote[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sparkAnswered, setSparkAnswered] = useState(false);
  const [sparkAnswer, setSparkAnswer] = useState('');
  const [partnerState, setPartnerState] = useState<PartnerState>({
    state: 'not_connected',
    myPartnerCode: null
  });
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [partnerPhone, setPartnerPhone] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Me');

  const STORAGE_KEY = '@luvmee_partner_messages_v1';

  useEffect(() => {
    loadMessages();
    loadPartnerAndUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
      loadPartnerAndUser();
    }, [])
  );

  const loadPartnerAndUser = async () => {
    try {
      const state = await partnerService.getPartnerState();
      setPartnerState(state);
      const stored = await AsyncStorage.getItem('@luvmee_partner_info');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.phone) setPartnerPhone(parsed.phone);
      }
    } catch {
      // Fallback
    }
  };

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch {
      // Use defaults
    }
  };

  const saveMessages = async (newMessages: LoveNote[]) => {
    try {
      setMessages(newMessages);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newNote: LoveNote = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: selectedTag || 'Love Note 💌'
    };

    const updated = [...messages, newNote];
    saveMessages(updated);
    setInputText('');
    setSelectedTag(null);
  };

  const handleQuickNudge = (nudge: { emoji: string; text: string }) => {
    setInputText(`${nudge.emoji} ${nudge.text}`);
  };

  const handleCallPartner = () => {
    if (partnerPhone) {
      Alert.alert(
        `Call ${partnerState.partnerName || 'Partner'}`,
        `Contact: ${partnerPhone}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call Now', onPress: () => Linking.openURL(`tel:${partnerPhone}`) }
        ]
      );
    } else {
      Alert.alert(
        'Call Partner',
        'Add your partner\'s contact number in settings to enable 1-tap phone calls.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>COUPLE CONNECTION</Text>
              <Text style={styles.headerTitle}>Love Notes & Chat 💌</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallPartner}
            >
              <Phone size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Connected Partner Card */}
          <Card style={styles.partnerCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setConnectModalVisible(true)}
              style={styles.partnerTop}
            >
              <View style={styles.partnerAvatar}>
                <Text style={{ fontSize: 28 }}>
                  {partnerState.state === 'connected'
                    ? '👸🏽'
                    : partnerState.state === 'incoming_pending'
                    ? '💖'
                    : partnerState.state === 'outgoing_pending'
                    ? '⏳'
                    : '💌'}
                </Text>
                {partnerState.state === 'connected' ? <View style={styles.onlineBadge} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.partnerName}>
                    {partnerState.state === 'connected'
                      ? partnerState.partnerName
                      : partnerState.state === 'incoming_pending'
                      ? `Invite from ${partnerState.partnerName || 'Partner'}`
                      : partnerState.state === 'outgoing_pending'
                      ? `Invite Sent: ${partnerState.partnerName || 'Partner'}`
                      : 'Connect With Partner'}
                  </Text>
                  {partnerState.state === 'connected' ? (
                    <View style={styles.heartTag}>
                      <Heart size={12} color={THEME.colors.rose} fill={THEME.colors.rose} />
                      <Text style={styles.heartTagText}>Partner</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.partnerStatus}>
                  {partnerState.state === 'connected'
                    ? 'Love Notes Connected • Tap to manage'
                    : partnerState.state === 'incoming_pending'
                    ? 'Tap to review and accept connection 💕'
                    : partnerState.state === 'outgoing_pending'
                    ? 'Waiting for partner to accept • Tap to view'
                    : 'Invite your partner to exchange love sparks'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.surpriseQuickBtn}
                onPress={() => {
                  if (partnerState.state === 'connected') {
                    router.push('/(tabs)/templates');
                  } else {
                    setConnectModalVisible(true);
                  }
                }}
              >
                {partnerState.state === 'connected' ? (
                  <>
                    <Gift size={16} color={THEME.colors.rose} />
                    <Text style={styles.surpriseQuickText}>Surprise</Text>
                  </>
                ) : (
                  <>
                    <Heart size={16} color={THEME.colors.rose} />
                    <Text style={styles.surpriseQuickText}>Link</Text>
                  </>
                )}
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Couple Relationship Vitals */}
            <View style={styles.vitalsRow}>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalNumber}>
                  {partnerState.state === 'connected' && partnerState.daysInLove !== undefined
                    ? `${partnerState.daysInLove}`
                    : '—'}
                </Text>
                <Text style={styles.vitalLabel}>Days in Love</Text>
              </View>
              <View style={styles.vitalDivider} />
              <View style={styles.vitalBox}>
                <Text style={styles.vitalNumber}>
                  {partnerState.state === 'connected'
                    ? 'Connected'
                    : partnerState.state === 'incoming_pending'
                    ? 'Incoming'
                    : partnerState.state === 'outgoing_pending'
                    ? 'Pending'
                    : 'Unlinked'}
                </Text>
                <Text style={styles.vitalLabel}>Status</Text>
              </View>
              <View style={styles.vitalDivider} />
              <View style={styles.vitalBox}>
                <Text style={styles.vitalNumber}>{messages.length}</Text>
                <Text style={styles.vitalLabel}>Love Notes</Text>
              </View>
            </View>
          </Card>

          {/* Daily Romantic Spark (Daily Retention Feature) */}
          <Card style={styles.sparkCard}>
            <View style={styles.sparkBadge}>
              <Sparkles size={13} color={THEME.colors.rose} />
              <Text style={styles.sparkBadgeText}>Today's Love Spark</Text>
            </View>
            <Text style={styles.sparkQuestion}>
              "What is your absolute favorite memory of us together?"
            </Text>

            {/* Answer Section */}
            {sparkAnswered ? (
              <View style={styles.johnAnswerBox}>
                <Text style={styles.johnAnswerHeader}>Your Answer ✨:</Text>
                <Text style={styles.johnAnswerText}>{sparkAnswer}</Text>
              </View>
            ) : (
              <View style={styles.answerComposer}>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Type your answer to share..."
                  placeholderTextColor={THEME.colors.muted}
                  value={sparkAnswer}
                  onChangeText={setSparkAnswer}
                />
                <TouchableOpacity
                  style={[styles.answerSubmitBtn, !sparkAnswer.trim() && { opacity: 0.5 }]}
                  disabled={!sparkAnswer.trim()}
                  onPress={() => {
                    setSparkAnswered(true);
                    Alert.alert('Spark Shared! 💕', "Your romantic answer has been saved.");
                  }}
                >
                  <Text style={styles.answerSubmitText}>Share</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Quick Nudges Bar */}
          <Text style={styles.sectionTitle}>Send Quick Romantic Spark</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nudgesList}
          >
            {QUICK_NUDGES.map((nudge, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.nudgePill}
                onPress={() => handleQuickNudge(nudge)}
              >
                <Text style={styles.nudgeEmoji}>{nudge.emoji}</Text>
                <Text style={styles.nudgeText}>{nudge.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Love Notes Stream */}
          <View style={styles.feedHeaderRow}>
            <Text style={styles.sectionTitle}>Exchanged Love Notes</Text>
            <Text style={styles.feedCount}>{messages.length} notes</Text>
          </View>

          <View style={styles.messagesContainer}>
            {messages.map((item) => {
              const isMe = item.sender === 'me' || item.sender === 'John' || item.sender === userName;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageWrapper,
                    isMe ? styles.messageWrapperMe : styles.messageWrapperPartner
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.bubbleMe : styles.bubblePartner
                    ]}
                  >
                    {item.tag && (
                      <View style={styles.tagBadge}>
                        <Text style={[styles.tagText, isMe ? styles.tagTextMe : styles.tagTextPartner]}>
                          {item.tag}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.messageBody, isMe ? styles.bodyMe : styles.bodyPartner]}>
                      {item.text}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timePartner]}>
                        {item.timestamp}
                      </Text>
                      {isMe && <CheckCheck size={13} color="#FFFFFF" opacity={0.8} />}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Message Input Footer */}
        <View style={styles.composerBar}>
          <TextInput
            style={styles.composerInput}
            placeholder={
              partnerState.state === 'connected' && partnerState.partnerName
                ? `Write a sweet note to ${partnerState.partnerName}...`
                : 'Write a sweet note to your partner...'
            }
            placeholderTextColor={THEME.colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PartnerConnectModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        partnerState={partnerState}
        onStateChange={loadPartnerAndUser}
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
    padding: 16,
    paddingBottom: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.rose,
    letterSpacing: 1.2
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    marginTop: 2
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: THEME.colors.rose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  partnerCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16
  },
  partnerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  partnerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FCE7ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.burgundy
  },
  heartTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232, 93, 117, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  heartTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  partnerStatus: {
    fontSize: 12,
    color: THEME.colors.muted,
    marginTop: 2
  },
  surpriseQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232, 93, 117, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  surpriseQuickText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  vitalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  vitalBox: {
    flex: 1,
    alignItems: 'center'
  },
  vitalNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.burgundy
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.muted,
    marginTop: 2
  },
  vitalDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(232, 93, 117, 0.2)'
  },
  sparkCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 93, 117, 0.25)'
  },
  sparkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  sparkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose,
    textTransform: 'uppercase'
  },
  sparkQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    lineHeight: 21,
    marginBottom: 12
  },
  cynthiaAnswerBox: {
    backgroundColor: '#FFF9F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.rose
  },
  cynthiaAnswerHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.rose,
    marginBottom: 3
  },
  cynthiaAnswerText: {
    fontSize: 13,
    color: THEME.colors.burgundySoft,
    lineHeight: 18,
    fontStyle: 'italic'
  },
  johnAnswerBox: {
    backgroundColor: 'rgba(232, 93, 117, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.burgundy
  },
  johnAnswerHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: 3
  },
  johnAnswerText: {
    fontSize: 13,
    color: THEME.colors.burgundy,
    lineHeight: 18
  },
  answerComposer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4
  },
  answerInput: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: THEME.colors.burgundy,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.2)'
  },
  answerSubmitBtn: {
    backgroundColor: THEME.colors.rose,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12
  },
  answerSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4
  },
  nudgesList: {
    gap: 8,
    paddingBottom: 14
  },
  nudgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.2)'
  },
  nudgeEmoji: {
    fontSize: 14
  },
  nudgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.burgundy
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 6
  },
  feedCount: {
    fontSize: 11,
    color: THEME.colors.muted,
    fontWeight: '600'
  },
  messagesContainer: {
    gap: 12
  },
  messageWrapper: {
    flexDirection: 'row',
    width: '100%'
  },
  messageWrapperMe: {
    justifyContent: 'flex-end'
  },
  messageWrapperPartner: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18
  },
  bubbleMe: {
    backgroundColor: THEME.colors.rose,
    borderBottomRightRadius: 4
  },
  bubblePartner: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.15)'
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  tagTextMe: {
    color: '#FFFFFF'
  },
  tagTextPartner: {
    color: THEME.colors.rose
  },
  messageBody: {
    fontSize: 14,
    lineHeight: 20
  },
  bodyMe: {
    color: '#FFFFFF'
  },
  bodyPartner: {
    color: THEME.colors.burgundy
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 6
  },
  timeText: {
    fontSize: 10
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.75)'
  },
  timePartner: {
    color: THEME.colors.muted
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 93, 117, 0.2)',
    gap: 10
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.burgundy,
    maxHeight: 90
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(232, 93, 117, 0.4)'
  }
});
