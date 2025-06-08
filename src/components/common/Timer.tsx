import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTimer } from "../../context/TimerContext";

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
  const { formatTime, pause, resume, isRunning: timerRunning } = useTimer();

  // Handle pause/resume transitions immediately
  React.useEffect(() => {
    const handlePauseResume = () => {
      if (isPaused && timerRunning) {
        pause();
      } else if (!isPaused && !timerRunning) {
        resume();
      }
    };
    handlePauseResume();
  }, [isPaused, timerRunning, pause, resume]);
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
