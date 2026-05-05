import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  secureTextEntry?: boolean;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function TextField({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const borderClass = error
    ? 'border-accent'
    : focused
    ? 'border-primary-600'
    : 'border-slate-300 dark:border-slate-600';

  return (
    <View className="gap-1">
      <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        className={`min-h-[48px] rounded-input border bg-white dark:bg-slate-800 px-4 text-slate-900 dark:text-slate-100 ${borderClass}`}
        placeholderTextColor="#94a3b8"
        {...rest}
      />
      {error ? (
        <Text className="text-accent-600 text-xs">{error}</Text>
      ) : null}
    </View>
  );
}
