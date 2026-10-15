import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/Button';
import { THEME } from '../../constants/theme';

// Ensure any in-app browser sessions complete cleanly
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const hasResolvedRef = useRef(false);

  const handleRedirectSuccess = async () => {
    if (hasResolvedRef.current) return;
    hasResolvedRef.current = true;
    const targetRoute = await authService.popAuthRedirect();
    if (targetRoute) {
      router.replace(targetRoute as any);
    } else {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let pollTimer: any = null;

    // 1. Actively listen for Supabase auth state change (catches background OAuth token exchange)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession && isMounted && !hasResolvedRef.current) {
        await handleRedirectSuccess();
      }
    });

    // 2. Listen to incoming deep linking events while the screen is open
    const linkSubscription = Linking.addEventListener('url', async (event) => {
      if (event.url && isMounted && !hasResolvedRef.current) {
        await processAuthUrl(event.url);
      }
    });

    async function processAuthUrl(url: string) {
      try {
        setProcessing(true);
        setError(null);
        const res = await authService.handleAuthUrl(url);
        if (res.success && isMounted) {
          await handleRedirectSuccess();
        } else if (isMounted && !hasResolvedRef.current) {
          // Do not fail immediately, allow session poll to double-check
        }
      } catch (err: any) {
        // Fallback
      }
    }

    async function initializeAuth() {
      // Step A: Check if session is already established
      const activeSession = await authService.getSession();
      if (activeSession && isMounted) {
        await handleRedirectSuccess();
        return;
      }

      // Step B: Inspect route parameters passed by Expo Router deep linking
      const combinedParams = { ...globalParams, ...localParams };

      if (combinedParams.error || combinedParams.error_description) {
        if (isMounted) {
          setProcessing(false);
          setError(
            (combinedParams.error_description as string) ||
            (combinedParams.error as string) ||
            'Authentication was cancelled or denied.'
          );
        }
        return;
      }

      if (combinedParams.code || combinedParams.token || combinedParams.access_token) {
        const paramResult = await authService.handleAuthParams(combinedParams);
        if (paramResult.success && isMounted) {
          await handleRedirectSuccess();
          return;
        }
      }

      // Step C: Check initial deep link URL from cold start
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const urlResult = await authService.handleAuthUrl(initialUrl);
          if (urlResult.success && isMounted) {
            await handleRedirectSuccess();
            return;
          }
        }
      } catch {
        // Non-blocking
      }

      // Step D: Graceful polling (wait up to 3 seconds for background OAuth / deep-link resolution)
      let attempts = 0;
      const maxAttempts = 8;
      const pollInterval = 400; // 400ms * 8 = 3.2 seconds max

      const checkSessionLoop = async () => {
        if (!isMounted || hasResolvedRef.current) return;
        const s = await authService.getSession();
        if (s && isMounted) {
          await handleRedirectSuccess();
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          pollTimer = setTimeout(checkSessionLoop, pollInterval);
        } else {
          // Timeout reached with no session or credentials detected
          if (isMounted && !hasResolvedRef.current) {
            setProcessing(false);
            setError('No authentication link detected. Please try signing in again.');
          }
        }
      };

      pollTimer = setTimeout(checkSessionLoop, pollInterval);
    }

    initializeAuth();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
      authListener?.subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

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
