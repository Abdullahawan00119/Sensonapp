import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, GestureResponderEvent, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { SensorColor, SensorStatusType } from '../../../lib/api/sensors';
import { COLORS } from '../../../lib/constants/colors';
import { ALL_ZONES, ZONE_SENSORS } from '../../../lib/constants/zones';
import { useSensorStore } from '../../../lib/stores/sensorStore';
import * as SafeHaptics from '../../../lib/utils/haptics';

const { width: SW } = Dimensions.get('window');

const COLOR_MAP: Record<SensorColor, { hex: string; dimHex: string }> = {
  indigo: { hex: COLORS.accentIndigo,  dimHex: 'rgba(79,70,229,0.15)'  },
  green:  { hex: COLORS.statusOk,      dimHex: 'rgba(34,197,94,0.15)'  },
  red:    { hex: COLORS.statusCrit,    dimHex: 'rgba(239,68,68,0.15)'  },
  amber:  { hex: COLORS.statusWarn,    dimHex: 'rgba(245,158,11,0.15)' },
  cyan:   { hex: COLORS.statusInfo,    dimHex: 'rgba(6,182,212,0.15)'  },
  purple: { hex: COLORS.accentViolet,  dimHex: 'rgba(124,58,237,0.15)' },
};

const STATUS_COLOR: Record<SensorStatusType, string> = {
  ok:   COLORS.statusOk,
  warn: COLORS.statusWarn,
  crit: COLORS.statusCrit,
};

const HISTORICAL: Record<string, { labels: string[]; values: number[] }> = {
  temp:     { labels: ['13:00','13:15','13:30','13:45','14:00'], values: [21.8,22.1,22.4,22.3,22.5] },
  humidity: { labels: ['13:00','13:15','13:30','13:45','14:00'], values: [44,46,47,47,48] },
  co2:      { labels: ['13:00','13:15','13:30','13:45','14:00'], values: [1200,1450,1600,1842,1780] },
  motion:   { labels: ['13:00','13:15','13:30','13:45','14:00'], values: [4,8,12,15,9] },
  aq:       { labels: ['13:00','13:15','13:30','13:45','14:00'], values: [98,97,95,94,95] },
  pressure: { labels: ['13:00','13:15','13:30','13:45','14:00'], values: [1011,1012,1013,1013,1014] },
};

