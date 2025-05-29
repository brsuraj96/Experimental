import React, { useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { GameProvider } from "./src/context/GameContext";
import { WebSocketProvider } from "./src/context/WebSocketContext";
import { Provider as PaperProvider } from "react-native-paper";
import { SettingsProvider } from "./src/context/SettingsContext";
import "setimmediate";

// Separate component for the theme-aware content
const ThemedApp = () => {
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
};

// Main app structure with proper provider nesting
const App = () => {
  const AppContent = () => (
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
  );

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
