import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const loading = status === 'loading';

  async function onSubmit() {
    if (!displayName || !email || !password) {
      Alert.alert('Missing info', 'Fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    try {
      await register(email.trim(), password, displayName.trim());
    } catch {
      // store sets error
    }
  }

  return (
    <View className="flex-1 bg-surface-dark px-6 pt-20 pb-10 gap-6">
      <View className="gap-2">
        <Text className="text-slate-50 text-3xl font-bold">Create account</Text>
        <Text className="text-slate-400">
          Verification email follows in production.
        </Text>
      </View>

      <View className="gap-4">
        <TextField
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Alex Doe"
          autoCapitalize="words"
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          error={error}
        />
      </View>

      <Button label="Create account" onPress={onSubmit} loading={loading} />

      <Link href="/(auth)/login">
        <Text className="text-primary-600 font-medium text-center">
          Already have an account? Log in
        </Text>
      </Link>
    </View>
  );
}
