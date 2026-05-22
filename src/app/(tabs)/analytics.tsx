import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { COLORS } from '../../lib/constants/colors';
import * as SafeHaptics from '../../lib/utils/haptics';

const { width } = Dimensions.get('window');

const RANGES = ['1H', '24H', '7D', '30D'] as const;
type Range = typeof RANGES[number];

const DATA: Record<Range, { labels: string[]; temp: number[]; humidity: number[]; co2: number[] }> = {
  '1H':  { labels: ['13:00','13:15','13:30','13:45','14:00'], temp:[22.1,22.3,22.5,22.4,22.6], humidity:[45,46,47,47,48], co2:[1200,1450,1600,1842,1750] },
  '24H': { labels: ['08:00','12:00','16:00','20:00','00:00','04:00','08:00'], temp:[21.5,22.8,23.4,22.1,21.0,20.8,21.4], humidity:[42,45,48,50,47,46,44], co2:[850,1200,1400,1842,1100,900,950] },
  '7D':  { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], temp:[21.8,22.4,22.1,22.6,23.0,22.5,22.3], humidity:[44,46,45,47,49,48,47], co2:[900,1100,1842,1400,1300,1050,980] },
  '30D': { labels: ['Wk 1','Wk 2','Wk 3','Wk 4'], temp:[22.0,22.5,22.2,22.4], humidity:[45,47,46,48], co2:[1100,1350,1480,1200] },
};

type Channel = 'temp' | 'humidity' | 'co2';

const CHANNELS: { key: Channel; icon: React.ComponentProps<typeof Ionicons>['name']; label: string; color: string; unit: string; gradId: string }[] = [
  { key: 'temp',     icon: 'thermometer-outline', label: 'Temperature', color: COLORS.accentIndigo, unit: '°C',  gradId: 'gTemp' },
  { key: 'humidity', icon: 'water-outline',        label: 'Humidity',    color: COLORS.statusOk,    unit: '%',   gradId: 'gHum'  },
  { key: 'co2',      icon: 'alert-circle-outline', label: 'CO₂',         color: COLORS.statusCrit,  unit: 'ppm', gradId: 'gCo2'  },
];

export default function Analytics() {
  const [range, setRange]     = useState<Range>('24H');
  const [channel, setChannel] = useState<Channel>('co2');
  const [toast, setToast]     = useState<string | null>(null);

  const data   = DATA[range];
  const values = data[channel];
  const ch     = CHANNELS.find(c => c.key === channel)!;

  const cW  = width - 48;
  const cH  = 170;
  const pL  = 34, pR = 8, pT = 16, pB = 24;
  const dW  = cW - pL - pR;
  const dH  = cH - pT - pB;
  const max = Math.max(...values) * 1.12;
  const min = Math.min(...values) * 0.88;
  const rng = max - min;

  const pts = values.map((v, i) => ({
    x: pL + (i / (values.length - 1)) * dW,
    y: pT + dH - ((v - min) / rng) * dH,
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${pts[pts.length-1].x} ${pT+dH} L ${pts[0].x} ${pT+dH} Z`;

  const handleExport = () => {
    SafeHaptics.notification();
    setToast('Report exported to work@property.com');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ScreenWrapper withSafeArea>
      {/* header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, paddingBottom: 20 }}>
        <View>
          <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Outfit_700Bold' }}>Analytics</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
            Environmental telemetry
          </Text>
        </View>
        <Pressable
          onPress={handleExport}
          style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel="Export report" accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={17} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

        {/* toast */}
        {toast && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Ionicons name="checkmark-circle-outline" size={15} color={COLORS.statusOk} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', flex: 1 }}>{toast}</Text>
          </View>
        )}

        {/* range tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 3, marginBottom: 20 }}>
          {RANGES.map(r => {
            const active = range === r;
            return (
              <Pressable
                key={r}
                onPress={() => { SafeHaptics.impact(); setRange(r); }}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: active ? COLORS.bgElevated : 'transparent' }}
              >
                <Text style={{ color: active ? COLORS.textPrimary : COLORS.textSecondary, fontSize: 12, fontFamily: active ? 'Outfit_600SemiBold' : 'DMSans_400Regular' }}>
                  {r}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* chart */}
        <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View>
              <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {ch.label}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4 }}>
                <Text style={{ color: COLORS.textPrimary, fontSize: 28, fontFamily: 'Outfit_700Bold', lineHeight: 32 }}>
                  {values[values.length - 1]}
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: 'DMSans_400Regular', marginBottom: 3 }}>
                  {ch.unit}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: `${ch.color}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ch.color }} />
              <Text style={{ color: ch.color, fontSize: 10, fontFamily: 'Outfit_500Medium' }}>{range}</Text>
            </View>
          </View>

          <Svg width={cW} height={cH}>
            <Defs>
              {CHANNELS.map(c => (
                <LinearGradient key={c.gradId} id={c.gradId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={c.color} stopOpacity={0.25} />
                  <Stop offset="100%" stopColor={c.color} stopOpacity={0} />
                </LinearGradient>
              ))}
            </Defs>

            {[0, 0.5, 1].map((r, i) => {
              const y = pT + r * dH;
              return (
                <React.Fragment key={i}>
                  <Line x1={pL} y1={y} x2={cW - pR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,4" />
                  <SvgText x={pL - 5} y={y + 4} fill={COLORS.textSecondary} fontSize="9" textAnchor="end" fontFamily="DMSans_400Regular">
                    {Math.round(max - r * rng)}
                  </SvgText>
                </React.Fragment>
              );
            })}

            <Path d={area} fill={`url(#${ch.gradId})`} />
            <Path d={line} fill="none" stroke={ch.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {pts.map((p, i) => (
              <React.Fragment key={i}>
                <Circle cx={p.x} cy={p.y} r="3.5" fill={COLORS.bgSurface} />
                <Circle cx={p.x} cy={p.y} r="2" fill={ch.color} />
                <SvgText x={p.x} y={cH - 5} fill={COLORS.textSecondary} fontSize="8" textAnchor="middle" fontFamily="DMSans_400Regular">
                  {data.labels[i]}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>

        {/* channel selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {CHANNELS.map(c => {
            const active = channel === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => { SafeHaptics.impact(); setChannel(c.key); }}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 14,
                  backgroundColor: COLORS.bgSurface,
                  borderWidth: 1,
                  borderColor: active ? `${c.color}50` : 'rgba(255,255,255,0.07)',
                  borderRadius: 14,
                }}
              >
                <Ionicons name={c.icon} size={17} color={active ? c.color : COLORS.textSecondary} />
                <Text style={{ color: active ? COLORS.textPrimary : COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {c.label === 'Temperature' ? 'Temp' : c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* stats */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Peak',    value: Math.max(...values) },
            { label: 'Average', value: +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) },
            { label: 'Low',     value: Math.min(...values) },
          ].map(({ label, value }) => (
            <View key={label} style={{ flex: 1, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 9, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontFamily: 'Outfit_700Bold' }}>{value}</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>{ch.unit}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}
