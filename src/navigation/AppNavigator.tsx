import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import HomeScreen from "../screens/HomeScreen";
import GameScreen from "../screens/GameScreen";
import CompletionScreen from "../screens/CompletionScreen";
import SettingsScreen from "screens/SettingsScreen";
import { useTheme } from "../context/ThemeContext";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { currentTheme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: currentTheme.colors.background },
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        }),
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Completion" component={CompletionScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
