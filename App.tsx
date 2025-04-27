import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { GameProvider } from "./src/context/GameContext";
import { WebSocketProvider } from "./src/context/WebSocketContext";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "styles/theme";
import { SettingsProvider } from "./src/context/SettingsContext";
import "setimmediate";

const App = () => {
  // Create app content
  const AppContent = () => (
    <SettingsProvider>
      <ThemeProvider>
        <PaperProvider>
          <GameProvider>
            <NavigationContainer>
              <SafeAreaView
                style={[
                  styles.container,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <StatusBar
                  barStyle="light-content"
                  backgroundColor={theme.colors.background}
                />
                <AppNavigator />
              </SafeAreaView>
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
