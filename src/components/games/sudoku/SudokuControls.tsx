import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

interface SudokuControlsProps {
  onNumberPress: (number: number) => void;
  onErasePress: () => void;
  onNotesToggle: () => void;
  onUndoPress: () => void;
  onHintPress: () => void;
  isNoteMode: boolean;
  canUndo: boolean;
  remainingNumbers: number[];
  isLandscape: boolean;
  validNumbers: boolean[];
}

const SudokuControls: React.FC<SudokuControlsProps> = ({
  onNumberPress,
  onErasePress,
  onNotesToggle,
  onUndoPress,
  onHintPress,
  isNoteMode,
  canUndo,
  remainingNumbers,
  isLandscape,
  validNumbers,
}) => {
  // Numbers 1-9 for the number pad
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const { currentTheme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      maxHeight: 340,
    },
    landscapeContainer: {
      width: "100%",
      maxHeight: 300,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: currentTheme.spacing.medium,
    },
    actionButton: {
      backgroundColor: currentTheme.colors.backgroundLight,
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      marginHorizontal: 4,
    },
    iconText: {
      fontSize: 20,
      color: currentTheme.colors.text,
      textAlign: "center",
    },
    actionText: {
      color: currentTheme.colors.text,
      fontSize: 12,
      marginTop: 4,
    },
    disabledButton: {
      opacity: 0.5,
    },
    activeButton: {
      backgroundColor: currentTheme.colors.noteModeBackground,
    },
    numberPad: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: 80,
    },
    numberButton: {
      flex: 1,
      height: 60,
      backgroundColor: currentTheme.colors.backgroundLight,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      marginHorizontal: 2,
      padding: 2,
    },
    numberText: {
      fontSize: 24,
      fontWeight: "bold",
      color: currentTheme.colors.text,
    },
    remainingText: {
      fontSize: 10,
      color: currentTheme.colors.textSecondary,
      marginTop: 1,
    },
    disabledNumberButton: {
      opacity: 0.3,
    },
  });

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, !canUndo && styles.disabledButton]}
          onPress={onUndoPress}
          disabled={!canUndo}
        >
          <FontAwesome5
            name="undo"
            size={20}
            color={currentTheme.colors.text}
          />
          <Text style={styles.actionText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isNoteMode && styles.activeButton]}
          onPress={onNotesToggle}
        >
          <FontAwesome5 name="pen" size={20} color={currentTheme.colors.text} />
          <Text style={styles.actionText}>Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onErasePress}>
          <FontAwesome5
            name="eraser"
            size={20}
            color={currentTheme.colors.text}
          />
          <Text style={styles.actionText}>Erase</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onHintPress}>
          <FontAwesome5
            name="lightbulb"
            size={20}
            color={currentTheme.colors.text}
          />
          <Text style={styles.actionText}>Hint</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numberPad}>
        {numbers.map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberButton,
              !validNumbers[number - 1] && styles.disabledNumberButton,
            ]}
            onPress={() => onNumberPress(number)}
            disabled={isNoteMode && !validNumbers[number - 1]}
          >
            <Text style={styles.numberText}>{number}</Text>
            <Text style={styles.remainingText}>
              {remainingNumbers[number - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SudokuControls;
