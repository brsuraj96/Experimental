import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { theme } from "../../../styles/theme";

interface SudokuCellProps {
  value?: number | null;
  notes: boolean[];
  isFixed?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isSimilarValue?: boolean;
  isError?: boolean;
  size: number;
  onPress?: () => void;
  rightBorder?: boolean;
  bottomBorder?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  notes,
  isFixed,
  isSelected,
  isHighlighted,
  isSimilarValue,
  isError,
  size,
  onPress,
  rightBorder,
  bottomBorder,
}) => {
  // Render notes grid (3x3) when cell has no value
  const renderNotes = () => {
    if (value !== null) return null;

    const noteSize = size / 3;

    return (
      <View style={styles.notesContainer}>
        {notes.map((isActive, index) => {
          if (!isActive) return null;

          const noteValue = index + 1;
          const row = Math.floor(index / 3);
          const col = index % 3;

          return (
            <Text
              key={index}
              style={[
                styles.noteText,
                {
                  left: col * noteSize,
                  top: row * noteSize,
                  width: noteSize,
                  height: noteSize,
                },
              ]}
            >
              {noteValue}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRightWidth: rightBorder ? 2 : 1,
          borderBottomWidth: bottomBorder ? 2 : 1,
          borderLeftWidth: 0,
          borderTopWidth: 0,
          borderRightColor: rightBorder ? "#fff" : "rgba(255, 255, 255, 0.2)",
          borderBottomColor: bottomBorder ? "#fff" : "rgba(255, 255, 255, 0.2)",
        },
        isHighlighted && styles.highlightedCell,
        isSelected && styles.selectedCell,
        isError && styles.errorCell,
        isSimilarValue && styles.selectedCell,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {value ? (
        <Text
          style={[
            styles.value,
            isFixed && styles.fixedValue,
            isError && styles.errorValue,
          ]}
        >
          {value}
        </Text>
      ) : (
        renderNotes()
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    position: "relative",
  },
  highlightedCell: {
    backgroundColor: "rgba(77, 208, 225, 0.2)",
  },
  selectedCell: {
    backgroundColor: "rgba(255, 111, 97, 0.3)",
  },
  errorCell: {
    backgroundColor: "rgba(239, 83, 80, 0.2)",
  },
  value: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    width: "100%",
    height: "100%",
    textAlignVertical: "center",
  },
  fixedValue: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  errorValue: {
    color: theme.colors.error,
  },
  notesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noteText: {
    position: "absolute",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
});

export default SudokuCell;
