import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { Button } from './Button';
import { authService } from '../services/authService';

export interface AuthGateModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  targetRoute?: string;
  actionName?: string;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  visible,
  onClose,
  title = 'Sign in to continue',
  description = 'Save your important dates, private love notes, and personalized surprises securely across all your devices.',
  targetRoute = '/(tabs)',
  actionName = 'Unlock Full Access'
}) => {
  const router = useRouter();

  const handleSignIn = async () => {
    if (targetRoute) {
      await authService.setAuthRedirect(targetRoute);
    }
    onClose();
    router.push('/(auth)/sign-in');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.iconCircle}>
                <Heart size={28} color={THEME.colors.primary} fill={THEME.colors.primary} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>

              <View style={styles.perksList}>
                <View style={styles.perkItem}>
                  <Sparkles size={16} color={THEME.colors.primary} />
                  <Text style={styles.perkText}>Passwordless login via 6-digit email code</Text>
                </View>
                <View style={styles.perkItem}>
                  <ShieldCheck size={16} color={THEME.colors.primary} />
                  <Text style={styles.perkText}>Encrypted, private relationship space</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title={actionName}
                  onPress={handleSignIn}
                />
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelText}>Continue browsing as guest</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 4,
    zIndex: 10
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.blush,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    textAlign: 'center',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 8
  },
  perksList: {
    width: '100%',
    backgroundColor: '#FAF6F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    gap: 8
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  perkText: {
    fontSize: 13,
    color: THEME.colors.burgundy,
    fontWeight: '500'
  },
  buttonContainer: {
    width: '100%',
    gap: 10
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10
  },
  cancelText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    fontWeight: '500'
  }
});
