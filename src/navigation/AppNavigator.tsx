import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

import HomeScreen from "../screens/HomeScreen";
import StatsScreen from "../screens/StatsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GameScreen from "../screens/GameScreen";
import CompletionScreen from "../screens/CompletionScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AboutScreen from "../screens/AboutScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import HowToPlayScreen from "../screens/HowToPlayScreen";
import HowToPlayDetailScreen from "../screens/HowToPlayDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: "transparent",
        elevation: 0,
      },
      headerTintColor: "#333",
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Game" component={GameScreen} />
    <Stack.Screen name="Completion" component={CompletionScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="HelpCenter" component={FeedbackScreen} />
    <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
    <Stack.Screen name="HowToPlayDetail" component={HowToPlayDetailScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { currentTheme } = useTheme();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            if (route.name === "Stats") iconName = "stats-chart";
            else if (route.name === "Profile") iconName = "person";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: currentTheme.colors.primary,
          tabBarInactiveTintColor: currentTheme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: currentTheme.colors.backgroundDark,
            borderTopWidth: 0,
            elevation: 0,
          },
          sceneContainerStyle: {
            backgroundColor: currentTheme.colors.background, // Match app background
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default AppNavigator;
