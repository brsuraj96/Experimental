import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Difficulty } from '../../../types';
import SlideTilesBoard from './SlideTilesBoard';
import {
  generateBoard,
  isSolved,
  moveTile,
  canMoveTile,
  shuffleBoard,
  getBoardSize,
} from './logic';
import { theme } from '../../../styles/theme';
import useSound from '../../../hooks/useSound';

interface SlideTilesGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: 'portrait' | 'landscape';
}

const SlideTilesGame: React.FC<SlideTilesGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
}) => {
  const { playSound } = useSound();
  const boardSize = getBoardSize(difficulty);
  const [board, setBoard] = useState(() => generateBoard(boardSize));
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  useEffect(() => {
    if (gameStarted && isSolved(board)) {
      onComplete();
    }
  }, [board, gameStarted, onComplete]);

  const resetGame = () => {
    const size = getBoardSize(difficulty);
    const newBoard = generateBoard(size);
    setBoard(newBoard);
    setMoves(0);
    setGameStarted(false);
  };

  const startGame = () => {
    const shuffled = shuffleBoard(board);
    setBoard(shuffled);
    setGameStarted(true);
  };

  const handleTilePress = (row: number, col: number) => {
    if (!gameStarted) return;
    
    if (canMoveTile(board, row, col)) {
      const newBoard = moveTile(board, row, col);
      setBoard(newBoard);
      setMoves(moves + 1);
      onMove();
      playSound('move');
    } else {
      playSound('error');
    }
  };

  const isLandscape = orientation === 'landscape';

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View style={isLandscape ? styles.landscapeBoard : styles.boardContainer}>
        <SlideTilesBoard
          board={board}
          onTilePress={handleTilePress}
          gameStarted={gameStarted}
        />
      </View>
      
      <View style={isLandscape ? styles.landscapeControls : styles.controlsContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Moves</Text>
            <Text style={styles.infoValue}>{moves}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>{boardSize}×{boardSize}</Text>
          </View>
        </View>
        
        {!gameStarted ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonIcon}>▶</Text>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetGame}
          >
            <Text style={styles.resetButtonIcon}>↻</Text>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Play:</Text>
          <Text style={styles.instructionsText}>
            Rearrange the tiles by sliding them into the empty space to form the
            original numbered sequence. The empty space should be in the bottom
            right corner.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  landscapeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 360,
    marginBottom: theme.spacing.medium,
  },
  landscapeBoard: {
    width: '50%',
    aspectRatio: 1,
    maxWidth: 400,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 360,
  },
  landscapeControls: {
    width: '45%',
    maxHeight: 400,
    justifyContent: 'space-between',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.medium,
  },
  infoItem: {
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: theme.spacing.medium,
  },
  startButtonIcon: {
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: theme.colors.backgroundLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: theme.spacing.medium,
  },
  resetButtonIcon: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: 'center',
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.medium,
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default SlideTilesGame;
