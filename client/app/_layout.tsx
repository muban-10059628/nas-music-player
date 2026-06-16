import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="index" options={{ title: "" }} />
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        <Stack.Screen name="player" options={{ title: "Now Playing", animation: 'slide_from_bottom' }} />
        <Stack.Screen name="album" options={{ title: "Album" }} />
        <Stack.Screen name="artist" options={{ title: "Artist" }} />
        <Stack.Screen name="queue" options={{ title: "