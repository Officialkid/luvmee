import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { authService } from '../../services/authService';
import { Button } from '../../components/Button';
import { THEME } from '../../constants/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function processInitialUrl() {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && isMounted) {
          await completeAuth(initialUrl);
        } else {
          // Check if session already exists
          const session = await authService.getSession();
          if (session && isMounted) {
            await handleRedirectSuccess();
          } else if (isMounted) {
            setProcessing(false);
            setError('No authentication link detected. Please try signing in again.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setProcessing(false);
          setError(err?.message || 'Failed to process authentication link.');
        }
      }
    }

    // Also listen to incoming linking events while open
    const subscription = Linking.addEventListener('url', async (event) => {
      if (event.url && isMounted) {
        await completeAuth(event.url);
      }
    });

    processInitialUrl();

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const completeAuth = async (url: string) => {
    setProcessing(true);
    setError(null);
    const result = await authService.handleAuthUrl(url);
    if (result.success) {
      await handleRedirectSuccess();
    } else {
      setProcessing(false);
      setError(result.error || 'Authentication link was invalid or expired.');
    }
  };

  const handleRedirectSuccess = async () => {
    const targetRoute = await authService.popAuthRedirect();
    if (targetRoute) {
      router.replace(targetRoute as any);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {processing ? (
          <>
            <ActivityIndicator size="large" color={THEME.colors.rose} />
            <Text style={styles.title}>Signing you in...</Text>
            <Text style={styles.subtitle}>Verifying your secure link and preparing your LUVMEE account.</Text>
          </>
        ) : error ? (
          <>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Authentication Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button
              title="Return to Sign In"
              onPress={() => router.replace('/(auth)/sign-in')}
              style={styles.button}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>Authenticated!</Text>
            <Text style={styles.subtitle}>Taking you to LUVMEE...</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.blush,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg
  },
  card: {
    backgroundColor: THEME.colors.cardBg,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginTop: THEME.spacing.md,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.sm,
    textAlign: 'center',
    lineHeight: 20
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: THEME.spacing.sm
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginBottom: THEME.spacing.xs,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: THEME.colors.rose,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
    lineHeight: 20
  },
  button: {
    width: '100%'
  }
});
