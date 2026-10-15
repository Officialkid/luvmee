import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Send,
  Sparkles,
  Phone,
  Gift,
  Check,
  CheckCheck,
  Clock,
  MessageCircleHeart,
  Info,
  Lock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Heart
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar, Badge, EmptyState } from '../../components/UIPrimitives';
import { PartnerState, LoveNote as SharedLoveNote } from '@luvmee/shared';
import { partnerService } from '../../services/partnerService';
import { loveNotesService } from '../../services/loveNotesService';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabase';
import { PartnerConnectModal } from '../../components/PartnerConnectModal';
import { AuthGateModal } from '../../components/AuthGateModal';

interface ChatMessage {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: string;
  rawDate: string;
  tag?: string;
  readAt?: string | null;
  status?: 'sending' | 'sent' | 'error';
}

const QUICK_NUDGES = [
  { emoji: '💋', text: 'Sending a sweet kiss' },
  { emoji: '☕', text: 'Coffee date tonight?' },
  { emoji: '🌹', text: 'Thinking of you right now' },
  { emoji: '💌', text: 'You are my favorite person' }
];

const ROMANTIC_TAGS = [
  { id: 'appreciation', label: 'Appreciation ✨' },
  { id: 'sweet_nothings', label: 'Sweet Nothings 💖' },
  { id: 'memory', label: 'Memory 📸' },
  { id: 'encouragement', label: 'Encouragement 🌟' }
];

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showNudges, setShowNudges] = useState(true);
  const [showVitals, setShowVitals] = useState(false);

  const [partnerState, setPartnerState] = useState<PartnerState>({
    state: 'not_connected',
    myPartnerCode: null
  });
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [partnerPhone, setPartnerPhone] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Me');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [authGateVisible, setAuthGateVisible] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!currentUserId) {
      setAuthGateVisible(true);
      return;
    }
    action();
  };

  useEffect(() => {
    loadPartnerAndUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPartnerAndUser();
    }, [])
  );

  // Realtime subscription for live partner messages
  useEffect(() => {
    if (partnerState.state === 'connected' && partnerState.partnershipId && currentUserId) {
      const unsubscribe = loveNotesService.subscribeToNotes(
        partnerState.partnershipId,
        (incoming: SharedLoveNote) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            const isMe = incoming.senderId === currentUserId;
            const newBubble: ChatMessage = {
              id: incoming.id,
              sender: isMe ? 'me' : 'partner',
              text: incoming.content,
              timestamp: formatMessageTime(incoming.createdAt),
              rawDate: incoming.createdAt,
              tag: incoming.tag || undefined,
              readAt: incoming.readAt || null,
              status: 'sent'
            };
            return [...prev, newBubble];
          });

          // Mark incoming partner message as read
          if (incoming.senderId !== currentUserId) {
            loveNotesService.markRead().catch(() => {});
          }
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [partnerState.partnershipId, partnerState.state, currentUserId]);

  const formatMessageTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Now';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Now';
    }
  };

  const loadPartnerAndUser = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const name = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Me';
        setUserName(name);
      } else {
        setCurrentUserId(null);
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const state = await partnerService.getPartnerState();
      setPartnerState(state);

      const stored = await AsyncStorage.getItem('@luvmee_partner_info');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.phone) setPartnerPhone(parsed.phone);
        } catch {}
      }

      // If connected, fetch messages
      if (state.state === 'connected') {
        const res = await loveNotesService.getLoveNotes();
        if (res.notes) {
          // get_love_notes returns newest-first (DESC); reverse for chronological chat flow (oldest to newest)
          const chronological = res.notes.slice().reverse();
          const mapped: ChatMessage[] = chronological.map((n) => ({
            id: n.id,
            sender: n.senderId === session.user.id ? 'me' : 'partner',
            text: n.content,
            timestamp: formatMessageTime(n.createdAt),
            rawDate: n.createdAt,
            tag: n.tag || undefined,
            readAt: n.readAt || null,
            status: 'sent'
          }));
          setMessages(mapped);
          await loveNotesService.markRead();
        }
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.warn('[LUVMEE Messages] Error loading conversation:', err);
      setFetchError(err?.message || 'Could not load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    if (!currentUserId) {
      setAuthGateVisible(true);
      return;
    }

    if (partnerState.state !== 'connected') {
      Alert.alert(
        'Connect With Your Partner 💕',
        'To send private messages, connect with your partner first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Now', onPress: () => requireAuth(() => setConnectModalVisible(true)) }
        ]
      );
      return;
    }

    const tagToSend = selectedTag || undefined;
    setIsSending(true);

    // Optimistic message bubble
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      sender: 'me',
      text: trimmed,
      timestamp: formatMessageTime(new Date().toISOString()),
      rawDate: new Date().toISOString(),
      tag: tagToSend,
      status: 'sending'
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');
    setSelectedTag(null);
    setShowTagPicker(false);

    try {
      const res = await loveNotesService.sendLoveNote({
        content: trimmed,
        tag: tagToSend
      });

      if (!res.success) {
        Alert.alert('Message Failed', res.error || 'Could not deliver message. Please retry.');
        // Reconcile failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (res.note) {
        // Reconcile optimistic ID with confirmed server ID
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: res.note!.id,
                  status: 'sent',
                  readAt: res.note!.readAt || null
                }
              : m
          )
        );
      }
    } catch (sendErr: any) {
      Alert.alert('Delivery Error', sendErr?.message || 'Network error sending note.');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
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
        'Add your partner\'s phone number in settings to enable 1-tap phone calls.'
      );
    }
  };

  // Render individual message bubble
  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender === 'me';

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowPartner
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.bubbleMe : styles.bubblePartner
          ]}
        >
          {item.tag ? (
            <View style={[styles.tagBadge, isMe ? styles.tagBadgeMe : styles.tagBadgePartner]}>
              <Text style={[styles.tagText, isMe ? styles.tagTextMe : styles.tagTextPartner]}>
                {item.tag}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.messageText, isMe ? styles.textMe : styles.textPartner]}>
            {item.text}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timePartner]}>
              {item.timestamp}
            </Text>

            {isMe && (
              <View style={styles.statusIndicator}>
                {item.status === 'sending' ? (
                  <Clock size={11} color="rgba(255, 255, 255, 0.7)" />
                ) : item.readAt ? (
                  <CheckCheck size={13} color="rgba(255, 255, 255, 0.95)" />
                ) : (
                  <Check size={13} color="rgba(255, 255, 255, 0.75)" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Render empty conversation state
  const renderEmptyConversation = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="small" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      );
    }

    if (fetchError) {
      return (
        <View style={styles.centeredContainer}>
          <EmptyState
            title="Connection Issue"
            description={fetchError}
            actionLabel="Try Again"
            onAction={loadPartnerAndUser}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyConversationContainer}>
        <View style={styles.emptyIconCircle}>
          <MessageCircleHeart size={36} color={THEME.colors.primary} />
        </View>
        <Text style={styles.emptyConversationTitle}>Start Your Conversation</Text>
        <Text style={styles.emptyConversationSubtitle}>
          Send your first sweet message to {partnerState.partnerName || 'your partner'} 💕
        </Text>

        <View style={styles.starterChipsContainer}>
          {QUICK_NUDGES.slice(0, 3).map((nudge, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              style={styles.starterChip}
              onPress={() => handleQuickNudge(nudge)}
            >
              <Text style={styles.starterChipEmoji}>{nudge.emoji}</Text>
              <Text style={styles.starterChipText}>{nudge.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Unpartnered / Guest View
  const renderUnpartneredView = () => {
    const isGuest = !currentUserId;

    return (
      <View style={styles.unpartneredContainer}>
        {isGuest ? (
          <Card variant="highlight" style={styles.unpartneredCard}>
            <View style={styles.unpartneredIconBox}>
              <Lock size={32} color={THEME.colors.primary} />
            </View>
            <Text style={styles.unpartneredTitle}>Private Partner Messages</Text>
            <Text style={styles.unpartneredBody}>
              LUVMEE messages are end-to-end private between you and your romantic partner. Sign in to pair your partner code and start chatting.
            </Text>
            <Button
              title="Sign In with Email"
              style={{ marginTop: 16 }}
              onPress={async () => {
                await authService.setAuthRedirect('/(tabs)/messages');
                router.push('/(auth)/sign-in');
              }}
            />
          </Card>
        ) : (
          <Card variant="surface" style={styles.unpartneredCard}>
            <View style={styles.unpartneredIconBox}>
              <Heart size={36} color={THEME.colors.primary} fill="rgba(232, 93, 117, 0.15)" />
            </View>
            <Text style={styles.unpartneredTitle}>
              {partnerState.state === 'incoming_pending'
                ? 'Partner Request Received'
                : partnerState.state === 'outgoing_pending'
                ? 'Waiting for Partner'
                : 'Connect With Your Partner'}
            </Text>
            <Text style={styles.unpartneredBody}>
              {partnerState.state === 'incoming_pending'
                ? `${partnerState.partnerName || 'Someone'} sent you a partnership invite. Accept to open your private chat.`
                : partnerState.state === 'outgoing_pending'
                ? `Invitation sent to ${partnerState.partnerName || 'partner'}. Once accepted, your private messages will activate automatically.`
                : 'LUVMEE provides a dedicated, private space for you and your partner. Exchange your secret code to start.'}
            </Text>

            {partnerState.myPartnerCode && (
              <View style={styles.partnerCodePill}>
                <Text style={styles.partnerCodeLabel}>Your Partner Code</Text>
                <Text style={styles.partnerCodeValue}>{partnerState.myPartnerCode}</Text>
              </View>
            )}

            <Button
              title={
                partnerState.state === 'incoming_pending'
                  ? 'Review & Accept'
                  : partnerState.state === 'outgoing_pending'
                  ? 'View Invite Status'
                  : 'Connect Partner'
              }
              style={{ marginTop: 16 }}
              onPress={() => requireAuth(() => setConnectModalVisible(true))}
            />
          </Card>
        )}
      </View>
    );
  };

  const isConnected = partnerState.state === 'connected';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Sleek Conversation Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => requireAuth(() => setConnectModalVisible(true))}
            style={styles.headerPartnerBtn}
          >
            <Avatar
              name={partnerState.partnerName || 'Partner'}
              size={38}
              backgroundColor={THEME.colors.surfaceHighlight}
              textColor={THEME.colors.textHeading}
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.headerPartnerName} numberOfLines={1}>
                  {isConnected ? partnerState.partnerName : 'Messages'}
                </Text>
                {isConnected && (
                  <Badge label="Partner" variant="primary" size="sm" style={{ marginLeft: 6 }} />
                )}
              </View>
              <View style={styles.privacyRow}>
                <Lock size={10} color={THEME.colors.textMuted} />
                <Text style={styles.headerPrivacyLabel}>Private 1-to-1 Conversation</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Header Right Actions */}
        <View style={styles.headerActions}>
          {isConnected && (
            <>
              <TouchableOpacity
                style={styles.headerActionBtn}
                activeOpacity={0.8}
                onPress={handleCallPartner}
                accessibilityLabel="Call Partner"
              >
                <Phone size={16} color={THEME.colors.textHeading} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerActionBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/templates')}
                accessibilityLabel="Send Surprise"
              >
                <Gift size={16} color={THEME.colors.primary} />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.8}
            onPress={() => requireAuth(() => setConnectModalVisible(true))}
            accessibilityLabel="Partner Information"
          >
            <Info size={16} color={THEME.colors.textHeading} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Optional Collapsible Vitals Bar */}
      {isConnected && (
        <View style={styles.vitalsBar}>
          <TouchableOpacity
            style={styles.vitalsToggle}
            activeOpacity={0.8}
            onPress={() => setShowVitals(!showVitals)}
          >
            <Text style={styles.vitalsSummaryText}>
              💕 {partnerState.daysInLove !== undefined ? `${partnerState.daysInLove} days in love` : 'Connected'} • {messages.length} notes exchanged
            </Text>
            {showVitals ? (
              <ChevronUp size={14} color={THEME.colors.textMuted} />
            ) : (
              <ChevronDown size={14} color={THEME.colors.textMuted} />
            )}
          </TouchableOpacity>

          {showVitals && (
            <View style={styles.vitalsDetailsRow}>
              <View style={styles.vitalMetric}>
                <Text style={styles.vitalMetricValue}>
                  {partnerState.daysInLove !== undefined ? partnerState.daysInLove : '—'}
                </Text>
                <Text style={styles.vitalMetricLabel}>Days in Love</Text>
              </View>
              <View style={styles.vitalMetricDivider} />
              <View style={styles.vitalMetric}>
                <Text style={styles.vitalMetricValue}>{messages.length}</Text>
                <Text style={styles.vitalMetricLabel}>Notes Sent</Text>
              </View>
              <View style={styles.vitalMetricDivider} />
              <TouchableOpacity
                style={styles.vitalMetric}
                onPress={() => router.push('/(tabs)/templates')}
              >
                <Gift size={16} color={THEME.colors.primary} />
                <Text style={[styles.vitalMetricLabel, { color: THEME.colors.primary }]}>Surprise</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 3. Main Chat Stream or Unpartnered View */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {!isConnected ? (
          renderUnpartneredView()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={[
              styles.messagesListContent,
              messages.length === 0 && { flex: 1 }
            ]}
            ListEmptyComponent={renderEmptyConversation}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 4. Composer and Quick Sparks (Only for Connected Users) */}
        {isConnected && (
          <View style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {/* Quick Nudges Bar */}
            {showNudges && (
              <View style={styles.nudgesContainer}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={QUICK_NUDGES}
                  keyExtractor={(_, i) => i.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.nudgePill}
                      onPress={() => handleQuickNudge(item)}
                    >
                      <Text style={styles.nudgeEmoji}>{item.emoji}</Text>
                      <Text style={styles.nudgeText}>{item.text}</Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.nudgesContent}
                />
              </View>
            )}

            {/* Optional Romantic Tag Picker */}
            {showTagPicker && (
              <View style={styles.tagsContainer}>
                {ROMANTIC_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    activeOpacity={0.8}
                    style={[
                      styles.tagChip,
                      selectedTag === tag.label && styles.tagChipActive
                    ]}
                    onPress={() =>
                      setSelectedTag(selectedTag === tag.label ? null : tag.label)
                    }
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        selectedTag === tag.label && styles.tagChipTextActive
                      ]}
                    >
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Selected Tag Indicator */}
            {selectedTag && !showTagPicker && (
              <View style={styles.activeTagBar}>
                <Text style={styles.activeTagLabel}>Tag: {selectedTag}</Text>
                <TouchableOpacity onPress={() => setSelectedTag(null)}>
                  <Text style={styles.activeTagRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Composer Input Bar */}
            <View style={styles.inputBar}>
              <TouchableOpacity
                style={[styles.sparkleBtn, showTagPicker && styles.sparkleBtnActive]}
                activeOpacity={0.8}
                onPress={() => setShowTagPicker(!showTagPicker)}
                accessibilityLabel="Choose Note Tag"
              >
                <Sparkles size={18} color={showTagPicker ? THEME.colors.primary : THEME.colors.textMuted} />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder={`Write a sweet note to ${partnerState.partnerName || 'partner'}...`}
                placeholderTextColor={THEME.colors.textMutedSubtle}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={2000}
                accessible
                accessibilityLabel="Message input"
              />

              {inputText.length > 1800 && (
                <Text style={styles.charCount}>{2000 - inputText.length}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isSending) && styles.sendButtonDisabled
                ]}
                activeOpacity={0.85}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isSending}
                accessibilityLabel="Send Message"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Partner Connection Modal */}
      <PartnerConnectModal
        visible={connectModalVisible}
        onClose={() => setConnectModalVisible(false)}
        partnerState={partnerState}
        onStateChange={loadPartnerAndUser}
      />

      {/* Auth Gate Modal */}
      <AuthGateModal
        visible={authGateVisible}
        onClose={() => setAuthGateVisible(false)}
        title="Sign in for Messages"
        description="Connect with your partner and exchange private encrypted love notes in real time."
        targetRoute="/(tabs)/messages"
        actionName="Sign In with Email"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    ...THEME.shadows.subtle
  },
  headerLeft: {
    flex: 1
  },
  headerPartnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerPartnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: -0.2
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  headerPrivacyLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '500'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },

  // Vitals Bar
  vitalsBar: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  vitalsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  vitalsSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  vitalsDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border
  },
  vitalMetric: {
    alignItems: 'center'
  },
  vitalMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  vitalMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  vitalMetricDivider: {
    width: 1,
    height: 18,
    backgroundColor: THEME.colors.border
  },

  // Messages List
  messagesListContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row'
  },
  messageRowMe: {
    justifyContent: 'flex-end'
  },
  messageRowPartner: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16
  },
  bubbleMe: {
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 3
  },
  bubblePartner: {
    backgroundColor: THEME.colors.surface,
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  tagBadgeMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  },
  tagBadgePartner: {
    backgroundColor: THEME.colors.surfaceHighlight
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700'
  },
  tagTextMe: {
    color: '#FFFFFF'
  },
  tagTextPartner: {
    color: THEME.colors.primary
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  textMe: {
    color: '#FFFFFF'
  },
  textPartner: {
    color: THEME.colors.textHeading
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  timeText: {
    fontSize: 10
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.75)'
  },
  timePartner: {
    color: THEME.colors.textMuted
  },
  statusIndicator: {
    marginLeft: 2
  },

  // Empty / Centered States
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: THEME.colors.textMuted
  },
  emptyConversationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyConversationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    marginBottom: 6,
    textAlign: 'center'
  },
  emptyConversationSubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  starterChipsContainer: {
    width: '100%',
    gap: 8,
    alignItems: 'center'
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
    ...THEME.shadows.subtle
  },
  starterChipEmoji: {
    fontSize: 14
  },
  starterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },

  // Unpartnered States
  unpartneredContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  unpartneredCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: THEME.radius.xl
  },
  unpartneredIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  unpartneredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    textAlign: 'center',
    marginBottom: 8
  },
  unpartneredBody: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 19
  },
  partnerCodePill: {
    marginTop: 16,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  partnerCodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  partnerCodeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1.5,
    marginTop: 2
  },

  // Composer
  composerContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8
  },
  nudgesContainer: {
    paddingBottom: 8
  },
  nudgesContent: {
    paddingHorizontal: 12,
    gap: 8
  },
  nudgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  nudgeEmoji: {
    fontSize: 13
  },
  nudgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  tagChipActive: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.primary
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  tagChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700'
  },
  activeTagBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6
  },
  activeTagLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary
  },
  activeTagRemove: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    paddingHorizontal: 4
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8
  },
  sparkleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.background
  },
  sparkleBtnActive: {
    backgroundColor: THEME.colors.surfaceHighlight
  },
  textInput: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    maxHeight: 100,
    minHeight: 38
  },
  charCount: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600'
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle
  },
  sendButtonDisabled: {
    opacity: 0.35
  }
});
