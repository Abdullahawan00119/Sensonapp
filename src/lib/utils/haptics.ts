import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

export const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light): void => {
  if (!isNative) return;
  Haptics.impactAsync(style);
};

export const notification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success): void => {
  if (!isNative) return;
  Haptics.notificationAsync(type);
};

// Re-export enums for convenience so callers don't need to import expo-haptics directly
export { Haptics };
