import React, { createContext, useContext, useState } from "react";

export interface Settings {
  timer: boolean;
  mistakeLimit: boolean;
  numberFirst: boolean;
  highlightPeer: boolean;
  highlightSameNumbers: boolean;
  autoRemoveNotes: boolean;
  autoComplete: boolean;
  completionRate: boolean;
  showScore: boolean;
  tournament: boolean;
  animatedScoring: boolean;
  lightningMode: boolean;
  remainingNumbers: boolean;
  smartHint: boolean;
  darkMode: boolean;
  audioEffect: boolean;
  vibration: boolean;
  notification: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>({
    timer: true,
    mistakeLimit: true,
    numberFirst: false,
    highlightPeer: true,
    highlightSameNumbers: true,
    autoRemoveNotes: true,
    autoComplete: false,
    completionRate: true,
    showScore: true,
    tournament: false,
    animatedScoring: true,
    lightningMode: false,
    remainingNumbers: true,
    smartHint: true,
    darkMode: false,
    audioEffect: true,
    vibration: true,
    notification: true,
  });

  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};
