import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { GameProvider } from './src/context/GameContext';
import { WebSocketProvider } from './src/context/WebSocketContext';
import { theme } from './src/styles/theme';

const App = () => {
  // Create app content
  const AppContent = () => (
    <ThemeProvider>
      <GameProvider>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.colors.background}
            />
            <AppNavigator />
          </SafeAreaView>
        </NavigationContainer>
      </GameProvider>
    </ThemeProvider>
  );

  // Add WebSocketProvider for web platform only
  if (Platform.OS === 'web') {
    return (
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    );
  }

  // Return without WebSocketProvider for mobile
  return <AppContent />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;
