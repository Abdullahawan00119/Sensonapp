import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants/colors';

interface AlertBannerProps {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  className?: string;
}

const themeMap = {
  error: {
    bg: 'bg-status-crit/10',
    border: 'border-status-crit/30',
    text: 'text-status-crit',
    icon: 'alert-circle-outline',
    iconColor: COLORS.statusCrit,
  },
  warning: {
    bg: 'bg-status-warn/10',
    border: 'border-status-warn/30',
    text: 'text-status-warn',
    icon: 'warning-outline',
    iconColor: COLORS.statusWarn,
  },
  info: {
    bg: 'bg-status-info/10',
    border: 'border-status-info/30',
    text: 'text-status-info',
    icon: 'information-circle-outline',
    iconColor: COLORS.statusInfo,
  },
  success: {
    bg: 'bg-status-ok/10',
    border: 'border-status-ok/30',
    text: 'text-status-ok',
    icon: 'checkmark-circle-outline',
    iconColor: COLORS.statusOk,
  },
};

export default function AlertBanner({ type, message, className = '' }: AlertBannerProps) {
  const currentTheme = themeMap[type];

  return (
    <View
      className={`flex-row items-center border rounded-xl p-3 ${currentTheme.bg} ${currentTheme.border} ${className}`}
    >
      <Ionicons
        name={currentTheme.icon as any}
        size={18}
        color={currentTheme.iconColor}
        className="mr-3"
      />
      <Text className={`flex-1 font-body text-xs leading-4 ${currentTheme.text}`}>
        {message}
      </Text>
    </View>
  );
}
