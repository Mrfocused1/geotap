import { Alert, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  function onLogout() {
    Alert.alert('Log out?', 'You can log back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <View className="flex-1 bg-surface-dark px-6 pt-20 gap-6">
      <View className="gap-2">
        <Text className="text-slate-50 text-3xl font-bold">Settings</Text>
        <Text className="text-slate-400">Full settings ship in Plan 5.</Text>
      </View>
      {user ? (
        <View className="gap-1">
          <Text className="text-slate-300">Signed in as</Text>
          <Text className="text-slate-50 text-lg font-medium">
            {user.displayName ?? user.email}
          </Text>
          <Text className="text-slate-400 text-sm">{user.email}</Text>
        </View>
      ) : null}
      <Button label="Log out" variant="secondary" onPress={onLogout} />
    </View>
  );
}
