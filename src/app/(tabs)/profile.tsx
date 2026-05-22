import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import AvatarCircle from '../../components/ui/AvatarCircle';
import { COLORS } from '../../lib/constants/colors';
import { useAuth } from '../../lib/hooks/useAuth';
import * as SafeHaptics from '../../lib/utils/haptics';

function useToast() {
  const [msg, setMsg] = React.useState<string | null>(null);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const show = (m: string) => {
    setMsg(m);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setMsg(null));
  };

  const Toast = msg ? (
    <Animated.View style={{
      opacity, position: 'absolute', bottom: 24, left: 16, right: 16,
      backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
      flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 50,
    }}>
      <Ionicons name="information-circle-outline" size={16} color={COLORS.accentSoft} />
      <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontFamily: 'DMSans_400Regular', flex: 1 }}>{msg}</Text>
    </Animated.View>
  ) : null;

  return { show, Toast };
}

function Row({
  icon, label, value, onPress, last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
      accessible accessibilityLabel={label} accessibilityRole="button"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name={icon} size={17} color={COLORS.textSecondary} />
        <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>{value}</Text>}
        <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
      </View>
    </Pressable>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'Outfit_500Medium', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 24, paddingHorizontal: 2 }}>
      {text}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: COLORS.bgSurface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { show, Toast } = useToast();
  const [pushNotif, setPushNotif]     = React.useState(true);
  const [smartAlerts, setSmartAlerts] = React.useState(true);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      SafeHaptics.impact();
      // Auto-dismiss confirmation after 4 seconds
      setTimeout(() => setConfirmLogout(false), 4000);
      return;
    }
    SafeHaptics.notification(SafeHaptics.Haptics.NotificationFeedbackType.Warning);
    await logout();
  };

  const press = (name: string) => { SafeHaptics.impact(); show(`${name} — coming soon.`); };

  const initials     = user ? `${user.firstName[0]}${user.lastName[0]}` : 'AV';
  const fullName     = user ? `${user.firstName} ${user.lastName}` : 'Alexander Vanderbilt';
  const role         = user?.role || 'General Manager';
  const propertyName = user?.propertyName || 'Grand Palace Residences';
  const email        = user?.email || 'admin@property.com';

  return (
    <ScreenWrapper withSafeArea>
      {/* header */}
      <View style={{ paddingTop: 4, paddingBottom: 20 }}>
        <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Outfit_700Bold' }}>Profile</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
          Account settings and preferences
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* user card */}
        <Card>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <AvatarCircle initials={initials} size={52} textClass="text-text-primary text-base font-brand-bold" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontFamily: 'Outfit_700Bold' }}>{fullName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <View style={{ backgroundColor: 'rgba(79,70,229,0.18)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ color: COLORS.accentSoft, fontSize: 9, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.8 }}>{role}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            {[
              { icon: 'mail-outline' as const,     text: email },
              { icon: 'business-outline' as const, text: propertyName },
              ...(user?.region ? [{ icon: 'location-outline' as const, text: user.region }] : []),
            ].map(({ icon, text }) => (
              <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={icon} size={13} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>{text}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* notifications */}
        <SectionLabel text="Notifications" />
        <Card>
          {[
            { icon: 'notifications-outline' as const, label: 'Push Notifications', desc: 'Critical sensor alerts', val: pushNotif, set: setPushNotif },
            { icon: 'sparkles-outline' as const,      label: 'AI Diagnostics',     desc: 'Anomaly detection',      val: smartAlerts, set: setSmartAlerts },
          ].map(({ icon, label, desc, val, set }, i, arr) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name={icon} size={17} color={COLORS.textSecondary} />
                <View>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontFamily: 'DMSans_400Regular' }}>{label}</Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 1 }}>{desc}</Text>
                </View>
              </View>
              <Switch
                value={val}
                onValueChange={v => { SafeHaptics.impact(); set(v); }}
                trackColor={{ false: COLORS.bgElevated, true: COLORS.accentIndigo }}
                thumbColor={Platform.OS === 'ios' ? undefined : COLORS.textPrimary}
              />
            </View>
          ))}
        </Card>

        {/* settings */}
        <SectionLabel text="Settings" />
        <Card>
          <Row icon="options-outline"       label="Alert Thresholds"   onPress={() => press('Alert Thresholds')} />
          <Row icon="wifi-outline"          label="Hardware Nodes"     onPress={() => press('Hardware Nodes')} />
          <Row icon="person-outline"        label="Edit Profile"       onPress={() => press('Edit Profile')} last />
        </Card>

        {/* security */}
        <SectionLabel text="Security" />
        <Card>
          <Row icon="shield-checkmark-outline" label="Security Logs"   onPress={() => press('Security Logs')} />
          <Row icon="key-outline"              label="API Keys"        onPress={() => press('API Keys')} last />
        </Card>

        {/* about */}
        <SectionLabel text="About" />
        <Card>
          <Row icon="information-circle-outline" label="App Version"    value="1.0.0" onPress={() => {}} />
          <Row icon="document-text-outline"      label="Privacy Policy" onPress={() => press('Privacy Policy')} />
          <Row icon="help-circle-outline"        label="Help & Support" onPress={() => press('Help & Support')} last />
        </Card>

        {/* logout */}
        <View style={{ marginTop: 28 }}>
          <Pressable
            onPress={handleLogout}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: confirmLogout ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.07)',
              borderWidth: 1,
              borderColor: confirmLogout ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.25)',
              borderRadius: 14, paddingVertical: 15,
            }}
            accessible accessibilityLabel={confirmLogout ? 'Confirm sign out' : 'Sign out'} accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={17} color={COLORS.statusCrit} />
            <Text style={{ color: COLORS.statusCrit, fontSize: 14, fontFamily: 'Outfit_600SemiBold', letterSpacing: 0.5 }}>
              {confirmLogout ? 'Tap again to confirm' : 'Sign Out'}
            </Text>
          </Pressable>
          {confirmLogout && (
            <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'DMSans_400Regular', textAlign: 'center', marginTop: 8 }}>
              This will end your session on this device.
            </Text>
          )}
        </View>

      </ScrollView>
      {Toast}
    </ScreenWrapper>
  );
}
