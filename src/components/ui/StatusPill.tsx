import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

interface StatusPillProps {
  label: string;
  type: 'ok' | 'warn' | 'crit';
  pulse?: boolean;
}

const dotColorMap = {
  ok: 'bg-status-ok',
  warn: 'bg-status-warn',
  crit: 'bg-status-crit',
};

export default function StatusPill({ label, type, pulse = false }: StatusPillProps) {
  const dotScale = useSharedValue(1);

  useEffect(() => {
    if (pulse || type === 'crit') {
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 600 }),
          withTiming(0.8, { duration: 600 })
        ),
        -1, // Infinite
        true // Reverse
      );
    } else {
      dotScale.value = 1;
    }
  }, [pulse, type]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View className="flex-row items-center bg-bg-glass border border-white/08 rounded-full px-3.5 py-1.5 mr-2">
      <Animated.View 
        style={[animatedDotStyle]}
        className={`w-2 h-2 rounded-full mr-2 ${dotColorMap[type]}`} 
      />
      <Text className="text-text-primary text-xs font-body font-medium">
        {label}
      </Text>
    </View>
  );
}
