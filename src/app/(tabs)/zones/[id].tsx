import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    GestureResponderEvent,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { SensorColor, SensorStatusType } from '../../../lib/api/sensors';
import { COLORS } from '../../../lib/constants/colors';
import { useSensorStore } from '../../../lib/stores/sensorStore';
import * as SafeHaptics from '../../../lib/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Zone definition type
interface Zone {
  id: string;
  name: string;
  floor: string;
  sensorCount: number;
  status: 'ok' | 'warn' | 'crit';
  statusLabel: string;
  description: string;
}

const ALL_ZONES: Zone[] = [
  { id: 'lobby_main', name: 'Main Lobby Entrance', floor: 'Lobby', sensorCount: 5, status: 'ok', statusLabel: 'optimal', description: 'Public area entry points and reception desk' },
  { id: 'cellar', name: 'Wine Cellar Vault', floor: 'Floor 1', sensorCount: 2, status: 'ok', statusLabel: 'optimal', description: 'Precision cooling and storage environment' },
  { id: 'ballroom', name: 'Grand Ballroom', floor: 'Floor 2', sensorCount: 6, status: 'warn', statusLabel: 'high humidity', description: 'Large capacity conference and banquet hall' },
  { id: 'suite_1801', name: 'Executive Suite 1801', floor: 'Floor 18', sensorCount: 4, status: 'ok', statusLabel: 'optimal', description: 'VIP penthouse suite environment controls' },
  { id: 'suite_2204', name: 'Luxury Suite 2204', floor: 'Floor 22', sensorCount: 3, status: 'crit', statusLabel: 'carbon dioxide spike', description: 'Premium double bedroom overlooking harbor' },
  { id: 'suite_2201', name: 'Luxury Suite 2201', floor: 'Floor 22', sensorCount: 3, status: 'ok', statusLabel: 'optimal', description: 'Premium double bedroom west wing' },
];

const ZONE_SENSORS: Record<string, string[]> = {
  lobby_main: ['temp', 'humidity', 'motion', 'aq', 'pressure'],
  cellar: ['temp', 'humidity'],
  ballroom: ['temp', 'humidity', 'co2', 'motion', 'aq', 'pressure'],
  suite_1801: ['temp', 'humidity', 'motion', 'aq'],
  suite_2204: ['temp', 'humidity', 'co2'],
  suite_2201: ['temp', 'humidity', 'aq'],
};

// Historical Mock Data per Sensor
const HISTORICAL_DATA: Record<string, { labels: string[]; values: number[] }> = {
  temp: {
    labels: ['13:00', '13:15', '13:30', '13:45', '14:00'],
    values: [21.8, 22.1, 22.4, 22.3, 22.5],
  },
  humidity: {
    labels: ['13:00', '13:15', '13:30', '13:45', '14:00'],
    values: [44, 46, 47, 47, 48],
  },
  co2: {
    labels: ['13:00', '13:15', '13:30', '13:45', '14:00'],
    values: [1200, 1450, 1600, 1842, 1780],
  },
  motion: {
    labels: ['13:00', '13:15', '13:30', '13:45', '14:00'],
    values: [4, 8, 12, 15, 9],
  },
  aq: {
    labels: ['13:00', '13:15', '13:30', '13:45', '14:00'],
    values: [98, 97, 95, 94, 95],
  },
  pressure: {
    labels: ['13:00', '13:15', '13:30', '13:45', '14:00'],
    values: [1011, 1012, 1013, 1013, 1014],
  },
};

const COLOR_MAP: Record<SensorColor, { bg: string; text: string; hex: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', hex: COLORS.accentIndigo },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', hex: COLORS.statusOk },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', hex: COLORS.statusCrit },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', hex: COLORS.statusWarn },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', hex: COLORS.statusInfo },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', hex: COLORS.accentViolet },
};

const STATUS_TYPE_COLOR: Record<SensorStatusType, string> = {
  ok: 'text-status-ok',
  warn: 'text-status-warn',
  crit: 'text-status-crit',
};

const STATUS_BG: Record<SensorStatusType, string> = {
  ok: 'bg-status-ok/10 border-status-ok/30',
  warn: 'bg-status-warn/10 border-status-warn/30',
  crit: 'bg-status-crit/10 border-status-crit/30',
};

