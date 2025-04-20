import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../../../styles/theme";

interface SudokuControlsProps {
  onNumberPress: (number: number) => void;
  onErasePress: () => void;
  onNotesToggle: () => void;
  onUndoPress: () => void;
  onHintPress: () => void;
  isNoteMode: boolean;
  canUndo: boolean;
  isLandscape: boolean;
}

const SudokuControls: React.FC<SudokuControlsProps> = ({
  onNumberPress,
  onErasePress,
  onNotesToggle,
  onUndoPress,
  onHintPress,
  isNoteMode,
  canUndo,
  isLandscape,
}) => {
  // Numbers 1-9 for the number pad
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, !canUndo && styles.disabledButton]}
          onPress={onUndoPress}
          disabled={!canUndo}
        >
          <Text style={styles.iconText}>↺</Text>
          <Text style={styles.actionText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isNoteMode && styles.activeButton]}
          onPress={onNotesToggle}
        >
          <Text style={styles.iconText}>✎</Text>
          <Text style={styles.actionText}>Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onErasePress}>
          <Text style={styles.iconText}>×</Text>
          <Text style={styles.actionText}>Erase</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onHintPress}>
          <Text style={styles.iconText}>?</Text>
          <Text style={styles.actionText}>Hint</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numberPad}>
        {numbers.map((number) => (
          <TouchableOpacity
            key={number}
            style={styles.numberButton}
            onPress={() => onNumberPress(number)}
          >
            <Text style={styles.numberText}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

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
    marginBottom: theme.spacing.medium,
  },
  actionButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  iconText: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: "center",
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  activeButton: {
    backgroundColor: "rgba(255, 111, 97, 0.3)",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  numberButton: {
    width: "32%",
    aspectRatio: 1,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: "2%",
  },
  numberText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
});

export default SudokuControls;
