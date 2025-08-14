import { useCallback, useEffect, useRef, useState } from "react";

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

  const lastTickRef = useRef<number>(Date.now());
  const timerRef = useRef<number>(timer);
  timerRef.current = timer;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      lastTickRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        if (elapsed > 0) {
          setTimer((prev) => prev + elapsed); // stable update
          lastTickRef.current = now;
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setResumedAt(Date.now());
    setPausedAt(null);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    setPausedAt(timerRef.current);
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    lastTickRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    setResumedAt(timerRef.current);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setPausedAt(null);
    setResumedAt(null);
  }, []);

  const reset = useCallback((newTime: number = 0) => {
    setTimer(newTime);
    setIsRunning(false);
    setIsPaused(false);
    setPausedAt(null);
    setResumedAt(null);
    // Reset the last tick reference to prevent timer jumping
    lastTickRef.current = Date.now();
  }, []);

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
