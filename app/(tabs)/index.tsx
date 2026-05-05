import { Text, View } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  return (
    <View className="flex-1 bg-surface-dark px-6 pt-20 gap-3">
      <Text className="text-slate-50 text-3xl font-bold">
        Welcome, {user?.displayName ?? 'friend'}
      </Text>
      <Text className="text-slate-400">
        Home dashboard arrives in Plan 4. For now, navigation, auth, and
        onboarding all work.
      </Text>
    </View>
  );
}
