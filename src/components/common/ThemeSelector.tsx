import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Switch, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";
import { Themes } from "../../styles/theme";

const ThemeSelector: React.FC = () => {
  const { themeType, setThemeType, currentTheme } = useTheme();
  const { baseSettings, updateBaseSettings } = useSettings();
  const [localDarkMode, setLocalDarkMode] = useState(baseSettings.darkMode);

  // Update local state when baseSettings changes
  useEffect(() => {
    setLocalDarkMode(baseSettings.darkMode);
  }, [baseSettings.darkMode]);

  const themeOptions = Object.keys(Themes).map((key) => ({
    type: key as keyof typeof Themes,
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
    color: Themes[key as keyof typeof Themes].colors.background,
  }));

  // Create styles with current theme
  const themedStyles = StyleSheet.create({
    container: {
      maxWidth: 300,
      borderRadius: 12,
      padding: 12,
      backgroundColor: currentTheme.colors.backgroundMedium,
    },
    colorContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
      justifyContent: "center",
    },
    colorButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      margin: 4,
    },
    selectedColor: {
      borderColor: currentTheme.colors.text,
    },
    colorName: {
      color: currentTheme.colors.text,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 4,
    },
    syncContainer: {
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
      paddingTop: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 8,
      marginTop: 8,
    },
    themeOptionContainer: {
      alignItems: "center",
      width: 56,
    },
    checkIcon: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -8 }, { translateY: -8 }],
    },
  });

  const isDarkTheme = themeType === "dark";

  const handleDarkModeChange = (value: boolean) => {
    // Update local state immediately for responsive UI
    setLocalDarkMode(value);
    // Update the dark mode setting
    updateBaseSettings({ darkMode: value });
  };

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.colorContainer}>
        {themeOptions.map((option) => (
          <View key={option.type} style={themedStyles.themeOptionContainer}>
            <TouchableOpacity
              style={[
                themedStyles.colorButton,
                { backgroundColor: option.color },
                themeType === option.type && themedStyles.selectedColor,
              ]}
              onPress={() => {
                // Only update the theme type, don't update dark mode setting
                setThemeType(option.type);
              }}
            >
              {themeType === option.type && (
                <FontAwesome5
                  name="check"
                  size={16}
                  color={currentTheme.colors.text}
                  style={themedStyles.checkIcon}
                />
              )}
            </TouchableOpacity>
            <Text style={themedStyles.colorName}>{option.label}</Text>
          </View>
        ))}
      </View>
      <View style={themedStyles.syncContainer}>
        <Text style={themedStyles.colorName}>Dark Mode:</Text>
        <Switch
          value={localDarkMode}
          onValueChange={handleDarkModeChange}
          trackColor={{
            false: currentTheme.colors.border,
            true: currentTheme.colors.primary,
          }}
          thumbColor={currentTheme.colors.background}
          ios_backgroundColor={currentTheme.colors.border}
        />
      </View>
    </View>
  );
};

export default ThemeSelector;
