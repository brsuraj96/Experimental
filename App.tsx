import React, { useEffect, memo } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Platform } from "react-native";
import { LocalizationProvider } from "./src/context/LocalizationContext";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { GameProvider } from "./src/context/GameContext";
import { WebSocketProvider } from "./src/context/WebSocketContext";
import { Provider as PaperProvider } from "react-native-paper";
import { SettingsProvider } from "./src/context/SettingsContext";
import { TimerProvider } from "./src/context/TimerContext";
import "./src/locales/i18n";

// Move setimmediate polyfill to a separate initialization file
import "./src/utils/polyfills";

// Memoize ThemedApp component to prevent unnecessary re-renders
const ThemedApp = memo(() => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    StatusBar.setBarStyle(
      currentTheme.isDark ? "light-content" : "dark-content"
    );
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(currentTheme.colors.background);
    }
  }, [currentTheme]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <StatusBar />
      <AppNavigator />
    </SafeAreaView>
  );
});

ThemedApp.displayName = "ThemedApp";

// Move AppContent outside to prevent recreation on each render
const AppContent = () => (
  <LocalizationProvider>
    <TimerProvider initialTime={0} autoStart={true}>
      <SettingsProvider>
        <ThemeProvider>
          <PaperProvider>
            <GameProvider>
              <NavigationContainer>
                <ThemedApp />
              </NavigationContainer>
            </GameProvider>
          </PaperProvider>
        </ThemeProvider>
      </SettingsProvider>
    </TimerProvider>
  </LocalizationProvider>
);

// Main app structure with proper provider nesting
const App = () => {
  // Add WebSocketProvider for web platform only
  if (Platform.OS === "web") {
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
  },
});

export default App;
