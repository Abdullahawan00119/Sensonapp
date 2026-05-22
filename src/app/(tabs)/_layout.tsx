import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { COLORS } from '../../lib/constants/colors';

const TabIcon = ({ name, color, focused }: { name: any; color: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', paddingTop: 4 }}>
    {focused && (
      <View style={{
        position: 'absolute', top: -5,
        width: 48, height: 2.5, borderRadius: 2,
        backgroundColor: COLORS.accentIndigo,
      }} />
    )}
    <Ionicons name={name} size={22} color={color} />
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accentSoft,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarHideOnKeyboard: true,
        // Prevents aria-hidden focus conflict on web by unmounting inactive screens
        lazy: true,
        tabBarStyle: {
          backgroundColor: COLORS.bgVoid,
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          elevation: 0,
          // Remove default web box-shadow
          ...(Platform.OS === 'web' ? { boxShadow: 'none' } : {}),
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 10,
          marginTop: -2,
        },
        // On web, use display:none for inactive screens instead of aria-hidden
        ...(Platform.OS === 'web' ? {
          sceneStyle: { backgroundColor: COLORS.bgDeep },
        } : {}),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="zones"
        options={{
          title: 'Zones',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'layers' : 'layers-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="zones/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
