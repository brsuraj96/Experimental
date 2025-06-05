import React, { useState, useEffect, useRef } from "react";
import { Text, StyleSheet, View, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

interface TimerProps {
  startTime: number; // Initial time for the timer (e.g., loaded from a previous session)
  isRunning: boolean; // Controls whether the timer is actively counting up
  gameId?: string; // Unique ID for storing/retrieving timer state
  externalTime?: number; // Optional: If provided, the timer displays this value instead of its internal count
}

const Timer: React.FC<TimerProps> = ({
  startTime,
  isRunning,
  gameId = "default",
  externalTime,
}) => {
  const { currentTheme } = useTheme();
  const storagePrefix = `timer_${gameId}_`;

  // State to hold the time to be displayed
  const [displayedTime, setDisplayedTime] = useState<number>(startTime);

  // Refs for internal timer management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // This ref stores the "absolute" start time of the current continuous running segment
  // It's Date.now() minus the total time that *should* have elapsed if there were no pauses.
  const timerStartBaseRef = useRef<number>(Date.now() - startTime * 1000);
  // This accumulates the total duration the timer has been paused
  const totalPausedDurationRef = useRef<number>(0);
  // Stores the timestamp when the timer was last paused
  const lastPauseTimestampRef = useRef<number | null>(null);

  // Helper to get storage keys
  const getStorageKeys = () => ({
    totalElapsed: `${storagePrefix}total_elapsed`,
    lastPauseStart: `${storagePrefix}last_pause_start`,
    totalPaused: `${storagePrefix}total_paused`,
  });

  // Effect for loading initial state from storage
  useEffect(() => {
    const loadState = async () => {
      try {
        const { totalElapsed, lastPauseStart, totalPaused } = getStorageKeys();
        let savedElapsed: string | null = null;
        let savedPauseStart: string | null = null;
        let savedTotalPaused: string | null = null;

        if (Platform.OS === "web") {
          savedElapsed = localStorage.getItem(totalElapsed);
          savedPauseStart = localStorage.getItem(lastPauseStart);
          savedTotalPaused = localStorage.getItem(totalPaused);
        } else {
          const values = await AsyncStorage.multiGet([
            totalElapsed,
            lastPauseStart,
            totalPaused,
          ]);
          savedElapsed = values[0][1];
          savedPauseStart = values[1][1];
          savedTotalPaused = values[2][1];
        }

        let initialTime = startTime; // Start with prop initial time
        if (savedElapsed) {
          const parsedElapsed = parseInt(savedElapsed, 10);
          if (!isNaN(parsedElapsed) && parsedElapsed >= 0) {
            initialTime = parsedElapsed; // Override with saved elapsed time
          }
        }
        setDisplayedTime(initialTime);

        if (savedTotalPaused) {
          const parsedTotalPaused = parseInt(savedTotalPaused, 10);
          if (!isNaN(parsedTotalPaused)) {
            totalPausedDurationRef.current = parsedTotalPaused;
          }
        }

        if (savedPauseStart) {
          const parsedLastPauseStart = parseInt(savedPauseStart, 10);
          if (!isNaN(parsedLastPauseStart)) {
            lastPauseTimestampRef.current = parsedLastPauseStart;
          }
        }

        // Adjust timer start base based on loaded initial time and total paused duration
        timerStartBaseRef.current = Date.now() - initialTime * 1000 - totalPausedDurationRef.current;
      } catch (error) {
        console.error("Error loading timer state:", error);
      }
    };

    loadState();
  }, [gameId, startTime]); // Depend on gameId and startTime for re-initialization

  // Main timer logic: starts, stops, and updates the displayed time
  useEffect(() => {
    // Clear any existing interval to prevent multiple timers running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // If externalTime is provided, the internal timer should not run.
    // The displayedTime will be controlled by the externalTime prop.
    if (externalTime !== undefined) {
      setDisplayedTime(externalTime);
      return;
    }

    // If the timer is NOT running (i.e., paused)
    if (!isRunning) {
      // Record the time when it was paused, if not already recorded
      if (lastPauseTimestampRef.current === null) {
        lastPauseTimestampRef.current = Date.now();
      }
      // Save the current state of the timer
      const saveState = async () => {
        try {
          const { totalElapsed, lastPauseStart, totalPaused } = getStorageKeys();
          const currentElapsedTime = displayedTime; // Use displayedTime as the value to save

          if (Platform.OS === "web") {
            localStorage.setItem(totalElapsed, currentElapsedTime.toString());
            if (lastPauseTimestampRef.current !== null) {
              localStorage.setItem(lastPauseStart, lastPauseTimestampRef.current.toString());
            }
            localStorage.setItem(totalPaused, totalPausedDurationRef.current.toString());
          } else {
            const itemsToSave = [
              [totalElapsed, currentElapsedTime.toString()],
              [totalPaused, totalPausedDurationRef.current.toString()],
            ];
            if (lastPauseTimestampRef.current !== null) {
              itemsToSave.push([lastPauseStart, lastPauseTimestampRef.current.toString()]);
            }
            await AsyncStorage.multiSet(itemsToSave);
          }
        } catch (error) {
          console.error("Error saving timer state on pause:", error);
        }
      };
      saveState();
      return; // Stop here, don't start the interval
    }

    // If the timer IS running (or resuming)
    // If there was a pause timestamp, calculate the duration of the last pause
    if (lastPauseTimestampRef.current !== null) {
      const currentPauseDuration = Date.now() - lastPauseTimestampRef.current;
      totalPausedDurationRef.current += currentPauseDuration;
      lastPauseTimestampRef.current = null; // Clear the pause timestamp as we are now running
    }

    // Recalculate timerStartBaseRef to reflect the current elapsed time
    // This is crucial for resuming correctly.
    // It's the current "now" minus the time that *should have elapsed* up to this point,
    // considering all pauses.
    timerStartBaseRef.current = Date.now() - displayedTime * 1000 - totalPausedDurationRef.current;


    // Start the interval
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      // Calculate total elapsed milliseconds since the absolute start of the game,
      // then subtract the total time spent in pauses.
      const rawElapsed = now - timerStartBaseRef.current;
      const calculatedElapsedTime = Math.floor((rawElapsed - totalPausedDurationRef.current) / 1000);
      setDisplayedTime(calculatedElapsedTime);
    }, 1000);

    // Cleanup function: runs when the component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Save final state when component unmounts or isRunning changes
      // This ensures the current displayedTime is saved even if it's not paused
      const saveFinalState = async () => {
        try {
          const { totalElapsed, lastPauseStart, totalPaused } = getStorageKeys();
          const currentElapsedTime = displayedTime;

          if (Platform.OS === "web") {
            localStorage.setItem(totalElapsed, currentElapsedTime.toString());
            localStorage.removeItem(lastPauseStart); // Clear last pause start if running
            localStorage.setItem(totalPaused, totalPausedDurationRef.current.toString());
          } else {
            await AsyncStorage.multiSet([
              [totalElapsed, currentElapsedTime.toString()],
              [totalPaused, totalPausedDurationRef.current.toString()],
            ]);
            await AsyncStorage.removeItem(lastPauseStart);
          }
        } catch (error) {
          console.error("Error saving final timer state:", error);
        }
      };
      saveFinalState();
    };
  }, [isRunning, externalTime, gameId, displayedTime]); // Add displayedTime here to ensure saveFinalState gets the latest value

  // Format time display
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: currentTheme.colors.backgroundLight,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
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
        name="stopwatch"
        size={16}
        color={currentTheme.colors.text}
      />
      <Text style={styles.time}>
        {formatTime(externalTime !== undefined ? externalTime : displayedTime)}
      </Text>
    </View>
  );
};

export default Timer;