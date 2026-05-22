import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Polygon } from 'react-native-svg';

import AlertBanner from '../../components/ui/AlertBanner';
import GradientButton from '../../components/ui/GradientButton';
import InputField from '../../components/ui/InputField';
import { COLORS } from '../../lib/constants/colors';
import { useAuth } from '../../lib/hooks/useAuth';
import * as SafeHaptics from '../../lib/utils/haptics';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [emailErr, setEmailErr]       = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-7, { duration: 55 }), withTiming(7, { duration: 55 }),
      withTiming(-7, { duration: 55 }), withTiming(7, { duration: 55 }),
      withTiming(-3, { duration: 55 }), withTiming(0, { duration: 55 }),
    );
    SafeHaptics.notification(SafeHaptics.Haptics.NotificationFeedbackType.Error);
  };

  const handleLogin = async () => {
    setEmailErr(''); setPasswordErr(''); clearError();
    let ok = true;
    if (!email)              { setEmailErr('Email is required'); ok = false; }
    else if (!email.includes('@')) { setEmailErr('Enter a valid email'); ok = false; }
    if (!password)           { setPasswordErr('Password is required'); ok = false; }
    else if (password.length < 6) { setPasswordErr('Minimum 6 characters'); ok = false; }
    if (!ok) { shake(); return; }
    try {
      await login({ email, password });
      SafeHaptics.notification();
      router.replace('/(tabs)');
    } catch { shake(); }
  };

  const fillDemo = () => { SafeHaptics.impact(); setEmail('admin@property.com'); setPassword('admin123'); };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: COLORS.bgVoid }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>

          {/* logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Svg height="44" width="44" viewBox="0 0 100 100">
              <Polygon points="90,50 70,84.64 30,84.64 10,50 30,15.36 70,15.36" fill="none" stroke={COLORS.accentSoft} strokeWidth="3" />
              <Circle cx="50" cy="50" r="15" fill={COLORS.accentIndigo} />
              <Circle cx="50" cy="50" r="7" fill="#fff" />
            </Svg>
            <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontFamily: 'Outfit_700Bold', letterSpacing: 5, marginTop: 12 }}>
              AURASENSE
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 4, letterSpacing: 1 }}>
              Environment Control
            </Text>
          </View>

          {/* form */}
          <Animated.View style={[shakeStyle, { backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20 }]}>
            <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontFamily: 'Outfit_700Bold', marginBottom: 4 }}>
              Sign in
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', marginBottom: 20 }}>
              Access your property dashboard
            </Text>

            {error ? <AlertBanner type="error" message={error} className="mb-4" /> : null}

            <InputField label="Email" placeholder="work@property.com" leftIcon="mail-outline" value={email} onChangeText={setEmail} error={emailErr} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <InputField label="Password" placeholder="••••••••" leftIcon="lock-closed-outline" isPassword value={password} onChangeText={setPassword} error={passwordErr} autoCapitalize="none" autoCorrect={false} />

            <Pressable onPress={fillDemo} style={{ alignSelf: 'flex-end', marginBottom: 20, marginTop: 4 }} hitSlop={12}>
              <Text style={{ color: COLORS.accentSoft, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>Forgot password?</Text>
            </Pressable>

            <GradientButton text="SIGN IN" onPress={handleLogin} isLoading={isLoading} />

            {/* divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular', marginHorizontal: 12, letterSpacing: 1, textTransform: 'uppercase' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </View>

            {/* social */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { icon: 'logo-google' as const, label: 'Google' },
                { icon: 'logo-apple' as const,  label: 'Apple' },
              ].map(({ icon, label }) => (
                <Pressable
                  key={label}
                  onPress={fillDemo}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 12 }}
                  accessible accessibilityLabel={`Sign in with ${label}`} accessibilityRole="button"
                >
                  <Ionicons name={icon} size={14} color={COLORS.textPrimary} />
                  <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>No account?</Text>
            <Pressable onPress={() => { SafeHaptics.impact(); router.push('/(auth)/register'); }} hitSlop={12}>
              <Text style={{ color: COLORS.accentSoft, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>Create one →</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
