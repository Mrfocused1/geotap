import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { Config } from '@/constants/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

type PermStatus = 'granted' | 'denied' | 'undetermined';

function PermissionPill({ status }: { status: PermStatus }) {
  const color =
    status === 'granted'
      ? '#22c55e'
      : status === 'denied'
      ? Colors.accent.DEFAULT
      : '#f59e0b';
  const label =
    status === 'granted' ? 'Granted' : status === 'denied' ? 'Denied' : 'Not set';
  return (
    <View
      className="px-2 py-1 rounded-pill"
      style={{ backgroundColor: `${color}22` }}
    >
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-4 mb-2 px-1">
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const notifPermission = useNotificationStore((s) => s.permissionStatus);
  const checkPermissions = useNotificationStore((s) => s.checkPermissions);

  const [locationStatus, setLocationStatus] = useState<PermStatus>('undetermined');
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    checkPermissions().catch(() => undefined);
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setLocationStatus(
        status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined'
      );
    });
  }, [checkPermissions]);

  const openSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() =>
      Alert.alert('Cannot open Settings', 'Please open Settings manually.')
    );
  }, []);

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }, [logout]);

  const confirmDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account?',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Not yet available',
              'Account deletion will be available in a future update.'
            ),
        },
      ]
    );
  }, []);

  const appVersion = Constants.expoConfig?.version ?? '—';

  return (
    <ScrollView
      className="flex-1 bg-surface-dark"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <View className="pt-12 pb-4">
        <Text className="text-slate-50 text-3xl font-bold">Settings</Text>
      </View>

      {/* Profile */}
      <SectionHeader title="Profile" />
      <View className="bg-surface rounded-card border border-slate-700 overflow-hidden">
        <View
          className="flex-row items-center px-4 border-b border-slate-700"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-400 w-20 text-sm">Name</Text>
          <Text className="text-slate-100 flex-1">
            {user?.displayName ?? '—'}
          </Text>
        </View>
        <View
          className="flex-row items-center px-4"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-400 w-20 text-sm">Email</Text>
          <Text className="text-slate-100 flex-1" numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
        </View>
      </View>

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <View className="bg-surface rounded-card border border-slate-700 overflow-hidden">
        <View
          className="flex-row items-center justify-between px-4"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Notifications enabled</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ false: '#334155', true: Colors.primary[600] }}
            thumbColor="#ffffff"
            accessibilityLabel="Toggle notifications"
          />
        </View>
      </View>

      {/* Permissions */}
      <SectionHeader title="Permissions" />
      <View className="bg-surface rounded-card border border-slate-700 overflow-hidden">
        <View
          className="flex-row items-center justify-between px-4 border-b border-slate-700"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Location</Text>
          <View className="flex-row items-center gap-2">
            <PermissionPill status={locationStatus} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open location settings"
              onPress={openSystemSettings}
              className="px-3 py-1 rounded-pill bg-slate-700"
            >
              <Text className="text-slate-300 text-xs">Settings</Text>
            </Pressable>
          </View>
        </View>
        <View
          className="flex-row items-center justify-between px-4"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Notifications</Text>
          <View className="flex-row items-center gap-2">
            <PermissionPill status={notifPermission} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notification settings"
              onPress={openSystemSettings}
              className="px-3 py-1 rounded-pill bg-slate-700"
            >
              <Text className="text-slate-300 text-xs">Settings</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* App */}
      <SectionHeader title="App" />
      <View className="bg-surface rounded-card border border-slate-700 overflow-hidden">
        <View
          className="flex-row items-center justify-between px-4"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Version</Text>
          <Text className="text-slate-400 text-sm">{appVersion}</Text>
        </View>
      </View>

      {/* Account */}
      <SectionHeader title="Account" />
      <View className="gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Privacy Policy"
          onPress={() => undefined}
          className="bg-surface rounded-card border border-slate-700 px-4 flex-row items-center justify-between"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Privacy Policy</Text>
          <Text className="text-slate-500 text-lg">›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Terms of Service"
          onPress={() => undefined}
          className="bg-surface rounded-card border border-slate-700 px-4 flex-row items-center justify-between"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Terms of Service</Text>
          <Text className="text-slate-500 text-lg">›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={confirmSignOut}
          className="bg-surface rounded-card border border-slate-700 px-4 flex-row items-center justify-between"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text className="text-slate-100">Sign out</Text>
          <Text className="text-slate-500 text-lg">›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          onPress={confirmDeleteAccount}
          className="bg-surface rounded-card border border-slate-700 px-4 flex-row items-center justify-between"
          style={{ minHeight: Config.a11y.MIN_TAP_TARGET }}
        >
          <Text style={{ color: Colors.accent.DEFAULT }}>Delete account</Text>
          <Text className="text-slate-500 text-lg">›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
