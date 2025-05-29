import React, { useContext, useMemo, useEffect, useState } from "react";
import { Themes, Theme } from "../styles/theme";
import { useSettings } from "./SettingsContext";

export type ThemeType = keyof typeof Themes;

interface ThemeContextType {
  themeType: ThemeType;
  currentTheme: Theme;
  setThemeType: (themeType: ThemeType) => void;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);
ThemeContext.displayName = "ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setInternalThemeType] = useState<ThemeType>("default");
  const { settings } = useSettings();

  // Update theme based on dark mode setting
  useEffect(() => {
    if (settings.darkMode) {
      setInternalThemeType("dark");
    } else {
      setInternalThemeType("default");
    }
  }, [settings.darkMode]);

  const currentTheme = useMemo(() => {
    return Themes[themeType] ?? Themes.default;
  }, [themeType]);

  const value = useMemo(
    () => ({
      themeType,
      currentTheme,
      setThemeType: setInternalThemeType,
    }),
    [themeType, currentTheme]
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
