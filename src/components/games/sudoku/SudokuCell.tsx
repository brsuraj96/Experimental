import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

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
  const { currentTheme } = useTheme();

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

  const styles = StyleSheet.create({
    cell: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: currentTheme.colors.backgroundDark,
      position: "relative",
    },
    highlightedCell: {
      backgroundColor: `${currentTheme.colors.secondary}33`,
    },
    selectedCell: {
      backgroundColor: `${currentTheme.colors.primary}4D`,
    },
    errorCell: {
      backgroundColor: `${currentTheme.colors.error}33`,
    },
    value: {
      fontSize: 22,
      fontWeight: "600",
      color: currentTheme.colors.text,
      textAlign: "center",
      width: "100%",
      height: "100%",
      textAlignVertical: "center",
    },
    fixedValue: {
      fontWeight: "bold",
      color: currentTheme.colors.primary,
    },
    errorValue: {
      color: currentTheme.colors.error,
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
      lineHeight: 12,
      color: currentTheme.colors.textSecondary,
    },
  });

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
          borderRightColor: rightBorder
            ? currentTheme.colors.text
            : `${currentTheme.colors.text}33`, // 33 is 20% opacity in hex
          borderBottomColor: bottomBorder
            ? currentTheme.colors.text
            : `${currentTheme.colors.text}33`,
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

export default SudokuCell;
