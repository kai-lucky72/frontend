import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const getTabScreens = () => {
    switch (user?.role) {
      case 'admin':
        return [
          {
            name: 'dashboard',
            title: 'Dashboard',
            icon: 'chart.bar.fill',
          },
          {
            name: 'users',
            title: 'Users',
            icon: 'person.2.fill',
          },
          {
            name: 'settings',
            title: 'Settings',
            icon: 'gearshape.fill',
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: 'person.circle.fill',
          },
        ];
      case 'manager':
        return [
          {
            name: 'dashboard',
            title: 'Dashboard',
            icon: 'chart.bar.fill',
          },
          {
            name: 'agents',
            title: 'Agents',
            icon: 'person.2.fill',
          },
          {
            name: 'attendance',
            title: 'Attendance',
            icon: 'clock.fill',
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: 'person.circle.fill',
          },
        ];
      case 'agent':
        return [
          {
            name: 'dashboard',
            title: 'Dashboard',
            icon: 'house.fill',
          },
          {
            name: 'attendance',
            title: 'Attendance',
            icon: 'clock.fill',
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: 'person.circle.fill',
          },
        ];
      default:
        return [
          {
            name: 'dashboard',
            title: 'Dashboard',
            icon: 'house.fill',
          },
          {
            name: 'profile',
            title: 'Profile',
            icon: 'person.circle.fill',
          },
        ];
    }
  };

  const tabScreens = getTabScreens();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name={screen.icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
