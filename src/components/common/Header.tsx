import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from "react-native";
import { theme } from "../../styles/theme";
import { Difficulty } from "../../types";
import { Picker } from "@react-native-picker/picker";
import ThemeSelector from "../common/ThemeSelector";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  onHint?: () => void;
  onUndo?: () => void;
  onReset?: () => void;
  containerStyle?: ViewStyle;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  showDifficultySelector?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  isDarkMode?: boolean;
  onThemeChange?: (color: string) => void;
  onDarkModeToggle?: (value: boolean) => void;
}

const difficulties: Difficulty[] = [
  Difficulty.EASY,
  Difficulty.MEDIUM,
  Difficulty.HARD,
];

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightComponent,
  onHint,
  onUndo,
  onReset,
  containerStyle,
  onDifficultyChange,
  showDifficultySelector,
  onPause,
  onResume,
  isPaused = false,
  isDarkMode = true,
  onThemeChange,
  onDarkModeToggle,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    (subtitle as Difficulty) || Difficulty.EASY
  );
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("#0066FF");

  useEffect(() => {
    if (subtitle && subtitle !== selectedDifficulty) {
      setSelectedDifficulty(subtitle as Difficulty);
    }
  }, [subtitle]);

  const handleDifficultyChange = (itemValue: Difficulty) => {
    setSelectedDifficulty(itemValue);
    if (onDifficultyChange) {
      onDifficultyChange(itemValue);
    }
  };

  const renderDifficultySelector = () => {
    if (Platform.OS === "android") {
      return (
        <View style={styles.difficultyContainer}>
          <Picker
            selectedValue={selectedDifficulty}
            style={styles.picker}
            onValueChange={handleDifficultyChange}
          >
            {difficulties.map((difficulty) => (
              <Picker.Item
                key={difficulty}
                label={difficulty}
                value={difficulty}
              />
            ))}
          </Picker>
        </View>
      );
    } else {
      // For iOS and other platforms, keep the original TouchableOpacity selector
      return (
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            style={styles.difficultyButton}
            onPress={() => {
              const currentIndex = difficulties.indexOf(selectedDifficulty);
              const nextDifficulty =
                difficulties[(currentIndex + 1) % difficulties.length];
              if (onDifficultyChange) {
                onDifficultyChange(nextDifficulty);
              }
            }}
          >
            <View style={styles.dropdownContainer}>
              <Text style={styles.difficultyText}>{selectedDifficulty}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <>
      <View style={[styles.header, containerStyle]}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {onUndo && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onUndo}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.iconText}>↺</Text>
            </TouchableOpacity>
          )}

          {onHint && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onHint}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.iconText}>?</Text>
            </TouchableOpacity>
          )}

          {onReset && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onReset}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.iconText}>↻</Text>
            </TouchableOpacity>
          )}

          {onPause && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPauseDialog(true)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.iconText}>{isPaused ? "▶" : "⏸"}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowThemeSelector(!showThemeSelector)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text style={styles.iconText}>🎨</Text>
          </TouchableOpacity>

          {showDifficultySelector && renderDifficultySelector()}
          {rightComponent}
        </View>
      </View>

      {showThemeSelector && (
        <ThemeSelector
          selectedTheme={selectedTheme}
          isDarkMode={isDarkMode}
          onThemeSelect={(color) => {
            setSelectedTheme(color);
            onThemeChange?.(color);
          }}
          onDarkModeToggle={(value) => {
            onDarkModeToggle?.(value);
          }}
        />
      )}

      {showPauseDialog && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseDialog}>
            <Text style={styles.pauseTitle}>Game Paused</Text>
            <View style={styles.pauseButtons}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={() => {
                  setShowPauseDialog(false);
                  onResume?.();
                }}
              >
                <Text style={styles.pauseButtonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pauseButton, styles.restartButton]}
                onPress={() => {
                  setShowPauseDialog(false);
                  onReset?.();
                }}
              >
                <Text style={styles.pauseButtonText}>Restart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 44 : 10,
    paddingBottom: 10,
    paddingHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: theme.spacing.medium,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    marginLeft: theme.spacing.medium,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: "center",
  },
  difficultyContainer: {
    marginLeft: theme.spacing.small,
    marginRight: theme.spacing.small,
  },
  difficultyButton: {
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    color: theme.colors.text,
    fontSize: 6,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dropdownIcon: {
    color: theme.colors.text,
    fontSize: 6,
  },
  picker: {
    height: 50,
    width: 140,
    color: theme.colors.text,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
  },
  pauseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  pauseDialog: {
    backgroundColor: theme.colors.backgroundDark,
    padding: theme.spacing.large,
    borderRadius: 16,
    minWidth: 200,
    alignItems: "center",
  },
  pauseTitle: {
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
  },
  pauseButtons: {
    flexDirection: "column",
    gap: theme.spacing.medium,
  },
  pauseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  restartButton: {
    backgroundColor: theme.colors.error,
  },
  pauseButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Header;
