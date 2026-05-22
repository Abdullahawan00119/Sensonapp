import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Sensor } from '../../lib/api/sensors';
import { COLORS } from '../../lib/constants/colors';
import * as SafeHaptics from '../../lib/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SensorCardProps {
  sensor: Sensor;
  onPress?: () => void;
}

const palette: Record<string, { hex: string }> = {
  indigo: { hex: COLORS.accentIndigo },
  green:  { hex: COLORS.statusOk },
  red:    { hex: COLORS.statusCrit },
  amber:  { hex: COLORS.statusWarn },
  cyan:   { hex: COLORS.statusInfo },
  purple: { hex: COLORS.accentViolet },
};

export default function SensorCard({ sensor, onPress }: SensorCardProps) {
  const pulse = useSharedValue(0.07);

  useEffect(() => {
    if (sensor.statusType === 'crit') {
      pulse.value = withRepeat(
        withSequence(withTiming(0.55, { duration: 900 }), withTiming(0.1, { duration: 900 })),
        -1, true
      );
    } else {
      pulse.value = sensor.statusType === 'warn' ? 0.22 : 0.07;
    }
  }, [sensor.statusType]);

  const animStyle = useAnimatedStyle(() => ({
    borderColor:
      sensor.statusType === 'crit' ? `rgba(239,68,68,${pulse.value})` :
      sensor.statusType === 'warn' ? `rgba(245,158,11,${pulse.value})` :
      `rgba(255,255,255,${pulse.value})`,
  }));

  const color = (palette[sensor.color] ?? palette.indigo).hex;

  const statusLabel =
    sensor.statusType === 'crit' ? 'Critical' :
    sensor.statusType === 'warn' ? 'Warning' : 'Normal';

  const statusColor =
    sensor.statusType === 'crit' ? COLORS.statusCrit :
    sensor.statusType === 'warn' ? COLORS.statusWarn : COLORS.statusOk;

  return (
    <AnimatedPressable
      onPress={() => { if (onPress) { SafeHaptics.impact(); onPress(); } }}
      disabled={!onPress}
      style={[animStyle, {
        backgroundColor: COLORS.bgSurface,
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
        flex: 1,
      }]}
      accessible
      accessibilityLabel={`${sensor.label} ${sensor.value}${sensor.unit}`}
      accessibilityRole="button"
    >
      {/* top color strip */}
      <View style={{ height: 2, backgroundColor: color, opacity: 0.7 }} />

      <View style={{ padding: 14 }}>
        {/* icon row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: `${color}18`,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={sensor.icon as any} size={16} color={color} />
          </View>
          {/* live dot */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
            <Text style={{ color: statusColor, fontSize: 10, fontFamily: 'Outfit_500Medium' }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* label */}
        <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
          {sensor.label}
        </Text>

        {/* value */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 12 }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 26, fontFamily: 'Outfit_700Bold', lineHeight: 30 }}>
            {sensor.value}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular', marginBottom: 2 }}>
            {sensor.unit}
          </Text>
        </View>

        {/* progress */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
            <View style={{ width: `${sensor.fill}%`, height: 3, backgroundColor: color, borderRadius: 2 }} />
          </View>
          <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'DMSans_400Regular', width: 28, textAlign: 'right' }}>
            {sensor.fill}%
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
