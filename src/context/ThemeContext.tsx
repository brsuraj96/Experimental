import React, { useContext, useMemo, useEffect, useState } from "react";
// import {
//   useSharedValue,
//   withTiming,
//   SharedValue,
// } from "react-native-reanimated";
import { Themes, Theme } from "../styles/theme";

export type ThemeType = keyof typeof Themes;

interface ThemeContextType {
  themeType: ThemeType;
  currentTheme: Theme;
  setThemeType: (themeType: ThemeType) => void;
  // transitionProgress: SharedValue<number>;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);
ThemeContext.displayName = "ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>("default");
  // const transitionProgress = useSharedValue(0);

  const currentTheme = useMemo(() => {
    return Themes[themeType] ?? Themes.default;
  }, [themeType]);

  // useEffect(() => {
  //   const themeKeys = Object.keys(Themes) as ThemeType[];
  //   const targetIndex = themeKeys.indexOf(themeType);
  //   transitionProgress.value = withTiming(targetIndex, { duration: 500 });
  // }, [themeType]);

  const value = useMemo(
    () => ({
      themeType,
      currentTheme,
      setThemeType,
      // transitionProgress,
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
