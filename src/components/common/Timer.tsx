import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTimer } from "../../context/TimerContext";

interface TimerProps {
  isPaused?: boolean;
}

const Timer: React.FC<TimerProps> = ({
  isPaused = false,
}): React.ReactElement => {
  const { currentTheme } = useTheme();
  const { formatTime } = useTimer();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: currentTheme.colors.backgroundLight,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      opacity: 1,
    },
    time: {
      marginLeft: 6,
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <FontAwesome5
        name={isPaused ? "pause" : "stopwatch"}
        size={16}
        color={currentTheme.colors.text}
      />
      <Text style={styles.time}>{formatTime()}</Text>
    </View>
  );
};

export default Timer;
