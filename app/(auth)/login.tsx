import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loading = status === 'loading';

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch {
      // store sets error; UI shows it below
    }
  }

  return (
    <View className="flex-1 bg-surface-dark px-6 pt-20 pb-10 gap-6">
      <View className="gap-2">
        <Text className="text-slate-50 text-3xl font-bold">Welcome back</Text>
        <Text className="text-slate-400">
          Log in to keep watch over your places.
        </Text>
      </View>

      <View className="gap-4">
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          error={error}
        />
      </View>

      <Button label="Log in" onPress={onSubmit} loading={loading} />

      <View className="flex-row justify-between">
        <Link href="/(auth)/reset-password">
          <Text className="text-primary-600 font-medium">Forgot password?</Text>
        </Link>
        <Link href="/(auth)/register">
          <Text className="text-primary-600 font-medium">Create account</Text>
        </Link>
      </View>
    </View>
  );
}
