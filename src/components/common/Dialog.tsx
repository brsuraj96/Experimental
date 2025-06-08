import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onDismiss?: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const { currentTheme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
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
    dialog: {
      backgroundColor: currentTheme.colors.backgroundLight,
      padding: currentTheme.spacing.large,
      borderRadius: 24,
      width: "80%",
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
    title: {
      fontSize: 20,
      color: currentTheme.colors.text,
      marginBottom: currentTheme.spacing.medium,
      fontWeight: "600",
      textAlign: "center",
    },
    message: {
      fontSize: 16,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.large,
      textAlign: "center",
    },
    buttonContainer: {
      width: "100%",
    },
    button: {
      backgroundColor: currentTheme.colors.backgroundMedium,
      borderRadius: 12,
      paddingVertical: 12,
      marginBottom: 10,
      width: "100%",
    },
    buttonText: {
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    cancelButton: {
      backgroundColor: currentTheme.colors.backgroundLight,
    },
    destructiveButton: {
      backgroundColor: currentTheme.colors.error,
    },
    destructiveButtonText: {
      color: currentTheme.colors.white,
    },
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}

              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === "cancel" && styles.cancelButton,
                      button.style === "destructive" &&
                        styles.destructiveButton,
                    ]}
                    onPress={button.onPress}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === "destructive" &&
                          styles.destructiveButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Dialog;
