import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../../lib/constants/colors';
import * as SafeHaptics from '../../lib/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientButtonProps {
  text: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  styleClass?: string;
  colors?: [string, string];
}

export default function GradientButton({
  text,
  onPress,
  isLoading = false,
  disabled = false,
  styleClass = '',
  colors = [COLORS.accentIndigo, COLORS.accentViolet],
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled || isLoading) return;
    SafeHaptics.impact(SafeHaptics.Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[animatedStyle]}
      className={`w-full rounded-xl overflow-hidden ${styleClass}`}
      accessible={true}
      accessibilityLabel={text}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-3.5 px-4 items-center justify-center flex-row"
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-white font-brand-bold text-base tracking-widest text-center uppercase">
            {text}
          </Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}
