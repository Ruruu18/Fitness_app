import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, LogBox, Animated } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import { AuthProvider } from './src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Animated: `useNativeDriver`',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
]);

// Enable react-native-screens
enableScreens();

const Stack = createNativeStackNavigator();

const customTransition = {
  gestureEnabled: true,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 400,
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Radley-Regular': require('./assets/fonts/Radley-Regular.ttf'),
          'Raleway-ExtraBold': require('./assets/fonts/Raleway-ExtraBold.ttf'),
          'Raleway-Bold': require('./assets/fonts/Raleway-Bold.ttf'),
          'Raleway-SemiBold': require('./assets/fonts/Raleway-SemiBold.ttf'),
        });
        setIsReady(true);
      } catch (e) {
        console.error('Error loading fonts:', e);
        setError(e.message);
      }
    }

    loadFonts();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading app: {error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer fallback={<Text>Loading...</Text>}>
            <StatusBar style="light" />
            <Stack.Navigator 
              initialRouteName="Onboarding"
              screenOptions={{
                headerShown: false
              }}
            >
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{
                  gestureEnabled: true,
                  ...customTransition
                }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{
                  gestureEnabled: true,
                  ...customTransition
                }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                  gestureEnabled: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    padding: 20,
  }
});

export default App;
