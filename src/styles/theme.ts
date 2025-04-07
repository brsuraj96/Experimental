// Colors match the specifications from the requirements
const colors = {
  background: '#1E1E2F', // Dark, subtle base
  backgroundDark: '#191925',
  backgroundLight: '#2A2A40',
  primary: '#FF6F61', // Playful pinkish red
  secondary: '#4DD0E1', // Bright cyan
  success: '#81C784', // Green for wins
  error: '#EF5350', // Red for invalid moves
  text: '#FFFFFF',
  textSecondary: '#AAAABC',
  gridLines: '#333', // Thin but visible borders
};

const darkColors = {
  ...colors,
  // Slightly darker variations for dark mode
  backgroundLight: '#252538',
};

const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
  round: 9999,
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  isDark: false,
};

export const darkTheme = {
  colors: darkColors,
  spacing,
  borderRadius,
  isDark: true,
};

export type Theme = typeof theme;
