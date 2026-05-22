import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { COLORS } from '../lib/constants/colors';
import { useAuthStore } from '../lib/stores/authStore';

const { width } = Dimensions.get('window');

export default function OnboardingSplash() {
  const router = useRouter();
  const token = useAuthStore(state => state.token);
  const logoScale = useSharedValue(1);

  // Logo Pulse Animation (1 -> 1.08 -> 1)
  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }),
        withTiming(1.0, { duration: 1200 })
      ),
      -1, // Infinite
      true // Reverse
    );
  }, []);

  // Automatic routing transition after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [token]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View className="flex-1 bg-bg-void justify-center items-center overflow-hidden">
      {/* Ambient Glow Orbs */}
      <View 
        style={[styles.glowOrb, styles.topRightOrb]} 
        className="bg-accent-indigo"
      />
      <View 
        style={[styles.glowOrb, styles.bottomLeftOrb]} 
        className="bg-accent-violet"
      />

      {/* Main Logo & Text Stack */}
      <View className="items-center z-10">
        {/* Animated Hexagonal SVG Logo */}
        <Animated.View style={[animatedLogoStyle]} className="mb-8">
          <Svg height="140" width="140" viewBox="0 0 100 100">
            {/* Outer Hexagon */}
            <Polygon
              points="90,50 70,84.64 30,84.64 10,50 30,15.36 70,15.36"
              fill="none"
              stroke={COLORS.accentSoft}
              strokeWidth="1.5"
              opacity="0.6"
            />
            {/* Inner Hexagon */}
            <Polygon
              points="74,50 62,70.78 38,70.78 26,50 38,29.22 62,29.22"
              fill="none"
              stroke={COLORS.accentIndigo}
              strokeWidth="1"
              opacity="0.4"
            />
            {/* Sensor Network Mesh Lines */}
            <Line x1="50" y1="50" x2="90" y2="50" stroke={COLORS.accentSoft} strokeWidth="0.8" opacity="0.4" />
            <Line x1="50" y1="50" x2="70" y2="84.64" stroke={COLORS.accentSoft} strokeWidth="0.8" opacity="0.4" />
            <Line x1="50" y1="50" x2="30" y2="84.64" stroke={COLORS.accentSoft} strokeWidth="0.8" opacity="0.4" />
            <Line x1="50" y1="50" x2="10" y2="50" stroke={COLORS.accentSoft} strokeWidth="0.8" opacity="0.4" />
            <Line x1="50" y1="50" x2="30" y2="15.36" stroke={COLORS.accentSoft} strokeWidth="0.8" opacity="0.4" />
            <Line x1="50" y1="50" x2="70" y2="15.36" stroke={COLORS.accentSoft} strokeWidth="0.8" opacity="0.4" />

            {/* Sensor Node Dots */}
            <Circle cx="90" cy="50" r="3" fill={COLORS.statusOk} />
            <Circle cx="70" cy="84.64" r="3" fill={COLORS.statusWarn} />
            <Circle cx="30" cy="84.64" r="3" fill={COLORS.statusInfo} />
            <Circle cx="10" cy="50" r="3" fill={COLORS.accentSoft} />
            <Circle cx="30" cy="15.36" r="3" fill={COLORS.statusCrit} />
            <Circle cx="70" cy="15.36" r="3" fill={COLORS.accentIndigo} />

            {/* Central Orb */}
            <Circle cx="50" cy="50" r="7" fill={COLORS.accentSoft} />
            <Circle cx="50" cy="50" r="4" fill="#FFFFFF" />
          </Svg>
        </Animated.View>

        {/* Branding text */}
        <Text 
          className="text-text-primary text-3xl font-brand-bold tracking-[6px] mb-2 uppercase"
          style={{ letterSpacing: 8 }}
        >
          AuraSense
        </Text>
        <Text className="text-text-secondary text-sm font-body tracking-wider text-center mt-1">
          Intelligent Environment Control
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    opacity: 0.12,
  },
  topRightOrb: {
    top: -width * 0.15,
    right: -width * 0.15,
  },
  bottomLeftOrb: {
    bottom: -width * 0.15,
    left: -width * 0.15,
  },
});
