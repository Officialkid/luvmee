import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  X,
  Share2,
  Check,
  Clock,
  UserPlus,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { Button } from './Button';
import { Card } from './Card';
import { PartnerState } from '@luvmee/shared';
import { partnerService } from '../services/partnerService';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';

interface PartnerConnectModalProps {
  visible: boolean;
  onClose: () => void;
  partnerState: PartnerState;
  onStateChange: () => void;
}

export function PartnerConnectModal({
  visible,
  onClose,
  partnerState,
  onStateChange
}: PartnerConnectModalProps) {
  const router = useRouter();
  const [targetInput, setTargetInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleShareCode = async () => {
    if (!partnerState.myPartnerCode) return;
    const webBaseUrl = process.env.EXPO_PUBLIC_RECIPIENT_BASE_URL || 'https://luvmee.vercel.app';
    try {
      await Share.share({
        message: `Connect with me on LUVMEE! 💕\n\nMy Partner Code is: ${partnerState.myPartnerCode}\n\nDownload the app and connect with me here:\n${webBaseUrl}?code=${partnerState.myPartnerCode}`
      });
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    } catch {
      // Ignored
    }
  };

  const handleSendInvite = async () => {
    if (!targetInput.trim()) {
      Alert.alert('Required', 'Please enter your partner’s code or email.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in or register to connect with a partner on LUVMEE.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: async () => {
              await authService.setAuthRedirect('/(tabs)');
              onClose();
              router.push('/(auth)/sign-in');
            }
          }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await partnerService.sendInvitation(targetInput);
      if (res.success) {
        Alert.alert(
          'Invitation Sent! 💕',
          `Your connection request has been sent to ${res.partnerName || 'your partner'}.`
        );
        setTargetInput('');
        onStateChange();
      } else {
        Alert.alert('Could Not Send', res.error || 'Failed to send partner request.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!partnerState.invitationId) return;
    setIsLoading(true);
    try {
      const res = await partnerService.respondToInvitation(partnerState.invitationId, 'accept');
      if (res.success) {
        Alert.alert('Connected! 💕', 'You and your partner are now linked on LUVMEE!');
        onStateChange();
      } else {
        Alert.alert('Error', res.error || 'Failed to accept invitation.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to accept invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!partnerState.invitationId) return;
    Alert.alert(
      'Decline Invitation',
      'Are you sure you want to decline this partner connection request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const res = await partnerService.respondToInvitation(partnerState.invitationId!, 'decline');
              if (res.success) {
                Alert.alert('Declined', 'Partner invitation has been declined.');
                onStateChange();
              } else {
                Alert.alert('Error', res.error || 'Failed to decline.');
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to decline.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelInvite = async () => {
    if (!partnerState.invitationId) return;
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel your pending invitation?',
      [
        { text: 'Keep Waiting', style: 'cancel' },
        {
          text: 'Cancel Invite',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const res = await partnerService.cancelInvitation(partnerState.invitationId!);
              if (res.success) {
                Alert.alert('Cancelled', 'Your invitation was cancelled.');
                onStateChange();
              } else {
                Alert.alert('Error', res.error || 'Failed to cancel.');
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Partner',
      `Are you sure you want to disconnect from ${partnerState.partnerName || 'your partner'}? You will no longer share romantic sparks or couple vital milestones.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const res = await partnerService.disconnectPartner();
              if (res.success) {
                Alert.alert('Disconnected', 'You are now unpartnered.');
                onStateChange();
              } else {
                Alert.alert('Error', res.error || 'Failed to disconnect.');
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to disconnect.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Heart size={20} color={THEME.colors.rose} fill={THEME.colors.rose} />
              <Text style={styles.sheetTitle}>Partner Connection</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.burgundy} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* 1. CONNECTED STATE */}
            {partnerState.state === 'connected' && (
              <View style={styles.stateContainer}>
                <View style={styles.avatarBubble}>
                  <Text style={{ fontSize: 36 }}>👸🏽</Text>
                </View>
                <Text style={styles.connectedTitle}>Connected with {partnerState.partnerName} 💕</Text>
                <Text style={styles.connectedSubtitle}>
                  {partnerState.daysInLove ? `${partnerState.daysInLove} days in love` : 'Love notes and romantic sparks linked'}
                </Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Partner Code:</Text>
                  <Text style={styles.infoValue}>{partnerState.partnerCode || 'Linked'}</Text>
                </View>

                <View style={{ marginTop: 20, width: '100%', gap: 10 }}>
                  <Button
                    title="Open Love Notes"
                    onPress={() => {
                      onClose();
                      router.push('/(tabs)/messages');
                    }}
                  />
                  <TouchableOpacity
                    style={styles.destructiveBtn}
                    onPress={handleDisconnect}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={THEME.colors.rose} />
                    ) : (
                      <Text style={styles.destructiveText}>Disconnect Partner</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 2. INCOMING PENDING STATE */}
            {partnerState.state === 'incoming_pending' && (
              <View style={styles.stateContainer}>
                <View style={[styles.avatarBubble, { backgroundColor: 'rgba(232, 93, 117, 0.15)' }]}>
                  <Sparkles size={36} color={THEME.colors.rose} />
                </View>
                <Text style={styles.connectedTitle}>Connection Request Received! 💌</Text>
                <Text style={styles.connectedSubtitle}>
                  <Text style={{ fontWeight: '700', color: THEME.colors.burgundy }}>
                    {partnerState.partnerName || 'A creator'}
                  </Text>{' '}
                  wants to connect as your partner on LUVMEE.
                </Text>

                <View style={{ marginTop: 24, width: '100%', gap: 12 }}>
                  <Button
                    title="Accept Connection 💕"
                    onPress={handleAcceptInvite}
                    disabled={isLoading}
                  />
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={handleDeclineInvite}
                    disabled={isLoading}
                  >
                    <Text style={styles.secondaryBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. OUTGOING PENDING STATE */}
            {partnerState.state === 'outgoing_pending' && (
              <View style={styles.stateContainer}>
                <View style={[styles.avatarBubble, { backgroundColor: 'rgba(217, 131, 36, 0.15)' }]}>
                  <Clock size={36} color="#D98324" />
                </View>
                <Text style={styles.connectedTitle}>Invitation Pending ⏳</Text>
                <Text style={styles.connectedSubtitle}>
                  You sent a partner invite to{' '}
                  <Text style={{ fontWeight: '700', color: THEME.colors.burgundy }}>
                    {partnerState.partnerName || 'your partner'}
                  </Text>
                  . Waiting for them to accept.
                </Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text style={[styles.infoValue, { color: '#D98324' }]}>Pending Approval</Text>
                </View>

                <View style={{ marginTop: 24, width: '100%' }}>
                  <TouchableOpacity
                    style={styles.destructiveBtn}
                    onPress={handleCancelInvite}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={THEME.colors.rose} />
                    ) : (
                      <Text style={styles.destructiveText}>Cancel Invitation</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 4. NOT CONNECTED STATE */}
            {partnerState.state === 'not_connected' && (
              <View>
                {/* User's Own Partner Code */}
                <Card style={styles.myCodeCard}>
                  <Text style={styles.myCodeLabel}>YOUR PARTNER CODE</Text>
                  <Text style={styles.myCodeValue}>
                    {partnerState.myPartnerCode || 'LUV-PAIR'}
                  </Text>
                  <Text style={styles.myCodeHint}>
                    Share this code with your partner so they can connect with you.
                  </Text>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={handleShareCode}
                    activeOpacity={0.8}
                  >
                    <Share2 size={16} color="#FFFFFF" />
                    <Text style={styles.shareBtnText}>
                      {copiedNotice ? 'Shared! 💕' : 'Share My Code'}
                    </Text>
                  </TouchableOpacity>
                </Card>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR ENTER PARTNER'S CODE</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Input Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Partner Code or Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. LUV-8K92 or partner@email.com"
                    placeholderTextColor={THEME.colors.muted}
                    value={targetInput}
                    onChangeText={setTargetInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.inputHint}>
                    Your partner can find their 6-character code in their Profile or Partner screen.
                  </Text>
                </View>

                <View style={{ marginTop: 16 }}>
                  <Button
                    title="Send Connection Request 💕"
                    onPress={handleSendInvite}
                    disabled={isLoading || !targetInput.trim()}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 16
  },
  avatarBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.blush,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  connectedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    textAlign: 'center',
    marginBottom: 6
  },
  connectedSubtitle: {
    fontSize: 14,
    color: THEME.colors.muted,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.ivory,
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.15)'
  },
  infoLabel: {
    fontSize: 13,
    color: THEME.colors.muted,
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  myCodeCard: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(232, 93, 117, 0.06)',
    borderColor: 'rgba(232, 93, 117, 0.2)',
    marginBottom: 16
  },
  myCodeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.rose,
    letterSpacing: 1,
    marginBottom: 6
  },
  myCodeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    letterSpacing: 2,
    marginBottom: 6
  },
  myCodeHint: {
    fontSize: 12,
    color: THEME.colors.muted,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.rose,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBE0E3'
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.muted,
    marginHorizontal: 10,
    letterSpacing: 0.5
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.burgundy,
    marginBottom: 6
  },
  textInput: {
    backgroundColor: '#F8F4F5',
    borderWidth: 1,
    borderColor: '#E8DEE1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.burgundy
  },
  inputHint: {
    fontSize: 11,
    color: THEME.colors.muted,
    marginTop: 4
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F4ECEF'
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.burgundy
  },
  destructiveBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.4)'
  },
  destructiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.rose
  }
});
