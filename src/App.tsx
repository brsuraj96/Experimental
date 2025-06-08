import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { TimerProvider } from "./context/TimerContext";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import PuzzleScreen from "./screens/GameScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Puzzle" component={PuzzleScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TimerProvider>
    </ThemeProvider>
  );
}
