import React, { useContext, useMemo, useEffect, useState } from "react";
import { Themes, Theme } from "../styles/theme";
import { useSettings } from "./SettingsContext";

export type ThemeType = keyof typeof Themes;

interface ThemeContextType {
  themeType: ThemeType;
  currentTheme: Theme;
  setThemeType: (themeType: ThemeType) => void;
  toggleTheme: () => void; // Add toggleTheme to fix missing property error
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);
ThemeContext.displayName = "ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setInternalThemeType] = useState<ThemeType>("default");
  const { baseSettings, updateBaseSettings } = useSettings();

  // Update theme based on dark mode setting
  useEffect(() => {
    // Only update theme if it's different from the current dark mode setting
    const shouldBeDark = baseSettings.darkMode;
    const isCurrentlyDark = themeType === "dark";
    if (shouldBeDark !== isCurrentlyDark) {
      setInternalThemeType(shouldBeDark ? "dark" : "default");
    }
  }, [baseSettings.darkMode]);

  // Update font size based on settings
  useEffect(() => {
    // Update font size logic here if needed
  }, [baseSettings.fontSize]);

  const currentTheme = useMemo(() => {
    return Themes[themeType] ?? Themes.default;
  }, [themeType]);

  const toggleTheme = () => {
    setInternalThemeType((prevThemeType) =>
      prevThemeType === "dark" ? "default" : "dark"
    );
  };

  const value = useMemo(
    () => ({
      themeType,
      currentTheme,
      setThemeType: (newThemeType: ThemeType) => {
        // When manually setting theme, also update dark mode setting
        const willBeDark = newThemeType === "dark";
        if (willBeDark !== baseSettings.darkMode) {
          updateBaseSettings({ darkMode: willBeDark });
        }
        setInternalThemeType(newThemeType);
      },
      toggleTheme,
    }),
    [themeType, currentTheme, baseSettings.darkMode, updateBaseSettings]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
