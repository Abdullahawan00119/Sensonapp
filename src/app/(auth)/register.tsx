import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

import AlertBanner from '../../components/ui/AlertBanner';
import GradientButton from '../../components/ui/GradientButton';
import InputField from '../../components/ui/InputField';
import { COLORS } from '../../lib/constants/colors';
import { useAuth } from '../../lib/hooks/useAuth';
import * as SafeHaptics from '../../lib/utils/haptics';

const { width, height } = Dimensions.get('window');

const ROLES = ['Owner', 'General Manager', 'Front Desk', 'Engineer', 'Security'] as const;
type RoleType = typeof ROLES[number];

const REGIONS = ['North America', 'Europe', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'];

export default function Register() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [role, setRole] = useState<RoleType>('General Manager');
  const [region, setRegion] = useState('Europe');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regionModalVisible, setRegionModalVisible] = useState(false);

  const getPasswordStrength = (pass: string): 0 | 1 | 2 | 3 | 4 => {
    if (!pass) return 0;
    if (pass.length < 6) return 1;
    let score = 1;
    const hasNumbers = /\d/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    if (pass.length >= 8 && hasNumbers) score = 2;
    if (pass.length >= 10 && hasNumbers && hasUpper) score = 3;
    if (pass.length >= 12 && hasNumbers && hasUpper && hasSpecial) score = 4;
    return score as 0 | 1 | 2 | 3 | 4;
  };

  const passwordStrength = getPasswordStrength(password);
  const isEmailValid = email.includes('@') && email.length > 5;
  const isConfirmMatch = password.length > 0 && confirmPassword === password;

  const validateField = (field: string, value: string) => {
    const nextErrors = { ...errors };
    switch (field) {
      case 'firstName':
        if (!value) nextErrors.firstName = 'First name is required';
        else delete nextErrors.firstName;
        break;
      case 'lastName':
        if (!value) nextErrors.lastName = 'Last name is required';
        else delete nextErrors.lastName;
        break;
      case 'email':
        if (!value) nextErrors.email = 'Email is required';
        else if (!value.includes('@')) nextErrors.email = 'Invalid email format';
        else delete nextErrors.email;
        break;
      case 'propertyName':
        if (!value) nextErrors.propertyName = 'Property/Estate name is required';
        else delete nextErrors.propertyName;
        break;
      case 'password':
        if (!value) nextErrors.password = 'Password is required';
        else if (value.length < 6) nextErrors.password = 'Password too short';
        else delete nextErrors.password;
        break;
      case 'confirmPassword':
        if (value !== password) nextErrors.confirmPassword = 'Passwords do not match';
        else delete nextErrors.confirmPassword;
        break;
    }
    setErrors(nextErrors);
  };

  const handleRegister = async () => {
    clearError();
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!email.includes('@')) newErrors.email = 'Invalid email';
    if (!propertyName) newErrors.propertyName = 'Property name is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.terms = 'You must agree to the Terms of Service';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      SafeHaptics.notification(SafeHaptics.Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await register({ email, firstName, lastName, role, propertyName, region });
      SafeHaptics.notification();
      router.replace('/(tabs)');
    } catch (e) {
      SafeHaptics.notification(SafeHaptics.Haptics.NotificationFeedbackType.Error);
    }
  };

  const openWebLink = async (url: string) => {
    SafeHaptics.impact();
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-void"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Back Button */}
        <Pressable
          onPress={() => {
            SafeHaptics.impact();
            router.back();
          }}
          className="flex-row items-center mt-12 mb-6"
          hitSlop={15}
        >
          <Ionicons name="chevron-back" size={16} color={COLORS.accentSoft} />
          <Text className="text-accent-soft font-body text-xs ml-1">Back to login</Text>
        </Pressable>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-text-primary text-xl font-brand-bold uppercase tracking-wider">
            Create account
          </Text>
          <Text className="text-text-secondary text-xs font-body mt-1">
            Register your property or staff account
          </Text>
        </View>

        {error ? <AlertBanner type="error" message={error} className="mb-4" /> : null}

        <View className="mb-10">
          {/* Name Row */}
          <View className="flex-row gap-3 w-full mb-1">
            <View className="flex-1">
              <InputField
                label="First Name"
                placeholder="Alex"
                value={firstName}
                onChangeText={setFirstName}
                onBlur={() => validateField('firstName', firstName)}
                error={errors.firstName}
                autoCorrect={false}
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Last Name"
                placeholder="Vanderbilt"
                value={lastName}
                onChangeText={setLastName}
                onBlur={() => validateField('lastName', lastName)}
                error={errors.lastName}
                autoCorrect={false}
              />
            </View>
          </View>

          <InputField
            label="Work Email"
            placeholder="alex@grandpalace.com"
            leftIcon="mail-outline"
            rightIcon={isEmailValid ? 'checkmark-circle' : undefined}
            value={email}
            onChangeText={setEmail}
            onBlur={() => validateField('email', email)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <InputField
            label="Property / Estate Name"
            placeholder="Grand Palace Hotel"
            leftIcon="business-outline"
            value={propertyName}
            onChangeText={setPropertyName}
            onBlur={() => validateField('propertyName', propertyName)}
            error={errors.propertyName}
            autoCorrect={false}
          />

          {/* Role selector */}
          <View className="mb-4">
            <Text className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase mb-2 font-brand-semibold">
              Select Staff Role
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
              {ROLES.map((r) => {
                const isSelected = role === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      SafeHaptics.impact();
                      setRole(r);
                    }}
                    className={`px-4 py-2 rounded-full border mr-2 ${
                      isSelected
                        ? 'bg-accent-indigo/20 border-accent-soft/60'
                        : 'bg-bg-glass border-white/10'
                    }`}
                  >
                    <Text className={`text-xs font-body-medium ${isSelected ? 'text-accent-soft' : 'text-text-secondary'}`}>
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Region selector */}
          <Pressable
            onPress={() => {
              SafeHaptics.impact();
              setRegionModalVisible(true);
            }}
            className="mb-4"
          >
            <Text className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase mb-1.5 font-brand-semibold">
              Region / Location
            </Text>
            <View className="flex-row items-center justify-between bg-bg-glass border border-white/10 rounded-xl px-4 py-3">
              <View className="flex-row items-center">
                <Ionicons name="globe-outline" size={16} color={COLORS.textMuted} />
                <Text className="text-text-primary font-body text-sm ml-2">{region}</Text>
              </View>
              <Ionicons name="chevron-down-outline" size={16} color={COLORS.textMuted} />
            </View>
          </Pressable>

          <InputField
            label="Create Password"
            placeholder="••••••••"
            leftIcon="lock-closed-outline"
            isPassword={true}
            value={password}
            onChangeText={setPassword}
            onBlur={() => validateField('password', password)}
            error={errors.password}
            strength={passwordStrength}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <InputField
            label="Confirm Password"
            placeholder="••••••••"
            leftIcon="lock-closed-outline"
            rightIcon={isConfirmMatch ? 'checkmark-circle' : undefined}
            isPassword={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => validateField('confirmPassword', confirmPassword)}
            error={errors.confirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Terms Checkbox */}
          <Pressable
            onPress={() => {
              SafeHaptics.impact();
              setAgreeTerms(!agreeTerms);
              if (errors.terms) {
                const next = { ...errors };
                delete next.terms;
                setErrors(next);
              }
            }}
            className="flex-row items-start mt-4 mb-6"
            accessible={true}
            accessibilityLabel="Agree to terms of service and privacy policy"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreeTerms }}
          >
            <View
              className={`w-4 h-4 rounded border mt-0.5 mr-3 items-center justify-center ${
                agreeTerms
                  ? 'bg-accent-indigo/20 border-accent-soft'
                  : 'border-white/20 bg-bg-glass'
              }`}
            >
              {agreeTerms ? (
                <Ionicons name="checkmark" size={10} color={COLORS.accentSoft} />
              ) : null}
            </View>
            <View className="flex-1">
              {/* Split into separate Text nodes to avoid whitespace text node errors on web */}
              <Text className="text-[11px] text-text-secondary font-body leading-4">
                <Text>{'I agree to the '}</Text>
                <Text
                  onPress={() => openWebLink('https://example.com/terms')}
                  className="text-accent-soft underline"
                >
                  Terms of Service
                </Text>
                <Text>{' and '}</Text>
                <Text
                  onPress={() => openWebLink('https://example.com/privacy')}
                  className="text-accent-soft underline"
                >
                  Privacy Policy
                </Text>
              </Text>
              {errors.terms ? (
                <Text className="text-[10px] text-status-crit font-body mt-1">{errors.terms}</Text>
              ) : null}
            </View>
          </Pressable>

          <GradientButton text="CREATE ACCOUNT" onPress={handleRegister} isLoading={isLoading} />

          <View className="flex-row justify-center mt-6">
            <Text className="text-text-secondary font-body text-xs">{'Already registered? '}</Text>
            <Pressable
              onPress={() => {
                SafeHaptics.impact();
                router.replace('/(auth)/login');
              }}
              hitSlop={15}
            >
              <Text className="text-accent-soft font-body-medium text-xs">Sign in →</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Region Modal */}
      <Modal
        visible={regionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRegionModalVisible(false)}
      >
        <Pressable
          onPress={() => setRegionModalVisible(false)}
          className="flex-1 bg-black/60 justify-center items-center px-6"
        >
          <View className="bg-bg-elevated border border-white/10 rounded-2xl w-full max-h-[300px] overflow-hidden">
            <View className="border-b border-white/05 px-5 py-4">
              <Text className="text-text-primary font-brand-semibold text-sm">
                Select Property Region
              </Text>
            </View>
            <FlatList
              data={REGIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    SafeHaptics.impact();
                    setRegion(item);
                    setRegionModalVisible(false);
                  }}
                  className="px-5 py-3.5 border-b border-white/05 flex-row justify-between items-center"
                >
                  <Text className="text-text-secondary font-body text-xs">{item}</Text>
                  {region === item ? (
                    <Ionicons name="checkmark" size={14} color={COLORS.accentSoft} />
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
