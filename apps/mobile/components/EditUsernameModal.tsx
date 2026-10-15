import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { THEME } from '../constants/theme';
import { authService } from '../services/authService';

interface EditUsernameModalProps {
  visible: boolean;
  currentUsername: string;
  onClose: () => void;
  onUsernameUpdated: (newUsername: string) => void;
}

export function EditUsernameModal({
  visible,
  currentUsername,
  onClose,
  onUsernameUpdated
}: EditUsernameModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setError('Please enter a username.');
      return;
    }

    if (clean === currentUsername.toLowerCase()) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateUsername(clean);
      if (res.success) {
        onUsernameUpdated(clean);
        onClose();
      } else {
        setError(res.error || 'Failed to update username.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit Username</Text>
          <Text style={styles.subtitle}>
            Your username is unique across LUVMEE. It can be changed at any time.
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Username"
            value={username}
            onChangeText={(text) => {
              setError(null);
              setUsername(text.replace(/[^a-zA-Z0-9_]/g, ''));
            }}
            placeholder="e.g. romantic_soul"
            autoCapitalize="none"
          />

          <Text style={styles.hint}>
            3–30 characters. Letters, numbers, and underscores only.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title={loading ? 'Saving...' : 'Save'}
              onPress={handleSave}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(37, 33, 42, 0.6)',
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
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    textAlign: 'center',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
    lineHeight: 18
  },
  hint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: THEME.spacing.lg
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: THEME.radius.sm,
    padding: 10,
    marginBottom: 12
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.3)'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.burgundy
  }
});