// ── Threshold Slider ──────────────────────────────────────────────────────────
function ThresholdSlider({ label, min, max, value, unit, onChange }: {
  label: string; min: number; max: number; value: number; unit: string; onChange: (v: number) => void;
}) {
  const [trackW, setTrackW] = useState(0);
  const fill = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const handleTouch = (e: GestureResponderEvent) => {
    if (trackW <= 0) return;
    const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackW));
    SafeHaptics.impact();
    onChange(Math.round(min + pct * (max - min)));
  };

  return (
    <View style={{ marginBottom: 14, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', flex: 1, marginRight: 8 }}>{label}</Text>
        <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontFamily: 'Outfit_600SemiBold' }}>
          {value} <Text style={{ color: COLORS.textSecondary, fontFamily: 'DMSans_400Regular', fontSize: 11 }}>{unit}</Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => value > min && onChange(value - 1)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel={`Decrease ${label}`}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16, fontFamily: 'Outfit_700Bold' }}>−</Text>
        </Pressable>
        <Pressable
          onLayout={e => setTrackW(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderMove={handleTouch}
          onResponderRelease={handleTouch}
          style={{ flex: 1, height: 28, justifyContent: 'center' }}
          accessibilityRole="adjustable"
          accessibilityLabel={`${label} slider, ${value} ${unit}`}
        >
          <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <View style={{ width: `${fill}%`, height: 4, backgroundColor: COLORS.accentIndigo, borderRadius: 2 }} />
          </View>
          <View style={{ position: 'absolute', left: `${fill}%`, marginLeft: -7, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.textPrimary, borderWidth: 2, borderColor: COLORS.accentIndigo }} />
        </Pressable>
        <Pressable onPress={() => value < max && onChange(value + 1)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel={`Increase ${label}`}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16, fontFamily: 'Outfit_700Bold' }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Mini Chart ────────────────────────────────────────────────────────────────
function MiniChart({ sensorId, color }: { sensorId: string; color: string }) {
  const d = HISTORICAL[sensorId] ?? HISTORICAL.temp;
  const cW = SW - 64, cH = 130, pL = 30, pR = 10, pT = 14, pB = 20;
  const dW = cW - pL - pR, dH = cH - pT - pB;
  const max = Math.max(...d.values) * 1.1;
  const min = Math.min(...d.values) * 0.9;
  const rng = max - min || 1;
  const pts = d.values.map((v, i) => ({
    x: pL + (i / (d.values.length - 1)) * dW,
    y: pT + dH - ((v - min) / rng) * dH,
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${pts[pts.length-1].x} ${pT+dH} L ${pts[0].x} ${pT+dH} Z`;

  return (
    <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
      <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
        24-Hour Telemetry
      </Text>
      <Svg width={cW} height={cH}>
        <Defs>
          <LinearGradient id="mcg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {[0, 0.5, 1].map((r, i) => {
          const y = pT + r * dH;
          return (
            <React.Fragment key={i}>
              <Line x1={pL} y1={y} x2={cW-pR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <SvgText x={pL-5} y={y+3} fill={COLORS.textSecondary} fontSize="8" textAnchor="end" fontFamily="DMSans_400Regular">
                {Math.round(max - r * rng)}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Path d={area} fill="url(#mcg)" />
        <Path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r="3" fill={COLORS.bgSurface} />
            <Circle cx={p.x} cy={p.y} r="1.8" fill={color} />
            <SvgText x={p.x} y={cH-4} fill={COLORS.textSecondary} fontSize="8" textAnchor="middle" fontFamily="DMSans_400Regular">
              {d.labels[i]}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ZoneOrSensorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sensors, fetchSensors, isLoading, updateThreshold, thresholds } = useSensorStore();

  const isZone   = ALL_ZONES.some(z => z.id === id);
  const isSensor = !isZone && ['temp','humidity','co2','motion','aq','pressure'].includes(id ?? '');

  const [selectedSensorId, setSelectedSensorId] = useState<string>('temp');

  // Fetch sensors if store is empty (e.g. deep-link before dashboard loads)
  useEffect(() => {
    if (sensors.length === 0) fetchSensors();
  }, []);

  useEffect(() => {
    if (!id) return;
    if (isSensor) {
      setSelectedSensorId(id);
    } else if (isZone && ZONE_SENSORS[id]?.length > 0) {
      setSelectedSensorId(ZONE_SENSORS[id][0]);
    }
  }, [id, isSensor, isZone]);

  const handleBack = () => { SafeHaptics.impact(); router.back(); };

  // Loading state while sensors are being fetched
  if (isLoading && sensors.length === 0) {
    return (
      <ScreenWrapper withSafeArea bg="bg-deep">
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <Pressable onPress={handleBack} style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={17} color={COLORS.textPrimary} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={COLORS.accentSoft} />
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>Loading sensor data…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Not found
  if (!id || (!isZone && !isSensor)) {
    return (
      <ScreenWrapper withSafeArea bg="bg-deep">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.statusCrit} />
          <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontFamily: 'Outfit_600SemiBold' }}>Zone Not Found</Text>
          <Pressable onPress={handleBack} style={{ backgroundColor: COLORS.accentIndigo, paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Outfit_600SemiBold' }}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const zoneInfo = isZone ? ALL_ZONES.find(z => z.id === id) : null;
  const activeSensorIds = isZone ? (ZONE_SENSORS[id] ?? []) : [selectedSensorId];

  // Crash-safe: fall back to first available sensor
  const focusedSensor = sensors.find(s => s.id === selectedSensorId) ?? sensors[0];

  if (!focusedSensor) {
    return (
      <ScreenWrapper withSafeArea bg="bg-deep">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={COLORS.accentSoft} />
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: 'DMSans_400Regular' }}>Initialising sensors…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const theme = COLOR_MAP[focusedSensor.color] ?? COLOR_MAP.indigo;
  const statusColor = STATUS_COLOR[focusedSensor.statusType];

  const thresholdControls = () => {
    if (focusedSensor.id === 'temp') return (
      <>
        <ThresholdSlider label="Min Temperature" min={10} max={22} value={thresholds.tempMin} unit="°C" onChange={v => updateThreshold('tempMin', v)} />
        <ThresholdSlider label="Max Temperature" min={23} max={35} value={thresholds.tempMax} unit="°C" onChange={v => updateThreshold('tempMax', v)} />
      </>
    );
    if (focusedSensor.id === 'humidity') return (
      <>
        <ThresholdSlider label="Min Humidity" min={10} max={45} value={thresholds.humidityMin} unit="%" onChange={v => updateThreshold('humidityMin', v)} />
        <ThresholdSlider label="Max Humidity" min={46} max={90} value={thresholds.humidityMax} unit="%" onChange={v => updateThreshold('humidityMax', v)} />
      </>
    );
    if (focusedSensor.id === 'co2') return (
      <ThresholdSlider label="Max CO₂" min={500} max={2500} value={thresholds.co2Max} unit="ppm" onChange={v => updateThreshold('co2Max', v)} />
    );
    if (focusedSensor.id === 'aq') return (
      <ThresholdSlider label="Min Air Quality" min={40} max={99} value={thresholds.aqiMin} unit="AQI" onChange={v => updateThreshold('aqiMin', v)} />
    );
    return (
      <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, alignItems: 'center' }}>
        <Ionicons name="information-circle-outline" size={22} color={COLORS.textSecondary} />
        <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', marginTop: 8, textAlign: 'center', lineHeight: 18 }}>
          This sensor uses dynamic system-wide anomaly detection.
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper withSafeArea bg="bg-deep">
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }}>
        <Pressable onPress={handleBack} style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={17} color={COLORS.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Outfit_600SemiBold' }} numberOfLines={1}>
            {isZone ? zoneInfo?.name : `${focusedSensor.label} Detail`}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>
            {isZone ? `${zoneInfo?.floor} · Environment Controls` : 'Property-Wide Sensor'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Zone overview card */}
        {isZone && zoneInfo && (
          <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Zone Overview</Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', lineHeight: 18 }}>{zoneInfo.description}</Text>
              </View>
              <View style={{ backgroundColor: `${STATUS_COLOR[zoneInfo.status]}15`, borderWidth: 1, borderColor: `${STATUS_COLOR[zoneInfo.status]}35`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: STATUS_COLOR[zoneInfo.status], fontSize: 9, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {zoneInfo.statusLabel}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Focused sensor card */}
        <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ height: 3, backgroundColor: theme.hex, opacity: 0.8 }} />
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: theme.dimHex, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={focusedSensor.icon as any} size={17} color={theme.hex} />
                </View>
                <View>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontFamily: 'Outfit_600SemiBold' }}>{focusedSensor.label}</Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>Live telemetry</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 26, fontFamily: 'Outfit_700Bold', lineHeight: 30 }}>{focusedSensor.value}</Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', marginBottom: 2 }}>{focusedSensor.unit}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                  <Text style={{ color: statusColor, fontSize: 9, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {focusedSensor.status}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
              <View style={{ width: `${focusedSensor.fill}%`, height: 4, backgroundColor: theme.hex, borderRadius: 2 }} />
            </View>
          </View>
        </View>

        {/* Sensor tabs (zone view) */}
        {isZone && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Active Sensors
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {sensors.filter(s => activeSensorIds.includes(s.id)).map(sensor => {
                const active = sensor.id === selectedSensorId;
                const t = COLOR_MAP[sensor.color] ?? COLOR_MAP.indigo;
                return (
                  <Pressable
                    key={sensor.id}
                    onPress={() => { SafeHaptics.impact(); setSelectedSensorId(sensor.id); }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: active ? COLORS.bgElevated : COLORS.bgSurface, borderWidth: 1, borderColor: active ? `${t.hex}40` : 'rgba(255,255,255,0.07)' }}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <Ionicons name={sensor.icon as any} size={13} color={active ? t.hex : COLORS.textMuted} />
                    <Text style={{ color: active ? COLORS.textPrimary : COLORS.textSecondary, fontSize: 12, fontFamily: active ? 'Outfit_600SemiBold' : 'DMSans_400Regular' }}>
                      {sensor.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Chart */}
        <MiniChart sensorId={focusedSensor.id} color={theme.hex} />

        {/* Thresholds */}
        <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Alert Thresholds
        </Text>
        {thresholdControls()}

        {/* Cross-zone readings (sensor view) */}
        {isSensor && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Readings Across Zones
            </Text>
            <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              {ALL_ZONES.filter(z => ZONE_SENSORS[z.id]?.includes(focusedSensor.id)).map((zone, i, arr) => {
                let val = focusedSensor.value;
                let st: SensorStatusType = focusedSensor.statusType;
                let lbl = focusedSensor.status;
                if (zone.id === 'suite_2204' && focusedSensor.id === 'co2') { val = '1842'; st = 'crit'; lbl = 'critical'; }
                else if (zone.id === 'ballroom' && focusedSensor.id === 'humidity') { val = '72'; st = 'warn'; lbl = 'high'; }
                else if (zone.id === 'cellar' && focusedSensor.id === 'temp') { val = '12.5'; st = 'ok'; lbl = 'optimal'; }
                else if (zone.id === 'lobby_main') { val = focusedSensor.id === 'temp' ? '22.4' : focusedSensor.id === 'co2' ? '420' : val; st = 'ok'; lbl = 'optimal'; }
                const sc = STATUS_COLOR[st];
                return (
                  <Pressable
                    key={zone.id}
                    onPress={() => { SafeHaptics.impact(); router.push(`/(tabs)/zones/${zone.id}`); }}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}
                    accessibilityRole="button"
                    accessibilityLabel={`${zone.name}, ${val} ${focusedSensor.unit}`}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontFamily: 'Outfit_600SemiBold' }}>{zone.name}</Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>{zone.floor}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontFamily: 'Outfit_600SemiBold' }}>
                        {val}<Text style={{ color: COLORS.textSecondary, fontFamily: 'DMSans_400Regular', fontSize: 11 }}> {focusedSensor.unit}</Text>
                      </Text>
                      <Text style={{ color: sc, fontSize: 9, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 1 }}>{lbl}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}
