import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { COLORS } from '../../lib/constants/colors';
import * as SafeHaptics from '../../lib/utils/haptics';

interface Zone {
  id: string;
  name: string;
  floor: string;
  sensorCount: number;
  status: 'ok' | 'warn' | 'crit';
  statusLabel: string;
  description: string;
}

const FLOORS = ['Lobby', 'Floor 1', 'Floor 2', 'Floor 18', 'Floor 22'];

const ALL_ZONES: Zone[] = [
  { id: 'lobby_main',  name: 'Main Lobby',          floor: 'Lobby',    sensorCount: 5, status: 'ok',   statusLabel: 'Optimal',          description: 'Entry points and reception desk' },
  { id: 'cellar',      name: 'Wine Cellar Vault',    floor: 'Floor 1',  sensorCount: 2, status: 'ok',   statusLabel: 'Optimal',          description: 'Precision cooling and storage' },
  { id: 'ballroom',    name: 'Grand Ballroom',       floor: 'Floor 2',  sensorCount: 6, status: 'warn', statusLabel: 'High Humidity',    description: 'Conference and banquet hall' },
  { id: 'suite_1801',  name: 'Executive Suite 1801', floor: 'Floor 18', sensorCount: 4, status: 'ok',   statusLabel: 'Optimal',          description: 'VIP penthouse environment' },
  { id: 'suite_2204',  name: 'Luxury Suite 2204',    floor: 'Floor 22', sensorCount: 3, status: 'crit', statusLabel: 'CO₂ Spike',        description: 'Premium suite — harbor view' },
  { id: 'suite_2201',  name: 'Luxury Suite 2201',    floor: 'Floor 22', sensorCount: 3, status: 'ok',   statusLabel: 'Optimal',          description: 'Premium suite — west wing' },
];

const statusMap = {
  ok:   { color: COLORS.statusOk,   bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'   },
  warn: { color: COLORS.statusWarn, bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)' },
  crit: { color: COLORS.statusCrit, bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)'  },
};

export default function Zones() {
  const router = useRouter();
  const [floor, setFloor] = useState('Floor 22');
  const zones = ALL_ZONES.filter(z => z.floor === floor);

  return (
    <ScreenWrapper withSafeArea>
      {/* header */}
      <View style={{ paddingTop: 4, paddingBottom: 20 }}>
        <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Outfit_700Bold' }}>Zones</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
          Property environment zones
        </Text>
      </View>

      {/* floor tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
        contentContainerStyle={{ gap: 6 }}
      >
        {FLOORS.map(f => {
          const active = floor === f;
          return (
            <Pressable
              key={f}
              onPress={() => { SafeHaptics.impact(); setFloor(f); }}
              style={{
                paddingHorizontal: 14, paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: active ? COLORS.bgElevated : COLORS.bgSurface,
                borderWidth: 1,
                borderColor: active ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.07)',
              }}
            >
              <Text style={{ color: active ? COLORS.textPrimary : COLORS.textSecondary, fontSize: 12, fontFamily: active ? 'Outfit_600SemiBold' : 'DMSans_400Regular' }}>
                {f}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* zone list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 32 }}>
        {zones.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Ionicons name="layers-outline" size={36} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', marginTop: 10 }}>
              No zones on this floor
            </Text>
          </View>
        ) : zones.map(zone => {
          const s = statusMap[zone.status];
          return (
            <Pressable
              key={zone.id}
              onPress={() => { SafeHaptics.impact(); router.push(`/(tabs)/zones/${zone.id}`); }}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: COLORS.bgSurface,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 16,
              }}
              accessible accessibilityLabel={`${zone.name}, ${zone.statusLabel}`} accessibilityRole="button"
            >
              {/* status bar */}
              <View style={{ width: 3, height: '100%', borderRadius: 2, backgroundColor: s.color, marginRight: 14, alignSelf: 'stretch' }} />

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontFamily: 'Outfit_600SemiBold' }} numberOfLines={1}>
                    {zone.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: s.bg, borderWidth: 1, borderColor: s.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: s.color }} />
                    <Text style={{ color: s.color, fontSize: 9, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {zone.statusLabel}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginBottom: 8 }}>
                  {zone.description}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="radio-outline" size={11} color={COLORS.textMuted} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular' }}>
                    {zone.sensorCount} sensors active
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} style={{ marginLeft: 10 }} />
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}
