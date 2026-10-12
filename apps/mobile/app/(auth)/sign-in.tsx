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
import { Heart, Lock, Mail } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { supabase } from '../../services/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
      } else if (data.session) {
        Alert.alert('Welcome back! 💖', 'Signed in successfully.');
        router.replace('/(tabs)');
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
          <Logo variant="stacked" width={160} height={125} style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Welcome back to LUVMEE</Text>
          <Text style={styles.subtitle}>
            Sign in to access and manage your romantic surprises across devices.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={{ marginTop: 8 }}>
            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
            />
          </View>
        </Card>

        {/* Switch to Sign Up */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account yet?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.footerLink}> Create one</Text>
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
  heartCircle: {
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
