import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { GameProvider } from './src/context/GameContext';
import { theme } from './src/styles/theme';

const App = () => {
  return (
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;
