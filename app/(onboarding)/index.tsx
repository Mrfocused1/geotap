import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MapPin, ListChecks, BellRing } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Config } from '@/constants/config';

type Slide = {
  title: string;
  body: string;
  icon: 'pin' | 'list' | 'bell';
};

const SLIDES: Slide[] = [
  {
    title: 'Drop a Geofence',
    body: 'Pin a place — Home, Office, the Gym — and choose a radius. Trace Back watches that boundary in the background.',
    icon: 'pin',
  },
  {
    title: 'Build a Checklist',
    body: 'Attach a list of things you never want to leave behind: keys, wallet, charger, passport.',
    icon: 'list',
  },
  {
    title: 'Get a Reminder',
    body: 'When you leave, Trace Back checks what you forgot to tick off and sends a single notification. Tap it to see what is missing.',
    icon: 'bell',
  },
];

function SlideIcon({ icon }: { icon: Slide['icon'] }) {
  const props = { size: 56, color: '#0d9488', strokeWidth: 1.6 };
  if (icon === 'pin') return <MapPin {...props} />;
  if (icon === 'list') return <ListChecks {...props} />;
  return <BellRing {...props} />;
}

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const slide = SLIDES[index]!;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(Config.storage.ONBOARDING_KEY, 'true');
    router.replace('/(auth)/register');
  };

  const skipOnboarding = async () => {
    await AsyncStorage.setItem(Config.storage.ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  function next() {
    if (index < SLIDES.length - 1) setIndex(index + 1);
    else completeOnboarding();
  }

  return (
    <View className="flex-1 bg-surface-dark px-6 pt-16 pb-10">
      <View className="flex-row justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={skipOnboarding}
          className="min-h-[48px] min-w-[48px] items-end justify-center"
        >
          <Text className="text-slate-300 font-medium">Skip</Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center gap-6">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-900">
          <SlideIcon icon={slide.icon} />
        </View>
        <Text className="text-slate-50 text-3xl font-bold text-center">
          {slide.title}
        </Text>
        <Text className="text-slate-300 text-base text-center leading-6 max-w-sm">
          {slide.body}
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === index ? 'w-6 bg-primary-600' : 'w-2 bg-slate-600'
              }`}
            />
          ))}
        </View>
        <Button
          label={index < SLIDES.length - 1 ? 'Next' : 'Get Started'}
          onPress={next}
        />
      </View>
    </View>
  );
}
