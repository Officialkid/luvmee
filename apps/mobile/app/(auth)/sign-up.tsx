import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { supabase } from '../../services/supabase';

export default function SignUpScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and choose a password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: displayName.trim() || 'Romantic Creator'
          }
        }
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert(
          'Account Created! 💖',
          'Your account is ready. Welcome to LUVMEE!',
          [
            {
              text: 'Start Creating',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandContainer}>
          <View style={styles.sparkleCircle}>
            <Sparkles size={32} color={THEME.colors.rose} />
          </View>
          <Text style={styles.title}>Join LUVMEE</Text>
          <Text style={styles.subtitle}>
            Create unforgettable digital romantic moments with custom links.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Your Name or Nickname"
            placeholder="e.g. Daniel"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Choose Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={{ marginTop: 8 }}>
            <Button
              title="Create My Account"
              onPress={handleSignUp}
              loading={loading}
            />
          </View>
        </Card>

        {/* Switch to Sign In */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}> Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Mode */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.guestText}>Continue as Guest (Offline/Local)</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  sparkleCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    textAlign: 'center',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  footerText: {
    fontSize: 13,
    color: THEME.colors.muted
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  guestText: {
    fontSize: 13,
    color: THEME.colors.muted,
    textDecorationLine: 'underline'
  }
});
