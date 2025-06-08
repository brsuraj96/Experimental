import React, { useState, useEffect } from "react";

interface UsePauseTimerProps {
  initialTime?: number;
  autoStart?: boolean;
}

export const usePauseTimer = ({
  initialTime = 0,
  autoStart = true,
}: UsePauseTimerProps = {}) => {
  const [timer, setTimer] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [resumedAt, setResumedAt] = useState<number | null>(null);

  const lastTickRef = React.useRef<number>(Date.now());
  const timerRef = React.useRef<number>(timer);
  timerRef.current = timer;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      lastTickRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        if (elapsed > 0) {
          setTimer(timerRef.current + elapsed);
          lastTickRef.current = now;
        }
      }, 100); // Update more frequently for smoother transitions
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused]);

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    setResumedAt(Date.now());
    setPausedAt(null);
  };
  const pause = () => {
    // Immediately update all states to prevent any delays
    const currentTime = timerRef.current;
    setIsPaused(true);
    setPausedAt(currentTime);
    setIsRunning(false);
  };

  const resume = () => {
    // Reset the last tick when resuming to ensure accurate timing
    lastTickRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    setResumedAt(timerRef.current);
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setPausedAt(null);
    setResumedAt(null);
  };

  const reset = (newTime: number = 0) => {
    setTimer(newTime);
    setIsRunning(false);
    setIsPaused(false);
    setPausedAt(null);
    setResumedAt(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    timer,
    isRunning,
    isPaused,
    pausedAt,
    resumedAt,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime: () => formatTime(timer),
    formatPausedAt: () => (pausedAt !== null ? formatTime(pausedAt) : null),
    formatResumedAt: () => (resumedAt !== null ? formatTime(resumedAt) : null),
  };
};
