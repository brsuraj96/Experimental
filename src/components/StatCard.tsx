import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const StatCard = ({
  icon,
  title,
  value,
}: {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
}) => {
  const { currentTheme } = useTheme();
  const styles = createStyles(currentTheme);

  return (
    <View style={styles.card}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["currentTheme"]) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.cardBackground,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconContainer: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
    value: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
    },
  });

export default StatCard;
