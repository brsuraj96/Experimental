import React, { createContext, useContext, ReactNode } from "react";
import { usePauseTimer } from "../components/common/TimerLogic";

interface TimerContextType {
  timer: number;
  isRunning: boolean;
  isPaused: boolean;
  pausedAt: number | null;
  resumedAt: number | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
  formatTime: () => string;
  formatPausedAt: () => string | null;
  formatResumedAt: () => string | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
  initialTime?: number;
  autoStart?: boolean;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  initialTime = 0,
  autoStart = false,
}) => {
  const timerLogic = usePauseTimer({
    initialTime,
    autoStart,
  });

  return (
    <TimerContext.Provider value={timerLogic}>{children}</TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
