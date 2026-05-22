import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { ActivityItem as ActivityItemType } from '../../lib/api/activity';
import { COLORS } from '../../lib/constants/colors';

interface ActivityItemProps {
  item: ActivityItemType;
  isLast?: boolean;
}

const typeMap = {
  alert: {
    bg: 'bg-status-crit/15',
    text: 'text-status-crit',
    border: 'border-status-crit/30',
    label: 'ALERT',
    iconColor: COLORS.statusCrit,
    bubbleBg: 'bg-status-crit/10',
  },
  ok: {
    bg: 'bg-status-ok/12',
    text: 'text-status-ok',
    border: 'border-status-ok/25',
    label: 'OK',
    iconColor: COLORS.statusOk,
    bubbleBg: 'bg-status-ok/10',
  },
  info: {
    bg: 'bg-accent-indigo/12',
    text: 'text-accent-soft',
    border: 'border-accent-soft/25',
    label: 'INFO',
    iconColor: COLORS.accentSoft,
    bubbleBg: 'bg-accent-indigo/10',
  },
};

export default function ActivityItem({ item, isLast = false }: ActivityItemProps) {
  const currentTheme = typeMap[item.type] || typeMap.info;

  return (
    <View 
      className={`flex-row items-center justify-between py-4 px-4 ${
        !isLast ? 'border-b border-white/05' : ''
      }`}
    >
      {/* Icon bubble */}
      <View className="flex-row items-center flex-1 mr-3">
        <View 
          className={`w-7 h-7 rounded-lg items-center justify-center mr-3 ${currentTheme.bubbleBg}`}
        >
          <Ionicons
            name={item.icon as any}
            size={14}
            color={currentTheme.iconColor}
          />
        </View>

        {/* Message and Time */}
        <View className="flex-1">
          <Text className="text-text-primary text-xs font-body leading-4">
            {item.title}
          </Text>
          <Text className="text-text-secondary text-[10px] font-body mt-1">
            {item.time}
          </Text>
        </View>
      </View>

      {/* Tiny Badge */}
      <View 
        className={`px-2 py-0.5 rounded-full border ${currentTheme.bg} ${currentTheme.border}`}
      >
        <Text className={`text-[8px] font-brand-bold uppercase tracking-wider ${currentTheme.text}`}>
          {currentTheme.label}
        </Text>
      </View>
    </View>
  );
}
