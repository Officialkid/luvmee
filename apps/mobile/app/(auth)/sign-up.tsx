import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import SignInScreen from './sign-in';

export default function SignUpScreen() {
  // LUVMEE uses passwordless Email OTP for both registration and sign-in.
  return <SignInScreen />;
}
