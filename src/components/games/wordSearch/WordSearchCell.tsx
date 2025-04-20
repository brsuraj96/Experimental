import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WordSearchCell as WordSearchCellType } from "../../../types";
import { theme } from "../../../styles/theme";

interface WordSearchCellProps {
  cell: WordSearchCellType;
  size: number;
}

const WordSearchCell: React.FC<WordSearchCellProps> = ({ cell, size }) => {
  const cellStyle = {
    width: size,
    height: size,
    backgroundColor: getCellBackgroundColor(cell),
  };

  return (
    <View style={[styles.cell, cellStyle]}>
      <Text style={[styles.letter, getCellTextStyle(cell)]}>{cell.letter}</Text>
    </View>
  );
};

// Helper function to determine the background color based on cell state
const getCellBackgroundColor = (cell: WordSearchCellType) => {
  if (cell.isFound) {
    return theme.colors.success;
  }
  if (cell.isSelected) {
    return theme.colors.primary;
  }
  if (cell.isHighlighted) {
    return theme.colors.primaryLight;
  }
  return theme.colors.backgroundLight;
};

// Helper function to determine text style based on cell state
const getCellTextStyle = (cell: WordSearchCellType) => {
  if (cell.isFound || cell.isSelected) {
    return { color: theme.colors.textLight };
  }
  return { color: theme.colors.text };
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  letter: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
});

export default WordSearchCell;