// Custom interactive slider for precise threshold controls
interface ThresholdSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
  onChange: (val: number) => void;
}

function ThresholdSlider({ label, min, max, value, unit, onChange }: ThresholdSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);

  const handleTouch = (e: GestureResponderEvent) => {
    if (sliderWidth <= 0) return;
    const touchX = e.nativeEvent.locationX;
    const percentage = Math.max(0, Math.min(1, touchX / sliderWidth));
    const rawVal = min + percentage * (max - min);
    SafeHaptics.impact();
    onChange(Math.round(rawVal));
  };

  const handleDecrement = () => {
    if (value > min) {
      SafeHaptics.impact();
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      SafeHaptics.impact();
      onChange(value + 1);
    }
  };

  const fillPercentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <View className="mb-4 bg-bg-surface border border-white/05 rounded-xl p-3.5">
      <View className="flex-row justify-between items-baseline mb-2">
        <Text className="text-text-secondary text-xs font-brand-semibold">{label}</Text>
        <Text className="text-text-primary text-sm font-brand-bold">
          {value}
          <Text className="text-text-muted text-xs font-body"> {unit}</Text>
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {/* Decrement Button */}
        <Pressable 
          onPress={handleDecrement}
          className="w-8 h-8 rounded-lg bg-white/05 border border-white/05 items-center justify-center active:scale-95"
          accessibilityLabel={`Decrease ${label}`}
          accessibilityRole="button"
        >
          <Text className="text-text-secondary font-brand-bold text-sm">-</Text>
        </Pressable>

        {/* Interactive Track */}
        <Pressable 
          onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderMove={handleTouch}
          onResponderRelease={handleTouch}
          className="flex-1 h-6 justify-center relative"
          accessibilityLabel={`${label} slider. Current value: ${value} ${unit}`}
          accessibilityRole="adjustable"
        >
          <View className="h-1.5 w-full bg-white/07 rounded-full" />
          <View 
            style={{ width: `${fillPercentage}%` }}
            className="absolute h-1.5 bg-accent-indigo rounded-full left-0"
          />
          <View 
            style={{ left: `${fillPercentage}%`, marginLeft: -6 }}
            className="absolute w-3.5 h-3.5 rounded-full bg-text-primary border-2 border-accent-indigo"
          />
        </Pressable>

        {/* Increment Button */}
        <Pressable 
          onPress={handleIncrement}
          className="w-8 h-8 rounded-lg bg-white/05 border border-white/05 items-center justify-center active:scale-95"
          accessibilityLabel={`Increase ${label}`}
          accessibilityRole="button"
        >
          <Text className="text-text-secondary font-brand-bold text-sm">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Mini SVG Line Chart renderer
interface MiniChartProps {
  sensorId: string;
  color: string;
}

