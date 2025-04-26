import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SudokuBoard as SudokuBoardType } from "../../../types";
import SudokuCell from "./SudokuCell";
import { theme } from "../../../styles/theme";

interface SudokuBoardProps {
  board: SudokuBoardType;
  selectedCell: [number, number] | null;
  onCellPress: (row: number, col: number) => void;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  selectedCell,
  onCellPress,
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const outerPadding = 32;
  const maxBoardSize = isLandscape ? 280 : 360;
  const totalSize = Math.min(width - outerPadding, maxBoardSize);

  // There are 8 thin borders and 2 thick borders (between 3x3 blocks)
  // const borderThin = 1;
  const borderThick = 2;
  const internalBorders = borderThick * 2;
  const boardSize = totalSize - internalBorders;
  const cellSize = boardSize / 9;

  const shouldHighlight = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const [selectedRow, selectedCol] = selectedCell;

    const sameRow = row === selectedRow;
    const sameCol = col === selectedCol;
    const sameBlock =
      Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCol / 3);

    const selectedValue = board[selectedRow][selectedCol].value;
    const sameValue =
      selectedValue !== null && selectedValue === board[row][col].value;

    return sameRow || sameCol || sameBlock || sameValue;
  };

  const isSelectedCell = (rowIndex: number, colIndex: number) => {
    return (
      selectedCell !== null &&
      selectedCell[0] === rowIndex &&
      selectedCell[1] === colIndex
    );
  };

  const isSimilarValue = (rowIndex: number, colIndex: number) => {
    const selectedValue = selectedCell
      ? board[selectedCell[0]][selectedCell[1]].value
      : null;
    return (
      selectedValue !== null &&
      board[rowIndex][colIndex].value !== null &&
      board[rowIndex][colIndex].value === selectedValue
    );
  };

  return (
    <View
      style={[
        styles.board,
        {
          width: totalSize,
          height: totalSize,
        },
      ]}
    >
      {board.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((cell, colIndex) => {
            const rightBorder = colIndex % 3 === 2 && colIndex !== 8;
            const bottomBorder = rowIndex % 3 === 2 && rowIndex !== 8;

            const isSelected = isSelectedCell(rowIndex, colIndex);
            const isHighlighted = shouldHighlight(rowIndex, colIndex);
            const similarValue = isSimilarValue(rowIndex, colIndex);

            return (
              <SudokuCell
                key={`cell-${rowIndex}-${colIndex}`}
                value={cell.value}
                notes={cell.notes}
                isFixed={cell.isFixed}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isError={cell.isError}
                isSimilarValue={similarValue}
                size={cellSize}
                onPress={() => onCellPress(rowIndex, colIndex)}
                rightBorder={rightBorder}
                bottomBorder={bottomBorder}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    borderColor: theme.colors.text,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
});

export default SudokuBoard;
