import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import ActivityItem from '../../components/ui/ActivityItem';
import AvatarCircle from '../../components/ui/AvatarCircle';
import SensorCard from '../../components/ui/SensorCard';
import { ActivityItem as ActivityItemType, mockActivityApi } from '../../lib/api/activity';
import { COLORS } from '../../lib/constants/colors';
import { useAuth } from '../../lib/hooks/useAuth';
import { useSensors } from '../../lib/hooks/useSensors';
import * as SafeHaptics from '../../lib/utils/haptics';

const S = {
  label: { color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1.5, textTransform: 'uppercase' as const },
  title: { color: COLORS.textPrimary,   fontSize: 15, fontFamily: 'Outfit_600SemiBold' },
  body:  { color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular' },
  link:  { color: COLORS.accentSoft,    fontSize: 12, fontFamily: 'DMSans_400Regular' },
};

export default function HomeDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { sensors, isLoading, refetch, isRefetching } = useSensors();
  const [activities, setActivities] = React.useState<ActivityItemType[]>([]);
  const [actLoading, setActLoading] = React.useState(false);

  const alertPulse = useSharedValue(1);
  React.useEffect(() => {
    alertPulse.value = withRepeat(
      withSequence(withTiming(1.01, { duration: 2200 }), withTiming(1, { duration: 2200 })),
      -1, true
    );
  }, []);
  const animAlert = useAnimatedStyle(() => ({ transform: [{ scale: alertPulse.value }] }));

  const fetchActivities = async () => {
    setActLoading(true);
    try { setActivities(await mockActivityApi.getActivity(4)); }
    catch (e) { console.log(e); }
    finally { setActLoading(false); }
  };

  React.useEffect(() => { fetchActivities(); }, []);

  const handleRefresh = async () => {
    SafeHaptics.impact(SafeHaptics.Haptics.ImpactFeedbackStyle.Medium);
    await Promise.all([refetch(), fetchActivities()]);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const propertyName = user?.propertyName || 'Grand Palace Residences';
  const initials     = user ? `${user.firstName[0]}${user.lastName[0]}` : 'AV';
  const alertCount   = sensors.filter(s => s.statusType === 'crit').length;
  const warnCount    = sensors.filter(s => s.statusType === 'warn').length;
  const okCount      = sensors.filter(s => s.statusType === 'ok').length;

  return (
    <ScreenWrapper withSafeArea bg="bg-deep">

      {/* ── Header ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, paddingBottom: 20 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[S.label, { marginBottom: 3 }]}>{greeting()}</Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Outfit_700Bold', lineHeight: 26 }} numberOfLines={1}>
            {propertyName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} />
            <Text style={S.body}>{user?.region || 'Europe'} · 24 Floors</Text>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.statusOk, marginLeft: 6 }} />
            <Text style={{ color: COLORS.statusOk, fontSize: 10, fontFamily: 'Outfit_500Medium' }}>Live</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={() => { SafeHaptics.impact(); router.push('/(tabs)/analytics'); }}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel="Notifications" accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={18} color={COLORS.textPrimary} />
            {alertCount > 0 && (
              <View style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.statusCrit, borderWidth: 1.5, borderColor: COLORS.bgDeep }} />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <AvatarCircle initials={initials} size={38} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isLoading || isRefetching || actLoading} onRefresh={handleRefresh} tintColor={COLORS.accentSoft} />}
      >

        {/* ── Overview strip ── */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[
            { n: 48,         label: 'Online',   color: COLORS.statusOk,   icon: 'wifi-outline' as const,             active: true },
            { n: okCount,    label: 'Normal',   color: COLORS.statusOk,   icon: 'checkmark-circle-outline' as const, active: okCount > 0 },
            { n: warnCount,  label: 'Warnings', color: COLORS.statusWarn, icon: 'warning-outline' as const,          active: warnCount > 0 },
            { n: alertCount, label: 'Alerts',   color: COLORS.statusCrit, icon: 'alert-circle-outline' as const,     active: alertCount > 0 },
          ].map(({ n, label, color, icon, active }) => (
            <View key={label} style={{
              flex: 1,
              backgroundColor: active ? `${color}10` : COLORS.bgSurface,
              borderWidth: 1,
              borderColor: active ? `${color}35` : 'rgba(255,255,255,0.07)',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
            }}>
              <Ionicons name={icon} size={15} color={active ? color : COLORS.textMuted} style={{ marginBottom: 6 }} />
              <Text style={{ color: active ? color : COLORS.textPrimary, fontSize: 18, fontFamily: 'Outfit_700Bold', lineHeight: 20 }}>{n}</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 9, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Alert banner ── */}
        {alertCount > 0 && (
          <Animated.View style={[animAlert, { marginBottom: 24 }]}>
            <Pressable
              onPress={() => {
                SafeHaptics.impact();
                const s = sensors.find(x => x.statusType === 'crit');
                if (s) router.push(`/(tabs)/zones/${s.id}`);
              }}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(239,68,68,0.06)',
                borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)',
                borderRadius: 16, padding: 14,
              }}
              accessibilityRole="button" accessibilityLabel="View critical alert"
            >
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(239,68,68,0.14)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="alert-circle" size={18} color={COLORS.statusCrit} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.statusCrit, fontSize: 9, fontFamily: 'Outfit_600SemiBold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
                  Critical Alert
                </Text>
                <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontFamily: 'Outfit_600SemiBold' }}>
                  CO₂ Spike — Suite 2204
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>
                  1,842 ppm detected · safe limit 1,000 ppm
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={COLORS.textSecondary} />
            </Pressable>
          </Animated.View>
        )}

        {/* ── Live Sensors ── */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={S.title}>Live Sensors</Text>
            <Text style={[S.body, { marginTop: 2 }]}>{sensors.length} active · refreshed now</Text>
          </View>
          <Pressable onPress={() => { SafeHaptics.impact(); router.push('/(tabs)/zones'); }} hitSlop={12} accessibilityRole="button">
            <Text style={S.link}>All zones →</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 }}>
          {sensors.map(sensor => (
            <View key={sensor.id} style={{ width: '50%', padding: 5 }}>
              <SensorCard sensor={sensor} onPress={() => router.push(`/(tabs)/zones/${sensor.id}`)} />
            </View>
          ))}
        </View>

        {/* ── Health summary ── */}
        <View style={{
          backgroundColor: COLORS.bgSurface,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 16, marginTop: 16,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={S.title}>System Health</Text>
            <Text style={{ color: COLORS.statusOk, fontSize: 12, fontFamily: 'Outfit_600SemiBold' }}>
              {Math.round((okCount / Math.max(sensors.length, 1)) * 100)}% Healthy
            </Text>
          </View>
          {/* bar */}
          <View style={{ flexDirection: 'row', height: 4, borderRadius: 3, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
            {okCount > 0    && <View style={{ flex: okCount,    backgroundColor: COLORS.statusOk,   borderRadius: 3 }} />}
            {warnCount > 0  && <View style={{ flex: warnCount,  backgroundColor: COLORS.statusWarn, borderRadius: 3 }} />}
            {alertCount > 0 && <View style={{ flex: alertCount, backgroundColor: COLORS.statusCrit, borderRadius: 3 }} />}
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[
              { c: COLORS.statusOk,   t: `${okCount} Normal`   },
              { c: COLORS.statusWarn, t: `${warnCount} Warning` },
              { c: COLORS.statusCrit, t: `${alertCount} Critical` },
            ].map(({ c, t }) => (
              <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular' }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
          <View>
            <Text style={S.title}>Recent Activity</Text>
            <Text style={[S.body, { marginTop: 2 }]}>Latest events across all zones</Text>
          </View>
          <Pressable onPress={() => { SafeHaptics.impact(); router.push('/(tabs)/analytics'); }} hitSlop={12} accessibilityRole="button">
            <Text style={S.link}>View log →</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          {activities.length === 0 ? (
            <View style={{ paddingVertical: 36, alignItems: 'center' }}>
              <Ionicons name="time-outline" size={28} color={COLORS.textMuted} />
              <Text style={[S.body, { marginTop: 8 }]}>No recent activity</Text>
            </View>
          ) : activities.map((item, i) => (
            <ActivityItem key={item.id} item={item} isLast={i === activities.length - 1} />
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}
