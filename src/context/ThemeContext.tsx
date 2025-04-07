import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme, darkTheme } from '../styles/theme';

type ThemeType = typeof theme;

interface ThemeContextProps {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: theme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the device color scheme
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(
    deviceTheme === 'dark' ? darkTheme : theme
  );

  // Update theme when device theme changes
  useEffect(() => {
    setIsDarkMode(deviceTheme === 'dark');
    setCurrentTheme(deviceTheme === 'dark' ? darkTheme : theme);
  }, [deviceTheme]);

  // Toggle theme manually
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    setCurrentTheme(!isDarkMode ? darkTheme : theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
