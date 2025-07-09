import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface FullScreenPromptProps {
  visible: boolean;
  gameName: string;
  timer?: string;
  difficulty?: string;
  onContinue: () => void;
  onNewGame: () => void;
  continueText?: string;
  newGameText?: string;
}

const FullScreenPrompt: React.FC<FullScreenPromptProps> = ({
  visible,
  gameName,
  timer,
  difficulty,
  onContinue,
  onNewGame,
  continueText = "Continue",
  newGameText = "New Game",
}) => {
  const { currentTheme } = useTheme();
  const formatTime = (s: number) =>
    `${((s / 60) | 0).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  const styles = StyleSheet.create({
    modal: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: currentTheme.colors.background, // No transparency
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    container: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 24,
    },
    timerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    gameName: {
      fontSize: 32,
      fontWeight: "700",
      color: currentTheme.colors.textSecondary,
      marginBottom: 64,
      textAlign: "center",
    },
    button: {
      width: "100%",
      paddingVertical: 18,
      borderRadius: 16,
      marginBottom: 16,
      alignItems: "center",
      backgroundColor: currentTheme.colors.primary,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    buttonText: {
      color: currentTheme.colors.white,
      fontSize: 20,
      fontWeight: "700",
    },
    buttonSubText: {
      color: currentTheme.colors.white,
      alignItems: "center",
      justifyContent: "center",
      fontSize: 15,
      fontWeight: "400",
      marginTop: 2,
    },
    newGameButton: {
      backgroundColor: currentTheme.colors.backgroundLight,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary,
      shadowColor: "transparent",
    },
    newGameButtonText: {
      color: currentTheme.colors.primary,
    },
    subContent: {
      color: currentTheme.colors.white,
    },
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modal} pointerEvents="auto">
        <View style={styles.container}>
          <Text style={styles.gameName}>{"Classic " + gameName}</Text>
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>{continueText}</Text>
            {(timer || difficulty) && (
              <View style={[styles.timerContainer, { marginTop: 4 }]}>
                {timer && (
                  <>
                    <FontAwesome5
                      name="clock"
                      size={14}
                      color={currentTheme.colors.white}
                    />
                    <Text style={styles.subContent}>
                      {formatTime(Number(timer))}
                    </Text>
                  </>
                )}
                {timer && difficulty && (
                  <Text style={styles.subContent}>-</Text>
                )}
                {difficulty && (
                  <Text style={styles.subContent}>{difficulty}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.newGameButton]}
            onPress={onNewGame}
          >
            <Text style={[styles.buttonText, styles.newGameButtonText]}>
              {newGameText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FullScreenPrompt;
