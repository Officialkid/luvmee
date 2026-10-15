import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { authService } from '../../services/authService';
import Svg, { Path } from 'react-native-svg';

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </Svg>
  );
}

type AuthScreenState =
  | 'selection'        // Initial choice: Continue with Google OR Continue with email
  | 'email_login'      // Email + Password login
  | 'email_signup'     // Email + Password + Confirm + Username registration
  | 'signup_otp'       // 6-digit OTP verification for email signup
  | 'forgot_password'; // Password recovery request

export default function SignInScreen() {
  const router = useRouter();

  // Mode state
  const [screenState, setScreenState] = useState<AuthScreenState>('selection');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otpToken, setOtpToken] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Resend Countdown
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePostAuthSuccess = async () => {
    const targetRoute = await authService.popAuthRedirect();
    if (targetRoute) {
      router.replace(targetRoute as any);
    } else {
      router.replace('/(tabs)');
    }
  };

  // ==========================================
  // GOOGLE OAUTH
  // ==========================================
  const handleGoogleSignIn = async () => {
    resetMessages();
    setGoogleLoading(true);
    try {
      const res = await authService.signInWithGoogle();
      if (res.success) {
        await handlePostAuthSuccess();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ==========================================
  // EMAIL & PASSWORD LOGIN
  // ==========================================
  const handleEmailLogin = async () => {
    resetMessages();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signInWithEmailPassword({ email, password });
      if (res.success) {
        await handlePostAuthSuccess();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EMAIL & PASSWORD SIGNUP
  // ==========================================
  const handleEmailSignUp = async () => {
    resetMessages();
    if (!email || !password || !confirmPassword || !username) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signUpWithEmailPassword({
        email,
        password,
        confirmPassword,
        username
      });

      if (res.success) {
        if (res.session) {
          await handlePostAuthSuccess();
        } else {
          setSuccessMessage(res.message || 'Verification code sent to your email.');
          setScreenState('signup_otp');
          setResendCooldown(60);
        }
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OTP VERIFICATION
  // ==========================================
  const handleVerifyOtp = async () => {
    resetMessages();
    if (!otpToken || otpToken.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifySignupOtp(email, otpToken);
      if (res.success) {
        await handlePostAuthSuccess();
      } else {
        setErrorMessage(res.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    resetMessages();
    setLoading(true);
    try {
      const res = await authService.resendSignupOtp(email);
      if (res.success) {
        setSuccessMessage('A fresh 6-digit verification code has been sent!');
        setResendCooldown(60);
      } else {
        setErrorMessage(res.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================
  const handleForgotPassword = async () => {
    resetMessages();
    if (!email) {
      setErrorMessage('Please enter your email address to receive a reset link.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(email);
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset instructions have been sent.');
      } else {
        setErrorMessage(res.error || 'Failed to send reset email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header & Logo */}
          <View style={styles.header}>
            <Logo variant="horizontal" width={180} height={52} />
            <Text style={styles.headline}>Make every moment count.</Text>
            <Text style={styles.subtitle}>
              Remember the people who matter, celebrate their moments, and make them smile.
            </Text>
          </View>

          {/* Feedback Banners */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color="#E85D75" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={18} color="#059669" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 1: AUTHENTICATION SELECTION (Google vs Email)           */}
          {/* ============================================================ */}
          {screenState === 'selection' && (
            <Card style={styles.card}>
              <Text style={styles.selectionPrompt}>Choose how you'd like to continue</Text>

              {/* 1. Continue with Google */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={THEME.colors.burgundy} />
                ) : (
                  <>
                    <GoogleIcon size={19} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 2. Continue with Email */}
              <TouchableOpacity
                style={styles.emailOptionButton}
                onPress={() => {
                  resetMessages();
                  setScreenState('email_login');
                }}
                activeOpacity={0.8}
              >
                <Mail size={18} color={THEME.colors.rose} style={{ marginRight: 10 }} />
                <Text style={styles.emailOptionButtonText}>Continue with Email</Text>
              </TouchableOpacity>

              <View style={styles.guestNoticeBox}>
                <Text style={styles.guestNoticeText}>
                  Guest browsing is always available. An account lets you save people, receive reminders, and connect with your partner.
                </Text>
              </View>
            </Card>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: EMAIL & PASSWORD LOGIN                               */}
          {/* ============================================================ */}
          {screenState === 'email_login' && (
            <Card style={styles.card}>
              <View style={styles.cardNavRow}>
                <TouchableOpacity
                  onPress={() => {
                    resetMessages();
                    setScreenState('selection');
                  }}
                  style={styles.backBtn}
                >
                  <ArrowLeft size={18} color={THEME.colors.burgundy} />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.formTitle}>Log In</Text>
              </View>

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowPassword(v => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showPassword
                        ? <EyeOff size={18} color={THEME.colors.textMuted} />
                        : <Eye size={18} color={THEME.colors.textMuted} />
                      }
                    </TouchableOpacity>
                  }
                />
                <TouchableOpacity
                  style={styles.forgotPasswordLink}
                  onPress={() => {
                    resetMessages();
                    setScreenState('forgot_password');
                  }}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title={loading ? 'Logging in...' : 'Log In'}
                onPress={handleEmailLogin}
                loading={loading}
                style={{ marginTop: 20 }}
              />

              <View style={styles.switchModeRow}>
                <Text style={styles.switchModePrompt}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    resetMessages();
                    setScreenState('email_signup');
                  }}
                >
                  <Text style={styles.switchModeAction}>Create one</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: EMAIL & PASSWORD SIGNUP (With Username)              */}
          {/* ============================================================ */}
          {screenState === 'email_signup' && (
            <Card style={styles.card}>
              <View style={styles.cardNavRow}>
                <TouchableOpacity
                  onPress={() => {
                    resetMessages();
                    setScreenState('selection');
                  }}
                  style={styles.backBtn}
                >
                  <ArrowLeft size={18} color={THEME.colors.burgundy} />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.formTitle}>Create Account</Text>
              </View>

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Choose a Username"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. romantic_soul"
                  autoCapitalize="none"
                />
                <Text style={styles.inputHelperText}>
                  3–30 characters. Letters, numbers, and underscores only.
                </Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowPassword(v => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showPassword
                        ? <EyeOff size={18} color={THEME.colors.textMuted} />
                        : <Eye size={18} color={THEME.colors.textMuted} />
                      }
                    </TouchableOpacity>
                  }
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(v => !v)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showConfirmPassword
                        ? <EyeOff size={18} color={THEME.colors.textMuted} />
                        : <Eye size={18} color={THEME.colors.textMuted} />
                      }
                    </TouchableOpacity>
                  }
                />
              </View>

              <Button
                title={loading ? 'Creating Account...' : 'Continue'}
                onPress={handleEmailSignUp}
                loading={loading}
                style={{ marginTop: 20 }}
              />

              <View style={styles.switchModeRow}>
                <Text style={styles.switchModePrompt}>Already have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    resetMessages();
                    setScreenState('email_login');
                  }}
                >
                  <Text style={styles.switchModeAction}>Log in</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: 6-DIGIT EMAIL VERIFICATION OTP                       */}
          {/* ============================================================ */}
          {screenState === 'signup_otp' && (
            <Card style={styles.card}>
              <View style={styles.cardNavRow}>
                <TouchableOpacity
                  onPress={() => {
                    resetMessages();
                    setScreenState('email_signup');
                  }}
                  style={styles.backBtn}
                >
                  <ArrowLeft size={18} color={THEME.colors.burgundy} />
                  <Text style={styles.backBtnText}>Edit Details</Text>
                </TouchableOpacity>
                <Text style={styles.formTitle}>Verify Email</Text>
              </View>

              <Text style={styles.otpInstructions}>
                Enter the 6-digit verification code sent to <Text style={{ fontWeight: '700' }}>{email}</Text>.
              </Text>

              <Input
                label="6-Digit Verification Code"
                value={otpToken}
                onChangeText={(val) => setOtpToken(val.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.otpInput}
              />

              <Button
                title={loading ? 'Verifying...' : 'Verify & Continue'}
                onPress={handleVerifyOtp}
                loading={loading}
                style={{ marginTop: 20 }}
              />

              <View style={styles.resendRow}>
                {resendCooldown > 0 ? (
                  <Text style={styles.resendCooldownText}>
                    Resend code in {resendCooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                    <Text style={styles.resendActionText}>Resend 6-Digit Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )}

          {/* ============================================================ */}
          {/* VIEW 5: FORGOT PASSWORD                                      */}
          {/* ============================================================ */}
          {screenState === 'forgot_password' && (
            <Card style={styles.card}>
              <View style={styles.cardNavRow}>
                <TouchableOpacity
                  onPress={() => {
                    resetMessages();
                    setScreenState('email_login');
                  }}
                  style={styles.backBtn}
                >
                  <ArrowLeft size={18} color={THEME.colors.burgundy} />
                  <Text style={styles.backBtnText}>Back to Login</Text>
                </TouchableOpacity>
                <Text style={styles.formTitle}>Reset Password</Text>
              </View>

              <Text style={styles.otpInstructions}>
                Enter your registered email address and we'll send you instructions to reset your password.
              </Text>

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Button
                title={loading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleForgotPassword}
                loading={loading}
                style={{ marginTop: 20 }}
              />
            </Card>
          )}

          {/* Guest Exploration Option */}
          <TouchableOpacity
            style={styles.guestLink}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.guestLinkText}>Explore LUVMEE as Guest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: THEME.colors.blush
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
    paddingBottom: 48
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.burgundy,
    letterSpacing: 2,
    marginTop: 8
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.burgundy,
    marginTop: 6,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12
  },
  card: {
    padding: THEME.spacing.lg,
    borderRadius: THEME.radius.lg
  },
  cardNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.burgundy,
    marginLeft: 4
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.burgundy
  },
  selectionPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.burgundy,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
    marginRight: 10
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#25212A'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(232, 93, 117, 0.15)'
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emailOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 93, 117, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.25)',
    paddingVertical: 14,
    borderRadius: THEME.radius.md
  },
  emailOptionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.rose
  },
  guestNoticeBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: THEME.radius.sm,
    backgroundColor: 'rgba(252, 231, 237, 0.5)'
  },
  guestNoticeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16
  },
  inputHelperText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginLeft: 2
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 6
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.rose
  },
  switchModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 6
  },
  switchModePrompt: {
    fontSize: 13,
    color: THEME.colors.textMuted
  },
  switchModeAction: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  otpInstructions: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginBottom: 16,
    lineHeight: 18
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: '700'
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 16
  },
  resendCooldownText: {
    fontSize: 12,
    color: THEME.colors.textMuted
  },
  resendActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.rose
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    padding: 12,
    borderRadius: THEME.radius.md,
    marginBottom: 14
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    padding: 12,
    borderRadius: THEME.radius.md,
    marginBottom: 14
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 8
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.muted
  }
});
