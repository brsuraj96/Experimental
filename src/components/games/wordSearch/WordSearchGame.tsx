import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  GameType,
  Difficulty,
  WordSearchLevel,
  WordSearchWord,
} from "../../../types";
import { theme } from "../../../styles/theme";
import { useSound } from "../../../hooks/useSound";
import WordSearchBoard from "./WordSearchBoard";
import WordList from "./WordList";
import { generateWordSearchLevel } from "./wordSearchGenerator";
import i18n from "../../../locales/i18n";

interface WordSearchGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: (moves: number) => void;
}

const WordSearchGame: React.FC<WordSearchGameProps> = ({
  difficulty,
  onMove,
  onComplete,
}) => {
  const [level, setLevel] = useState<WordSearchLevel | null>(null);
  const [moves, setMoves] = useState(0);
  const [startPoint, setStartPoint] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const { playSound } = useSound();

  // Generate a new level when difficulty changes
  useEffect(() => {
    const newLevel = generateWordSearchLevel(difficulty);
    setLevel(newLevel);
    setMoves(0);
  }, [difficulty]);

  // Check for completion
  useEffect(() => {
    if (level && level.words.every((word) => word.isFound)) {
      playSound("win");
      onComplete(moves);
    }
  }, [level, moves, onComplete, playSound]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!level) return;

      // If no start point is set, set it
      if (startPoint === null) {
        setStartPoint({ row, col });
        setCurrentPoint({ row, col });

        // Update board to highlight selected cell
        const updatedBoard = level.board.map((boardRow) =>
          boardRow.map((cell) => ({
            ...cell,
            isSelected: cell.row === row && cell.col === col,
            isHighlighted: false,
          }))
        );

        setLevel({ ...level, board: updatedBoard });
      }
      // If a start point is already set, this is the end point
      else {
        // Determine direction from start to end
        const direction = determineDirection(
          startPoint.row,
          startPoint.col,
          row,
          col
        );

        if (direction) {
          // Check if selected word matches any in the word list
          const selectedWord = getSelectedWord(
            level.board,
            startPoint.row,
            startPoint.col,
            direction
          );
          const foundWordIndex = level.words.findIndex(
            (word) =>
              word.row === startPoint.row &&
              word.col === startPoint.col &&
              word.direction === direction &&
              !word.isFound
          );

          if (foundWordIndex >= 0) {
            // Mark word as found
            const updatedWords = [...level.words];
            updatedWords[foundWordIndex] = {
              ...updatedWords[foundWordIndex],
              isFound: true,
            };

            // Update cells to show found word
            const updatedBoard = markFoundWord(
              level.board,
              startPoint.row,
              startPoint.col,
              direction
            );

            setLevel({
              ...level,
              words: updatedWords,
              board: updatedBoard,
            });

            setMoves((prev) => prev + 1);
            onMove();
            playSound("move");
          } else {
            // Wrong selection
            playSound("error");

            // Reset the board selection state
            const updatedBoard = level.board.map((boardRow) =>
              boardRow.map((cell) => ({
                ...cell,
                isSelected: false,
                isHighlighted: false,
              }))
            );

            setLevel({
              ...level,
              board: updatedBoard,
            });
          }
        }

        // Reset selection state
        setStartPoint(null);
        setCurrentPoint(null);
      }
    },
    [level, startPoint, onMove, playSound]
  );

  const handleCellDrag = useCallback(
    (row: number, col: number) => {
      if (!level || !startPoint) return;

      // Update current point
      setCurrentPoint({ row, col });

      // Determine direction from start to current
      const direction = determineDirection(
        startPoint.row,
        startPoint.col,
        row,
        col
      );

      if (direction) {
        // Highlight cells in the direction
        const updatedBoard = highlightCellsInDirection(
          level.board,
          startPoint.row,
          startPoint.col,
          direction
        );

        setLevel({
          ...level,
          board: updatedBoard,
        });
      }
    },
    [level, startPoint]
  );

  const handleCellRelease = useCallback(() => {
    if (!level || !startPoint || !currentPoint) return;

    // Determine direction from start to end
    const direction = determineDirection(
      startPoint.row,
      startPoint.col,
      currentPoint.row,
      currentPoint.col
    );

    if (direction) {
      // Check if selected word matches any in the word list
      const foundWordIndex = level.words.findIndex(
        (word) =>
          word.row === startPoint.row &&
          word.col === startPoint.col &&
          word.direction === direction &&
          !word.isFound
      );

      if (foundWordIndex >= 0) {
        // Mark word as found
        const updatedWords = [...level.words];
        updatedWords[foundWordIndex] = {
          ...updatedWords[foundWordIndex],
          isFound: true,
        };

        // Update cells to show found word
        const updatedBoard = markFoundWord(
          level.board,
          startPoint.row,
          startPoint.col,
          direction
        );

        setLevel({
          ...level,
          words: updatedWords,
          board: updatedBoard,
        });

        setMoves((prev) => prev + 1);
        onMove();
        playSound("move");
      } else {
        // Wrong selection
        playSound("error");

        // Reset the board selection state
        const updatedBoard = level.board.map((boardRow) =>
          boardRow.map((cell) => ({
            ...cell,
            isSelected: false,
            isHighlighted: false,
          }))
        );

        setLevel({
          ...level,
          board: updatedBoard,
        });
      }
    }

    // Reset selection state
    setStartPoint(null);
    setCurrentPoint(null);
  }, [level, startPoint, currentPoint, onMove, playSound]);

  if (!level) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.container}>
      <WordSearchBoard
        board={level.board}
        onCellPress={handleCellPress}
        onCellDrag={handleCellDrag}
        onCellRelease={handleCellRelease}
      />
      <WordList words={level.words} />
    </View>
  );
};

