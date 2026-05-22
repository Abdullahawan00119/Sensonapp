import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as SafeHaptics from '../../lib/utils/haptics';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({
  title,
  actionText,
  onActionPress,
}: SectionHeaderProps) {
  const handlePress = () => {
    if (onActionPress) {
      SafeHaptics.impact();
      onActionPress();
    }
  };

  return (
    <View className="flex-row items-center justify-between mt-6 mb-3 px-1">
      <Text className="text-text-primary text-base font-brand-semibold">
        {title}
      </Text>
      {actionText && onActionPress && (
        <Pressable 
          onPress={handlePress} 
          hitSlop={15}
          accessible={true}
          accessibilityLabel={actionText}
          accessibilityRole="button"
        >
          <Text className="text-accent-soft text-sm font-body font-medium">
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
