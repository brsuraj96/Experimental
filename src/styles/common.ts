import { StyleSheet } from "react-native";
import { theme } from "./theme";

// Common styles used across the application
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },

  // Text styles
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
  },
  textSecondary: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: theme.colors.backgroundDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Button styles
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: theme.colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },

  // Row and column layout
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },

  // Input styles
  input: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },

  // Game grid styles
  gameGrid: {
    borderWidth: 2,
    borderColor: theme.colors.gridLines,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
  },
});
