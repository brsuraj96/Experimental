import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Text,
} from "react-native";
import { theme } from "../../styles/theme";

interface ThemeSelectorProps {
  selectedTheme: string;
  isDarkMode: boolean;
  onThemeSelect?: (color: string) => void;
  onDarkModeToggle?: (value: boolean) => void;
}

const themeColors = [
  { color: "#0066FF", name: "Blue" },
  { color: "#FFF3E0", name: "Beige" },
  { color: "#E8F5E9", name: "Green" },
  { color: "#000000", name: "Black" },
  { color: "#1A237E", name: "Navy" },
];

const ThemeSelector = ({
  selectedTheme,
  isDarkMode,
  onThemeSelect,
  onDarkModeToggle,
}: ThemeSelectorProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.colorContainer}>
        {themeColors.map(({ color, name }) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedTheme === color && styles.selectedColor,
            ]}
            onPress={() => onThemeSelect?.(color)}
          >
            <Text style={styles.colorName}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.syncContainer}>
        <Switch
          value={isDarkMode}
          onValueChange={onDarkModeToggle}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#0066FF" : "#f4f3f4"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    right: 10,
    backgroundColor: theme.colors.backgroundDark,
    borderRadius: 12,
    padding: 12,
    zIndex: 1000,
  },
  colorContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColor: {
    borderColor: "#fff",
  },
  colorName: {
    color: "#fff",
    fontSize: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  syncContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 12,
    alignItems: "center",
  },
});

export default ThemeSelector;
