import React from 'react';
import { View, Text } from 'react-native';

interface AvatarCircleProps {
  initials: string;
  size?: number;
  bg?: string;
  textClass?: string;
}

export default function AvatarCircle({
  initials,
  size = 36,
  bg = 'bg-accent-indigo/30',
  textClass = 'text-text-primary text-xs font-brand-bold',
}: AvatarCircleProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center border border-white/10 ${bg}`}
    >
      <Text className={textClass}>
        {initials.toUpperCase()}
      </Text>
    </View>
  );
}
