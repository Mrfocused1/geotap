import { Tabs } from 'expo-router';
import { Home, ListChecks, MapPin, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: Colors.surface.dark,
          borderTopColor: Colors.border.dark,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home stroke={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: 'Checklists',
          tabBarIcon: ({ color, size }) => (
            <ListChecks stroke={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="geofences"
        options={{
          title: 'Geofences',
          tabBarIcon: ({ color, size }) => <MapPin stroke={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings stroke={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
