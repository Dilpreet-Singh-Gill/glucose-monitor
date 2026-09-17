import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/utils/theme';
import { View } from 'react-native';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.accent,
    background: Colors.bg,
    card: Colors.bg,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.accent,
  },
};

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        <AuthProvider>
          <NavigationContainer theme={navTheme}>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}