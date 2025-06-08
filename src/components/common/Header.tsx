import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TouchableWithoutFeedback,
} from "react-native";
import { Difficulty } from "../../types";
import { Picker } from "@react-native-picker/picker";
import ThemeSelector from "./ThemeSelector";
import { useTheme } from "../../context/ThemeContext";
import { Settings } from "../../context/SettingsContext";
import Timer from "./Timer";
import { useTimer } from "../../context/TimerContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
  onHint?: () => void;
  onUndo?: () => void;
  onReset?: () => void;
  containerStyle?: ViewStyle;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  showDifficultySelector?: boolean;
  isThemeSelectorVisible?: boolean;
  settings: Settings;
  isGameCompleted: boolean;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  navigation?: NavigationProp<RootStackParamList>;
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
  showSettings,
  onHint,
  onUndo,
  onReset,
  containerStyle,
  onDifficultyChange,
  showDifficultySelector,
  isThemeSelectorVisible = false,
  settings,
  isGameCompleted,
  onPause,
  onResume,
  isPaused = false,
  navigation: navigationProp,
}) => {
  const { currentTheme } = useTheme();
  const navigation =
    navigationProp || useNavigation<NavigationProp<RootStackParamList>>();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(
    (subtitle as Difficulty) || Difficulty.EASY
  );
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { formatTime, timer } = useTimer();

  const selectorRef = useRef<View>(null);

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

  console.log(timer, "time in header");

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

  const styles = StyleSheet.create({
    header: {
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: Platform.OS === "ios" ? 44 : 10,
      paddingBottom: 10,
      paddingHorizontal: currentTheme.spacing.medium,
      backgroundColor: currentTheme.colors.backgroundDark,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
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
      marginRight: currentTheme.spacing.medium,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: currentTheme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      marginTop: 2,
    },
    actionButton: {
      marginLeft: currentTheme.spacing.medium,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: currentTheme.colors.backgroundLight,
      justifyContent: "center",
      alignItems: "center",
    },
    iconText: {
      fontSize: 20,
      color: currentTheme.colors.text,
      textAlign: "center",
    },
    difficultyContainer: {
      marginLeft: currentTheme.spacing.small,
      marginRight: currentTheme.spacing.small,
    },
    difficultyButton: {
      backgroundColor: currentTheme.colors.backgroundLight,
      paddingHorizontal: 2,
      paddingVertical: 2,
      borderRadius: 12,
    },
    difficultyText: {
      color: currentTheme.colors.text,
      fontSize: 6,
    },
    dropdownContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    dropdownIcon: {
      color: currentTheme.colors.text,
      fontSize: 6,
    },
    picker: {
      height: 50,
      width: 140,
      color: currentTheme.colors.text,
      backgroundColor: currentTheme.colors.backgroundLight,
      borderRadius: 12,
    },
    pauseOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: currentTheme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    pauseDialog: {
      backgroundColor: currentTheme.colors.backgroundLight,
      padding: currentTheme.spacing.large,
      borderRadius: 24,
      maxWidth: 340,
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    pauseTitle: {
      fontSize: 20,
      color: currentTheme.colors.text,
      marginBottom: currentTheme.spacing.medium,
      fontWeight: "600",
    },
    gameInfoContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: currentTheme.spacing.large,
    },
    gameInfoItem: {
      alignItems: "center",
    },
    gameInfoLabel: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      marginBottom: 4,
    },
    gameInfoValue: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: "600",
    },
    smartHintContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: currentTheme.spacing.large,
      padding: currentTheme.spacing.medium,
      backgroundColor: `${currentTheme.colors.primary}15`,
      borderRadius: 12,
      width: "100%",
    },
    smartHintIcon: {
      marginRight: currentTheme.spacing.small,
    },
    smartHintText: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      flex: 1,
    },
    pauseButtons: {
      width: "100%",
    },
    pauseButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      width: "100%",
      marginBottom: currentTheme.spacing.medium,
    },
    restartButton: {
      backgroundColor: currentTheme.colors.backgroundMedium,
    },
    pauseButtonText: {
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    themeOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9998,
    },
    themeSelectorContainer: {
      position: "absolute",
      right: 10,
      top: Platform.OS === "ios" ? 100 : 50,
      zIndex: 9999,
      elevation: 999,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });

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
              <FontAwesome5
                name="arrow-left"
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View>
          {settings.timer && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Timer
                initialTime={timer}
                isRunning={!isGameCompleted}
                isPaused={isPaused}
              />
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          {onUndo && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onUndo}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <FontAwesome5
                name="undo"
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          {onHint && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onHint}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <FontAwesome5
                name="question"
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          {onReset && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onReset}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <FontAwesome5
                name="sync"
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          {onPause && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (isPaused) {
                  // Resume game and hide dialog immediately
                  setShowPauseDialog(false);
                  onResume?.();
                } else {
                  // Pause game first, then show dialog
                  onPause?.();
                  setShowPauseDialog(true);
                }
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <FontAwesome5
                name={isPaused ? "play" : "pause"}
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          {isThemeSelectorVisible && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowThemeSelector(!showThemeSelector)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <FontAwesome5
                name="palette"
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
          {showDifficultySelector && renderDifficultySelector()}
          {showSettings && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onPause?.(); // Pause the game before navigating
                navigation.navigate("Settings");
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <FontAwesome5
                name="cog"
                size={20}
                color={currentTheme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showThemeSelector && (
        <TouchableWithoutFeedback onPress={() => setShowThemeSelector(false)}>
          <View style={styles.themeOverlay}>
            <View ref={selectorRef} style={styles.themeSelectorContainer}>
              <ThemeSelector />
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
      {showPauseDialog && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseDialog}>
            <Text style={styles.pauseTitle}>Pause</Text>

            <View style={styles.gameInfoContainer}>
              <View style={styles.gameInfoItem}>
                <Text style={styles.gameInfoLabel}>Time</Text>
                <Text style={styles.gameInfoValue}>{formatTime()}</Text>
              </View>
              <View style={styles.gameInfoItem}>
                <Text style={styles.gameInfoLabel}>Difficulty</Text>
                <Text style={styles.gameInfoValue}>{selectedDifficulty}</Text>
              </View>
            </View>

            <View style={styles.smartHintContainer}>
              <FontAwesome5
                name="lightbulb"
                size={16}
                color={currentTheme.colors.primary}
                style={styles.smartHintIcon}
              />
              <Text style={styles.smartHintText}>
                Smart Hint can help you solve Sudoku games.
              </Text>
            </View>

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

export default Header;
