import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ResetPasswordScreen() {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!email) {
      Alert.alert('Missing email', 'Enter your account email.');
      return;
    }
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      Alert.alert(
        'Check your email',
        'If that account exists, a reset link is on the way.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-surface-dark px-6 pt-20 pb-10 gap-6">
      <View className="gap-2">
        <Text className="text-slate-900 text-3xl font-bold">Reset password</Text>
        <Text className="text-slate-500">
          We'll email you a link to set a new password.
        </Text>
      </View>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
      />

      <Button
        label="Send reset link"
        onPress={onSubmit}
        loading={submitting}
      />

      <Button
        label="Back to login"
        variant="ghost"
        onPress={() => router.replace('/(auth)/login')}
      />
    </View>
  );
}