// Helper functions
const determineDirection = (
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): WordSearchWord["direction"] | null => {
  // Determine the direction based on start and end points
  const rowDiff = endRow - startRow;
  const colDiff = endCol - startCol;

  // Check if it's a straight line
  if (rowDiff === 0 && colDiff > 0) return "horizontal";
  if (rowDiff === 0 && colDiff < 0) return "horizontal-reverse";
  if (colDiff === 0 && rowDiff > 0) return "vertical";
  if (colDiff === 0 && rowDiff < 0) return "vertical-reverse";

  // Check if it's a diagonal
  if (Math.abs(rowDiff) === Math.abs(colDiff)) {
    if (rowDiff > 0 && colDiff > 0) return "diagonal-right";
    if (rowDiff > 0 && colDiff < 0) return "diagonal-left";
    if (rowDiff < 0 && colDiff > 0) return "diagonal-right-reverse";
    if (rowDiff < 0 && colDiff < 0) return "diagonal-left-reverse";
  }

  return null;
};

const getSelectedWord = (
  board: any[][],
  startRow: number,
  startCol: number,
  direction: string
): string => {
  let word = "";
  let currentRow = startRow;
  let currentCol = startCol;
  const gridSize = board.length;

  // Determine step direction
  let rowStep = 0;
  let colStep = 0;

  switch (direction) {
    case "horizontal":
      colStep = 1;
      break;
    case "horizontal-reverse":
      colStep = -1;
      break;
    case "vertical":
      rowStep = 1;
      break;
    case "vertical-reverse":
      rowStep = -1;
      break;
    case "diagonal-right":
      rowStep = 1;
      colStep = 1;
      break;
    case "diagonal-left":
      rowStep = 1;
      colStep = -1;
      break;
    case "diagonal-right-reverse":
      rowStep = -1;
      colStep = 1;
      break;
    case "diagonal-left-reverse":
      rowStep = -1;
      colStep = -1;
      break;
  }

  // Collect letters in the direction
  while (
    currentRow >= 0 &&
    currentRow < gridSize &&
    currentCol >= 0 &&
    currentCol < gridSize
  ) {
    word += board[currentRow][currentCol].letter;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return word;
};

const highlightCellsInDirection = (
  board: any[][],
  startRow: number,
  startCol: number,
  direction: string
): any[][] => {
  const updatedBoard = board.map((row) =>
    row.map((cell) => ({
      ...cell,
      isHighlighted: false,
    }))
  );

  let currentRow = startRow;
  let currentCol = startCol;
  const gridSize = board.length;

  // Determine step direction
  let rowStep = 0;
  let colStep = 0;

  switch (direction) {
    case "horizontal":
      colStep = 1;
      break;
    case "horizontal-reverse":
      colStep = -1;
      break;
    case "vertical":
      rowStep = 1;
      break;
    case "vertical-reverse":
      rowStep = -1;
      break;
    case "diagonal-right":
      rowStep = 1;
      colStep = 1;
      break;
    case "diagonal-left":
      rowStep = 1;
      colStep = -1;
      break;
    case "diagonal-right-reverse":
      rowStep = -1;
      colStep = 1;
      break;
    case "diagonal-left-reverse":
      rowStep = -1;
      colStep = -1;
      break;
  }

  // Highlight cells in the direction
  while (
    currentRow >= 0 &&
    currentRow < gridSize &&
    currentCol >= 0 &&
    currentCol < gridSize
  ) {
    if (currentRow === startRow && currentCol === startCol) {
      updatedBoard[currentRow][currentCol].isSelected = true;
    } else {
      updatedBoard[currentRow][currentCol].isHighlighted = true;
    }

    currentRow += rowStep;
    currentCol += colStep;
  }

  return updatedBoard;
};

const markFoundWord = (
  board: any[][],
  startRow: number,
  startCol: number,
  direction: string
): any[][] => {
  const updatedBoard = board.map((row) =>
    row.map((cell) => ({
      ...cell,
      isSelected: false,
      isHighlighted: false,
    }))
  );

  let currentRow = startRow;
  let currentCol = startCol;
  const gridSize = board.length;

  // Determine step direction
  let rowStep = 0;
  let colStep = 0;

  switch (direction) {
    case "horizontal":
      colStep = 1;
      break;
    case "horizontal-reverse":
      colStep = -1;
      break;
    case "vertical":
      rowStep = 1;
      break;
    case "vertical-reverse":
      rowStep = -1;
      break;
    case "diagonal-right":
      rowStep = 1;
      colStep = 1;
      break;
    case "diagonal-left":
      rowStep = 1;
      colStep = -1;
      break;
    case "diagonal-right-reverse":
      rowStep = -1;
      colStep = 1;
      break;
    case "diagonal-left-reverse":
      rowStep = -1;
      colStep = -1;
      break;
  }

  // Mark cells in the direction as found
  while (
    currentRow >= 0 &&
    currentRow < gridSize &&
    currentCol >= 0 &&
    currentCol < gridSize
  ) {
    updatedBoard[currentRow][currentCol].isFound = true;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return updatedBoard;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WordSearchGame;
