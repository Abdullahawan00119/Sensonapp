import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { COLORS } from '../../lib/constants/colors';

interface InputFieldProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'] | string;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'] | string;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  strength?: 0 | 1 | 2 | 3 | 4; // for password strength (0: none, 1: weak, 2: fair, 3: strong, 4: very strong)
}

export default function InputField({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  strength,
  secureTextEntry,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword && !showPassword;

  // Input styling
  const focusBorder = isFocused ? 'border-accent-soft/50' : 'border-white/10';
  const errorBorder = error ? 'border-status-crit/50' : focusBorder;

  // Strength Bar configurations
  const getStrengthConfig = (s: number) => {
    switch (s) {
      case 1:
        return { label: 'Weak', color: 'bg-status-crit', activeCount: 1 };
      case 2:
        return { label: 'Fair', color: 'bg-status-warn', activeCount: 2 };
      case 3:
        return { label: 'Strong', color: 'bg-status-info', activeCount: 3 };
      case 4:
        return { label: 'Very Strong', color: 'bg-status-ok', activeCount: 4 };
      default:
        return { label: '', color: 'bg-white/05', activeCount: 0 };
    }
  };

  const strengthConfig = strength !== undefined ? getStrengthConfig(strength) : null;

  return (
    <View className="mb-3 w-full">
      {label && (
        <Text className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase mb-1.5 font-brand-semibold">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center bg-bg-glass border rounded-xl px-4 py-3 ${errorBorder}`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={16}
            color={error ? COLORS.statusCrit : COLORS.textMuted}
            className="mr-2"
          />
        )}

        <TextInput
          className="flex-1 ml-1 font-body text-sm text-text-primary"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={COLORS.textMuted}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            accessibilityRole="button"
          >
            <Ionicons
              name={rightIcon as any}
              size={16}
              color={COLORS.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Strength indicator bar */}
      {strengthConfig && strengthConfig.activeCount > 0 && (
        <View className="mt-2 px-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-[10px] text-text-secondary font-body">Password Strength</Text>
            <Text className="text-[10px] text-text-primary font-brand-semibold">{strengthConfig.label}</Text>
          </View>
          <View className="flex-row gap-1 h-1">
            {[1, 2, 3, 4].map((index) => (
              <View
                key={index}
                className={`flex-1 rounded-full ${
                  index <= strengthConfig.activeCount
                    ? strengthConfig.color
                    : 'bg-white/05'
                }`}
              />
            ))}
          </View>
        </View>
      )}

      {error && (
        <Text className="text-[11px] text-status-crit font-body mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
