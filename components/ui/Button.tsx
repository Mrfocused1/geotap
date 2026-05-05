import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import type { PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
} & Omit<PressableProps, 'onPress' | 'children' | 'disabled'>;

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  const base =
    'min-h-[48px] flex-row items-center justify-center rounded-card px-5';
  const styleByVariant: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600',
    secondary: 'bg-surface-light dark:bg-surface border border-slate-200',
    ghost: 'bg-transparent',
  };
  const labelByVariant: Record<ButtonVariant, string> = {
    primary: 'text-white font-semibold',
    secondary: 'text-primary-600 font-semibold',
    ghost: 'text-primary-600 font-semibold',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      className={`${base} ${styleByVariant[variant]} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <Text className={labelByVariant[variant]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
