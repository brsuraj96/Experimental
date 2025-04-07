import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Difficulty } from '../../../types';
import SudokuBoard from './SudokuBoard';
import SudokuControls from './SudokuControls';
import { generateSudoku, validateSudoku, isGameComplete, getHint } from './logic';
import { theme } from '../../../styles/theme';
import useSound from '../../../hooks/useSound';

interface SudokuGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: 'portrait' | 'landscape';
}

const SudokuGame: React.FC<SudokuGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
}) => {
  const { playSound } = useSound();
  const [board, setBoard] = useState(() => generateSudoku(difficulty));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [history, setHistory] = useState<Array<{ board: typeof board; selected: [number, number] | null }>>([]);

  // Initialize the game when difficulty changes
  useEffect(() => {
    const newBoard = generateSudoku(difficulty);
    setBoard(newBoard);
    setSelectedCell(null);
    setHistory([{ board: newBoard, selected: null }]);
  }, [difficulty]);

  // Check if game is completed
  useEffect(() => {
    if (isGameComplete(board)) {
      onComplete();
    }
  }, [board, onComplete]);

  const handleCellPress = (row: number, col: number) => {
    playSound('click');
    setSelectedCell([row, col]);
  };

  const handleNumberPress = (number: number) => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    const cell = board[row][col];
    
    if (cell.isFixed) return;

    const newBoard = [...board.map(r => [...r])];

    if (isNoteMode) {
      // Handle note mode
      newBoard[row][col] = {
        ...cell,
        notes: [...cell.notes],
      };
      newBoard[row][col].notes[number - 1] = !cell.notes[number - 1];
    } else {
      // Handle normal mode
      newBoard[row][col] = {
        ...cell,
        value: number,
        notes: Array(9).fill(false),
      };
      
      // Check if the move is valid
      const isValid = validateSudoku(newBoard, row, col);
      newBoard[row][col].isError = !isValid;
      
      if (!isValid) {
        playSound('error');
      } else {
        playSound('move');
      }
    }

    setBoard(newBoard);
    setHistory([...history, { board: newBoard, selected: selectedCell }]);
    onMove();
  };

  const handleErasePress = () => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    const cell = board[row][col];
    
    if (cell.isFixed) return;

    const newBoard = [...board.map(r => [...r])];
    newBoard[row][col] = {
      ...cell,
      value: null,
      notes: Array(9).fill(false),
      isError: false,
    };

    setBoard(newBoard);
    setHistory([...history, { board: newBoard, selected: selectedCell }]);
    playSound('click');
  };

  const handleNotesToggle = () => {
    setIsNoteMode(!isNoteMode);
    playSound('click');
  };

  const handleUndoPress = () => {
    if (history.length <= 1) return;
    
    const newHistory = [...history];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];
    
    setBoard(previous.board);
    setSelectedCell(previous.selected);
    setHistory(newHistory);
    playSound('click');
  };

  const handleHintPress = () => {
    if (isGameComplete(board)) return;
    
    const hint = getHint(board);
    if (!hint) {
      Alert.alert('No hints available', 'No valid hints found at this time.');
      return;
    }
    
    const { row, col, value } = hint;
    const newBoard = [...board.map(r => [...r])];
    newBoard[row][col] = {
      ...newBoard[row][col],
      value,
      notes: Array(9).fill(false),
      isError: false,
    };
    
    setBoard(newBoard);
    setSelectedCell([row, col]);
    setHistory([...history, { board: newBoard, selected: [row, col] }]);
    playSound('hint');
    onMove();
  };

  const isLandscape = orientation === 'landscape';

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View style={isLandscape ? styles.landscapeBoard : styles.board}>
        <SudokuBoard
          board={board}
          selectedCell={selectedCell}
          onCellPress={handleCellPress}
        />
      </View>
      <View style={isLandscape ? styles.landscapeControls : styles.controls}>
        <SudokuControls
          onNumberPress={handleNumberPress}
          onErasePress={handleErasePress}
          onNotesToggle={handleNotesToggle}
          onUndoPress={handleUndoPress}
          onHintPress={handleHintPress}
          isNoteMode={isNoteMode}
          canUndo={history.length > 1}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 360,
    marginBottom: theme.spacing.medium,
  },
  landscapeBoard: {
    width: '50%',
    aspectRatio: 1,
    maxWidth: 400,
    marginRight: theme.spacing.medium,
  },
  controls: {
    width: '100%',
    maxWidth: 360,
  },
  landscapeControls: {
    width: '40%',
    maxWidth: 280,
  },
});

export default SudokuGame;
