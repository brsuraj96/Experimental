import React from "react";
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
  title: string;
  message?: string;
  onContinue: () => void;
  onNewGame: () => void;
  continueText?: string;
  newGameText?: string;
}

const FullScreenPrompt: React.FC<FullScreenPromptProps> = ({
  visible,
  title,
  message,
  onContinue,
  onNewGame,
  continueText = "Continue",
  newGameText = "New Game",
}) => {
  const { currentTheme } = useTheme();

  const styles = StyleSheet.create({
    modal: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: currentTheme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    container: {
      backgroundColor: currentTheme.colors.backgroundLight,
      borderRadius: 24,
      padding: currentTheme.spacing.xlarge,
      width: "85%",
      maxWidth: 400,
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
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: currentTheme.colors.text,
      marginBottom: currentTheme.spacing.large,
      textAlign: "center",
    },
    message: {
      fontSize: 16,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.xlarge,
      textAlign: "center",
    },
    button: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 16,
      alignItems: "center",
      backgroundColor: currentTheme.colors.primary,
    },
    buttonText: {
      color: currentTheme.colors.white,
      fontSize: 18,
      fontWeight: "600",
    },
    destructiveButton: {
      backgroundColor: currentTheme.colors.error,
    },
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modal} pointerEvents="auto">
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <TouchableOpacity style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>{continueText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.destructiveButton]}
            onPress={onNewGame}
          >
            <Text style={styles.buttonText}>{newGameText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FullScreenPrompt;
