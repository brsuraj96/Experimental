import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { theme } from '../../styles/theme';

interface TimerProps {
  startTime: number;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTime, isRunning }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      // Calculate initial elapsed time
      const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(initialElapsed);

      // Start the timer
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.clockIcon}>⏱️</Text>
      <Text style={styles.time}>{formatTime(elapsedTime)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  clockIcon: {
    fontSize: 16,
  },
  time: {
    marginLeft: 6,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Timer;
