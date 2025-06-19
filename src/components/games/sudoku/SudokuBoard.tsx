import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SudokuBoard as SudokuBoardType } from "../../../types";
import SudokuCell from "./SudokuCell";
import { useTheme } from "../../../context/ThemeContext";
import { SudokuSettings } from "../../../types/settings";

interface SudokuBoardProps {
  board: SudokuBoardType;
  selectedCell: [number, number] | null;
  onCellPress: (row: number, col: number) => void;
  settings: SudokuSettings;
  lockedNumber: number | null;
  cellFontSize: number;
  noteFontSize: number;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  selectedCell,
  onCellPress,
  settings,
  lockedNumber,
  cellFontSize,
  noteFontSize,
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { currentTheme } = useTheme();

  const outerPadding = 32;
  const maxBoardSize = isLandscape ? 280 : 360;
  const totalSize = Math.min(width - outerPadding, maxBoardSize);

  const borderThick = 2;
  const internalBorders = borderThick * 2;
  const boardSize = totalSize - internalBorders;
  const cellSize = boardSize / 9;

  const shouldHighlight = (rowIndex: number, colIndex: number): boolean => {
    if (!selectedCell && !lockedNumber) return false;

    // In number-first mode with locked number, don't highlight cells
    if (settings.numberFirst && lockedNumber !== null) {
      return false;
    }

    // In cell-first mode or when no number is locked
    if (selectedCell) {
      const [selectedRow, selectedCol] = selectedCell;
      const sameRow = settings.highlightPeer ? rowIndex === selectedRow : false;
      const sameCol = settings.highlightPeer ? colIndex === selectedCol : false;
      const sameBlock = settings.highlightPeer
        ? Math.floor(rowIndex / 3) === Math.floor(selectedRow / 3) &&
          Math.floor(colIndex / 3) === Math.floor(selectedCol / 3)
        : false;

      const selectedValue = board[selectedRow][selectedCol].value;
      const sameValue = settings.highlightSameNumbers
        ? selectedValue !== null &&
          board[rowIndex][colIndex].value !== null &&
          board[rowIndex][colIndex].value === selectedValue
        : false;

      return sameRow || sameCol || sameBlock || sameValue;
    }

    return false;
  };

  const isSelectedCell = (rowIndex: number, colIndex: number) => {
    return (
      selectedCell !== null &&
      selectedCell[0] === rowIndex &&
      selectedCell[1] === colIndex
    );
  };

  const isSimilarValue = (rowIndex: number, colIndex: number) => {
    if (!settings.highlightSameNumbers) return false;

    // In number-first mode with locked number
    if (settings.numberFirst && lockedNumber !== null) {
      return board[rowIndex][colIndex].value === lockedNumber;
    }

    // In cell-first mode
    if (selectedCell) {
      const selectedValue = board[selectedCell[0]][selectedCell[1]].value;
      return (
        selectedValue !== null &&
        board[rowIndex][colIndex].value !== null &&
        board[rowIndex][colIndex].value === selectedValue
      );
    }

    return false;
  };

  const isLockedNumberCell = (rowIndex: number, colIndex: number) => {
    if (!settings.numberFirst || lockedNumber === null) return false;

    return (
      board[rowIndex][colIndex].value !== null &&
      board[rowIndex][colIndex].value === lockedNumber &&
      !board[rowIndex][colIndex].isError
    );
  };

  return (
    <View
      style={[
        styles.board,
        {
          width: totalSize,
          height: totalSize,
          borderColor: currentTheme.colors.text,
          backgroundColor: currentTheme.colors.backgroundLight,
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
            const isLocked = isLockedNumberCell(rowIndex, colIndex);

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
                isLockedNumber={isLocked}
                size={cellSize}
                onPress={() => onCellPress(rowIndex, colIndex)}
                onFillNumber={
                  lockedNumber
                    ? (num) => onCellPress(rowIndex, colIndex)
                    : undefined
                }
                lockedNumber={lockedNumber}
                rightBorder={rightBorder}
                bottomBorder={bottomBorder}
                fontSize={cellFontSize}
                noteFontSize={noteFontSize}
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
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
});

export default SudokuBoard;