function MiniChart({ sensorId, color }: MiniChartProps) {
  const chartData = HISTORICAL_DATA[sensorId] || HISTORICAL_DATA.temp;
  const values = chartData.values;
  const labels = chartData.labels;

  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = 130;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...values) * 1.1;
  const minVal = Math.min(...values) * 0.9;
  const valRange = maxVal - minVal || 1;

  const points = values.map((val, idx) => {
    const x = paddingLeft + (idx / (values.length - 1)) * drawableWidth;
    const y = paddingTop + drawableHeight - ((val - minVal) / valRange) * drawableHeight;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${paddingTop + drawableHeight}
    L ${points[0].x} ${paddingTop + drawableHeight}
    Z
  `;

  return (
    <View className="bg-bg-surface border border-white/07 rounded-xl p-3 my-3">
      <Text className="text-text-muted text-[10px] uppercase font-brand-semibold tracking-wider mb-2">
        24-Hour Telemetry History
      </Text>
      <View className="items-center">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Horizontal lines */}
          {[0, 0.5, 1].map((ratio, index) => {
            const y = paddingTop + ratio * drawableHeight;
            const gridVal = maxVal - ratio * valRange;
            return (
              <React.Fragment key={index}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill={COLORS.textSecondary}
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="DM Sans"
                >
                  {Math.round(gridVal)}
                </SvgText>
              </React.Fragment>
            );
          })}

          <Path d={areaPath} fill="url(#miniChartGrad)" />
          <Path d={linePath} fill="none" stroke={color} strokeWidth="1.8" />

          {/* Points */}
          {points.map((p, idx) => (
            <React.Fragment key={idx}>
              <Circle cx={p.x} cy={p.y} r="2.5" fill="#FFFFFF" />
              <Circle cx={p.x} cy={p.y} r="1.2" fill={color} />
              <SvgText
                x={p.x}
                y={chartHeight - 4}
                fill={COLORS.textSecondary}
                fontSize="8"
                textAnchor="middle"
                fontFamily="DM Sans"
              >
                {labels[idx]}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );
}

export default function ZoneOrSensorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sensors, updateThreshold, thresholds } = useSensorStore();

  // Determine if dynamic ID is a Zone or a Sensor
  const isZone = ALL_ZONES.some(z => z.id === id);
  const isSensor = sensors.some(s => s.id === id);

  // States
  const [selectedSensorId, setSelectedSensorId] = useState<string>('temp');

  // Load initial sensor focus if it is a sensor, or default to the zone's first sensor
  useEffect(() => {
    if (isSensor && id) {
      setSelectedSensorId(id);
    } else if (isZone && id && ZONE_SENSORS[id]?.length > 0) {
      setSelectedSensorId(ZONE_SENSORS[id][0]);
    }
  }, [id, isSensor, isZone]);

  const handleBack = () => {
    SafeHaptics.impact();
    router.back();
  };

  const handleSensorSelect = (sensorId: string) => {
    SafeHaptics.impact();
    setSelectedSensorId(sensorId);
  };

  if (!id || (!isZone && !isSensor)) {
    return (
      <ScreenWrapper withSafeArea={true}>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.statusCrit} />
          <Text className="text-text-primary text-base font-brand-bold mt-4">Zone Not Found</Text>
          <Pressable 
            onPress={handleBack}
            className="mt-4 px-6 py-2.5 bg-accent-indigo rounded-xl"
          >
            <Text className="text-text-primary font-brand-semibold text-xs">Go Back</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  // Find targeted zone information
  const zoneInfo = isZone ? ALL_ZONES.find(z => z.id === id) : null;
  // Get active sensors for this zone or globally
  const activeSensorIds = isZone ? ZONE_SENSORS[id] : [selectedSensorId];
  const focusedSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];
  const sensorTheme = COLOR_MAP[focusedSensor.color] || COLOR_MAP.indigo;

  // Threshold controls calculations
  const renderThresholdControls = () => {
    if (focusedSensor.id === 'temp') {
      return (
        <View>
          <ThresholdSlider
            label="Minimum Temperature Alert Trigger"
            min={10}
            max={22}
            value={thresholds.tempMin}
            unit="°C"
            onChange={(val) => updateThreshold('tempMin', val)}
          />
          <ThresholdSlider
            label="Maximum Temperature Alert Trigger"
            min={23}
            max={35}
            value={thresholds.tempMax}
            unit="°C"
            onChange={(val) => updateThreshold('tempMax', val)}
          />
        </View>
      );
    }
    if (focusedSensor.id === 'humidity') {
      return (
        <View>
          <ThresholdSlider
            label="Minimum Humidity Alert Trigger"
            min={10}
            max={45}
            value={thresholds.humidityMin}
            unit="%"
            onChange={(val) => updateThreshold('humidityMin', val)}
          />
          <ThresholdSlider
            label="Maximum Humidity Alert Trigger"
            min={46}
            max={90}
            value={thresholds.humidityMax}
            unit="%"
            onChange={(val) => updateThreshold('humidityMax', val)}
          />
        </View>
      );
    }
    if (focusedSensor.id === 'co2') {
      return (
        <ThresholdSlider
          label="Maximum CO₂ Alert Trigger"
          min={500}
          max={2500}
          value={thresholds.co2Max}
          unit="ppm"
          onChange={(val) => updateThreshold('co2Max', val)}
        />
      );
    }
    if (focusedSensor.id === 'aq') {
      return (
        <ThresholdSlider
          label="Minimum Air Quality (AQI) Alert Trigger"
          min={40}
          max={99}
          value={thresholds.aqiMin}
          unit="AQI"
          onChange={(val) => updateThreshold('aqiMin', val)}
        />
      );
    }

    return (
      <View className="bg-bg-surface border border-white/05 rounded-xl p-4 items-center justify-center">
        <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
        <Text className="text-text-muted text-[11px] font-body mt-2 text-center leading-4">
          This sensor operates on a dynamic threshold evaluated automatically by system-wide anomalies.
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper withSafeArea={true} bg="bg-deep">
      {/* Header Stack Navigation Row */}
      <View className="flex-row items-center justify-between pb-3 border-b border-white/05 mb-4">
        <Pressable
          onPress={handleBack}
          className="w-9 h-9 rounded-xl items-center justify-center bg-bg-glass border border-white/07 active:scale-95"
          accessibilityLabel="Back button"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
        </Pressable>

        <View className="flex-1 items-center px-4">
          <Text className="text-text-primary text-base font-brand-bold text-center" numberOfLines={1}>
            {isZone ? zoneInfo?.name : `${focusedSensor.label} Detail`}
          </Text>
          <Text className="text-text-muted text-[10px] font-body mt-0.5">
            {isZone ? `${zoneInfo?.floor} · Environment Controls` : `Property-Wide Sensor Channel`}
          </Text>
        </View>

        <View className="w-9 h-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Zone Specific Header Details Card */}
        {isZone && zoneInfo && (
          <View className="bg-bg-surface border border-white/07 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-3">
                <Text className="text-text-muted text-[10px] uppercase font-brand-semibold tracking-wider">
                  Zone Overview
                </Text>
                <Text className="text-text-secondary text-[11px] font-body mt-1 leading-4">
                  {zoneInfo.description}
                </Text>
              </View>
              <View className={`px-2.5 py-1 rounded-md border ${STATUS_BG[zoneInfo.status]}`}>
                <Text className={`text-[9px] uppercase font-brand-bold ${STATUS_TYPE_COLOR[zoneInfo.status]}`}>
                  {zoneInfo.statusLabel}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Selected Sensor Overview Panel */}
        <View className="bg-bg-surface border border-white/07 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className={`w-9 h-9 rounded-xl items-center justify-center ${sensorTheme.bg}`}>
                <Ionicons name={focusedSensor.icon as any} size={18} color={sensorTheme.hex} />
              </View>
              <View className="ml-3">
                <Text className="text-text-primary text-sm font-brand-bold">{focusedSensor.label}</Text>
                <Text className="text-text-muted text-[10px] font-body mt-0.5">Telemetry Monitor</Text>
              </View>
            </View>
            <View className="items-end">
              <View className="flex-row items-baseline">
                <Text className="text-text-primary text-2xl font-brand-bold">{focusedSensor.value}</Text>
                <Text className="text-text-secondary text-xs font-body ml-0.5">{focusedSensor.unit}</Text>
              </View>
              <Text className={`text-[9px] uppercase font-brand-bold ${STATUS_TYPE_COLOR[focusedSensor.statusType]} mt-0.5`}>
                {focusedSensor.status}
              </Text>
            </View>
          </View>

          {/* Dynamic Progress Bar */}
          <View className="h-1.5 w-full bg-white/05 rounded-full overflow-hidden mb-1">
            <View 
              style={{ width: `${focusedSensor.fill}%`, backgroundColor: sensorTheme.hex }}
              className="h-full rounded-full"
            />
          </View>
        </View>

        {/* Zone Specific Sensor Selection Tabs */}
        {isZone && (
          <View className="mb-4">
            <Text className="text-text-muted text-[10px] uppercase font-brand-semibold tracking-wider mb-2.5 px-1">
              Active Sensors in Zone
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {sensors
                .filter(s => activeSensorIds.includes(s.id))
                .map((sensor) => {
                  const isActive = sensor.id === selectedSensorId;
                  const theme = COLOR_MAP[sensor.color] || COLOR_MAP.indigo;
                  return (
                    <Pressable
                      key={sensor.id}
                      onPress={() => handleSensorSelect(sensor.id)}
                      className={`px-4 py-3 rounded-2xl mr-2.5 border flex-row items-center ${
                        isActive 
                          ? 'bg-bg-surface border-white/10' 
                          : 'bg-bg-glass border-transparent'
                      }`}
                      accessible={true}
                      accessibilityLabel={`${sensor.label} tab`}
                      accessibilityRole="tab"
                    >
                      <Ionicons 
                        name={sensor.icon as any} 
                        size={14} 
                        color={isActive ? theme.hex : COLORS.textMuted} 
                        style={{ marginRight: 6 }}
                      />
                      <Text className={`text-xs ${
                        isActive ? 'text-text-primary font-brand-semibold' : 'text-text-muted font-body'
                      }`}>
                        {sensor.label}
                      </Text>
                    </Pressable>
                  );
                })}
            </ScrollView>
          </View>
        )}

        {/* Custom Mini Telemetry Trend Chart */}
        <MiniChart sensorId={focusedSensor.id} color={sensorTheme.hex} />

        {/* Threshold Adjustment Controls Section */}
        <View className="mt-2 mb-8">
          <Text className="text-text-muted text-[10px] uppercase font-brand-semibold tracking-wider mb-3 px-1">
            Adjust Threshold Limits
          </Text>
          {renderThresholdControls()}
        </View>

        {/* Sensor-focused property-wide active list */}
        {isSensor && (
          <View className="mb-8">
            <Text className="text-text-muted text-[10px] uppercase font-brand-semibold tracking-wider mb-3 px-1">
              Deploys & Readings Across Zones
            </Text>
            <View className="bg-bg-surface border border-white/07 rounded-2xl overflow-hidden">
              {ALL_ZONES
                .filter(z => ZONE_SENSORS[z.id]?.includes(focusedSensor.id))
                .map((zone, index, arr) => {
                  // Simulate zone specific values derived from global value for visualization
                  let displayVal = focusedSensor.value;
                  let displayStatus: SensorStatusType = focusedSensor.statusType;
                  let displayLabel = focusedSensor.status;

                  if (zone.id === 'suite_2204' && focusedSensor.id === 'co2') {
                    displayVal = '1842';
                    displayStatus = 'crit';
                    displayLabel = 'critical';
                  } else if (zone.id === 'ballroom' && focusedSensor.id === 'humidity') {
                    displayVal = '72';
                    displayStatus = 'warn';
                    displayLabel = 'high';
                  } else if (zone.id === 'cellar' && focusedSensor.id === 'temp') {
                    displayVal = '12.5';
                    displayStatus = 'ok';
                    displayLabel = 'optimal';
                  } else if (zone.id === 'lobby_main') {
                    displayVal = focusedSensor.id === 'temp' ? '22.4' : focusedSensor.id === 'co2' ? '420' : displayVal;
                    displayStatus = 'ok';
                    displayLabel = 'optimal';
                  }

                  const borderClass = index !== arr.length - 1 ? 'border-b border-white/04' : '';

                  return (
                    <Pressable
                      key={zone.id}
                      onPress={() => {
                        SafeHaptics.impact();
                        router.push(`/(tabs)/zones/${zone.id}`);
                      }}
                      className={`flex-row justify-between items-center p-4 bg-bg-surface ${borderClass} active:bg-white/02`}
                      accessible={true}
                      accessibilityLabel={`${zone.name}, floor level is ${zone.floor}, reading is ${displayVal} ${focusedSensor.unit}`}
                      accessibilityRole="button"
                    >
                      <View className="flex-1 mr-3">
                        <Text className="text-text-primary text-sm font-brand-semibold">{zone.name}</Text>
                        <Text className="text-text-muted text-[10px] font-body mt-0.5">{zone.floor}</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <View className="items-end mr-3">
                          <Text className="text-text-primary text-sm font-brand-bold">
                            {displayVal}
                            <Text className="text-text-secondary text-xs font-body"> {focusedSensor.unit}</Text>
                          </Text>
                          <Text className={`text-[8px] uppercase font-brand-bold ${STATUS_TYPE_COLOR[displayStatus]}`}>
                            {displayLabel}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
                      </View>
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
