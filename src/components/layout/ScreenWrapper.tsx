import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
  withSafeArea?: boolean;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenWrapper({
  children,
  bg = 'bg-deep',
  withSafeArea = true,
  scrollable = false,
  refreshing = false,
  onRefresh,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const topPad = withSafeArea ? insets.top : 0;
  const botPad = withSafeArea ? insets.bottom : 0;

  const inner = scrollable ? (
    <ScrollView
      style={{ flex: 1, paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 + botPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818CF8" />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: botPad }}>
      {children}
    </View>
  );

  return (
    <View
      className={`flex-1 ${bg}`}
      style={{ flex: 1, paddingTop: topPad }}
    >
      <StatusBar style="light" />
      {inner}
    </View>
  );
}
