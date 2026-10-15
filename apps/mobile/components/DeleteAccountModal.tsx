import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import { Button } from './Button';
import { THEME } from '../constants/theme';
import { authService } from '../services/authService';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteAccountModal({
  visible,
  onClose,
  onDeleted
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<'warn' | 'confirm'>('warn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartDelete = () => {
    setStep('confirm');
  };

  const handleFinalDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.deleteAccount();
      if (res.success) {
        onDeleted();
      } else {
        setError(res.error || 'Failed to delete account. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account.');
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('warn');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleResetAndClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={28} color="#DC2626" />
          </View>

          <Text style={styles.title}>Permanently delete your LUVMEE account?</Text>

          <Text style={styles.body}>
            Your account and associated personal data will be permanently deleted.
            This includes your profile, saved people and important dates, personal notes,
            plans, private surprises, and partner conversations.
          </Text>

          <Text style={styles.warningText}>
            This action cannot be undone.
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'warn' ? (
            <View style={styles.buttonStack}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleResetAndClose}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Keep my account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.destructiveButton}
                onPress={handleStartDelete}
                disabled={loading}
              >
                <Trash2 size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.destructiveText}>Continue to Deletion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonStack}>
              <TouchableOpacity
                style={styles.finalDeleteButton}
                onPress={handleFinalDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.finalDeleteText}>Yes, Permanently Delete Everything</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleResetAndClose}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel & Keep Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(37, 33, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg
  },
  card: {
    backgroundColor: THEME.colors.cardBg,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    alignItems: 'center'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.md
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: THEME.spacing.sm
  },
  body: {
    fontSize: 13,
    color: THEME.colors.burgundy,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: THEME.spacing.sm
  },
  warningText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: THEME.spacing.lg
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: THEME.radius.sm,
    padding: 10,
    marginBottom: 14,
    width: '100%'
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    textAlign: 'center'
  },
  buttonStack: {
    width: '100%',
    gap: 10
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  destructiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  destructiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626'
  },
  finalDeleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    backgroundColor: '#DC2626'
  },
  finalDeleteText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
