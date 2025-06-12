import { useState, useEffect, useCallback, useRef } from "react";

interface TimerOptions {
  initialTime?: number;
  autoStart?: boolean;
}

interface TimerResult {
  time: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimer = ({
  initialTime = 0,
  autoStart = false,
}: TimerOptions = {}): TimerResult => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  }, [isRunning]);

  const pauseTimer = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  }, [isRunning]);

  const resumeTimer = useCallback(() => {
    if (!isRunning) {
      startTimer();
    }
  }, [isRunning, startTimer]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTime(initialTime);
  }, [initialTime, stopTimer]);

  useEffect(() => {
    if (autoStart) {
      startTimer();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, startTimer]);

  return {
    time,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  };
};
