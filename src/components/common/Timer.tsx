import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { usePauseTimer } from "./TimerLogic";

interface TimerProps {
  initialTime?: number;
  isRunning: boolean;
  isPaused?: boolean;
}

const Timer: React.FC<TimerProps> = ({
  initialTime = 0,
  isRunning,
  isPaused = false,
}) => {
  const { currentTheme } = useTheme();
  const { timer, formatTime, pause, resume } = usePauseTimer({
    initialTime,
    autoStart: isRunning,
  });

  // Handle pause/resume when isPaused changes
  React.useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      resume();
    }
  }, [isPaused, pause, resume]);
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
