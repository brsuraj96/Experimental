import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  Keyboard,
  Platform,
  Animated,
  TextInput
} from 'react-native';
import { Difficulty, CrosswordBoard as CrosswordBoardType, CrosswordClue } from '../../../types';
import CrosswordBoard from './CrosswordBoard';
import ClueList from './ClueList';
import Button from '../../common/Button';
import { 
  generateLevel, 
  updateCell, 
  isCrosswordComplete,
  getClueForCell,
  highlightCellsForClue,
  getNextCell,
  getPrevCell,
  getHint
} from './logic';
import { theme } from '../../../styles/theme';
import useSound from '../../../hooks/useSound';

interface CrosswordGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: 'portrait' | 'landscape';
}

const CrosswordGame: React.FC<CrosswordGameProps> = ({ 
  difficulty, 
  onMove, 
  onComplete,
  orientation
}) => {
  const [level, setLevel] = useState(() => generateLevel(difficulty));
  const [board, setBoard] = useState(level.board);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [activeClue, setActiveClue] = useState<CrosswordClue | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [completionPulse] = useState(new Animated.Value(0));
  
  const { playSound } = useSound();

  // Initialize the game
  useEffect(() => {
    if (level.acrossClues.length > 0) {
      const firstClue = level.acrossClues[0];
      handleCluePress(firstClue);
    }
  }, [level]);

  // Check for game completion
  useEffect(() => {
    if (isCrosswordComplete(board) && !isGameComplete) {
      setIsGameComplete(true);
      playSound('win');
      onComplete();
      
      // Animate the completion message
      Animated.loop(
        Animated.sequence([
          Animated.timing(completionPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(completionPulse, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [board, isGameComplete, onComplete, playSound, completionPulse]);

  // Handle cell press
  const handleCellPress = (row: number, col: number) => {
    if (isGameComplete || board[row][col].isBlank) return;
    
    // Toggle direction if pressing the same cell twice
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      const newDirection = activeDirection === 'across' ? 'down' : 'across';
      setActiveDirection(newDirection);
      
      // Get the clue for the new direction
      const newClue = getClueForCell(level, row, col, newDirection);
      setActiveClue(newClue);
      
      // Highlight cells for the new clue
      if (newClue) {
        setBoard(highlightCellsForClue(board, newClue));
      }
    } else {
      // Set new active cell
      setActiveCell({ row, col });
      
      // Get the clue for the current direction
      const clue = getClueForCell(level, row, col, activeDirection);
      if (clue) {
        setActiveClue(clue);
        setBoard(highlightCellsForClue(board, clue));
      } else {
        // If no clue in the current direction, try the other direction
        const otherDirection = activeDirection === 'across' ? 'down' : 'across';
        const otherClue = getClueForCell(level, row, col, otherDirection);
        if (otherClue) {
          setActiveDirection(otherDirection);
          setActiveClue(otherClue);
          setBoard(highlightCellsForClue(board, otherClue));
        }
      }
    }
    
    // Focus on the hidden input
    setInputValue('');
  };

  // Handle clue press
  const handleCluePress = (clue: CrosswordClue) => {
    setActiveClue(clue);
    setActiveDirection(clue.direction);
    setActiveCell({ row: clue.row, col: clue.col });
    setBoard(highlightCellsForClue(board, clue));
    setInputValue('');
  };

  // Handle key press
  const handleKeyPress = (key: string) => {
    if (!activeCell || isGameComplete) return;
    
    const { row, col } = activeCell;
    
    // Handle letter input
    if (/^[A-Za-z]$/.test(key)) {
      const updatedBoard = updateCell(board, row, col, key);
      setBoard(updatedBoard);
      onMove();
      
      // Move to the next cell
      const nextCell = getNextCell(board, row, col, activeDirection);
      if (nextCell) {
        setActiveCell(nextCell);
        setInputValue('');
      }
    } 
    // Handle backspace
    else if (key === 'Backspace' || key === 'Delete') {
      // If the current cell is empty, move to the previous cell
      if (board[row][col].userLetter === '') {
        const prevCell = getPrevCell(board, row, col, activeDirection);
        if (prevCell) {
          setActiveCell(prevCell);
        }
      } else {
        // Clear the current cell
        const updatedBoard = updateCell(board, row, col, '');
        setBoard(updatedBoard);
        onMove();
      }
    }
  };

  // Handle input change
  const handleInputChange = (text: string) => {
    if (text.length > 0) {
      const lastChar = text.charAt(text.length - 1).toUpperCase();
      handleKeyPress(lastChar);
    }
    setInputValue('');
  };

  // Handle hint
  const handleHint = () => {
    if (!activeCell || isGameComplete) return;
    
    const { row, col } = activeCell;
    const updatedBoard = getHint(board, row, col);
    setBoard(updatedBoard);
    playSound('hint');
    onMove();
    
    // Move to the next cell
    const nextCell = getNextCell(board, row, col, activeDirection);
    if (nextCell) {
      setActiveCell(nextCell);
    }
  };

  // Handle reset
  const handleReset = () => {
    Alert.alert(
      'Reset Puzzle',
      'Are you sure you want to reset the puzzle? All progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const newLevel = generateLevel(difficulty);
            setLevel(newLevel);
            setBoard(newLevel.board);
            setIsGameComplete(false);
            setActiveCell(null);
            setActiveClue(null);
            
            if (newLevel.acrossClues.length > 0) {
              const firstClue = newLevel.acrossClues[0];
              handleCluePress(firstClue);
            }
          },
        },
      ]
    );
  };

  // Calculate the pulse color for completion animation
  const pulseColor = completionPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.success + '80', theme.colors.success]
  });

  // Render the game in portrait or landscape mode
  return (
    <View style={[
      styles.container,
      orientation === 'landscape' && styles.landscapeContainer
    ]}>
      {/* Hidden text input to handle keyboard input on mobile */}
      {Platform.OS !== 'web' && (
        <TextInput
          style={styles.hiddenInput}
          value={inputValue}
          onChangeText={handleInputChange}
          autoCapitalize="characters"
          autoFocus
          blurOnSubmit={false}
        />
      )}

      {/* Game board area */}
      <View style={styles.boardContainer}>
        <CrosswordBoard 
          board={board} 
          onCellPress={handleCellPress} 
        />
        
        <View style={styles.gameInfo}>
          <Text style={styles.difficultyText}>
            {difficulty}
          </Text>
          {activeClue && (
            <Text style={styles.activeClueText}>
              {activeClue.number}. {activeClue.text}
            </Text>
          )}
        </View>
      </View>

      {/* Clue lists and controls */}
      <View style={[
        styles.rightPanel,
        orientation === 'landscape' && styles.landscapeRightPanel
      ]}>
        <View style={styles.cluesContainer}>
          <ClueList
            title="Across"
            clues={level.acrossClues}
            activeClue={activeClue}
            onCluePress={handleCluePress}
          />
          <ClueList
            title="Down"
            clues={level.downClues}
            activeClue={activeClue}
            onCluePress={handleCluePress}
          />
        </View>

        <View style={[
          styles.controls,
          orientation === 'landscape' && styles.landscapeControls
        ]}>
          <Button
            title="Hint"
            variant="outline"
            size="small"
            onPress={handleHint}
            style={styles.button}
          />
          <Button
            title="Reset"
            variant="outline"
            size="small"
            onPress={handleReset}
            style={styles.button}
          />
        </View>
      </View>

      {/* Completion message */}
      {isGameComplete && (
        <Animated.View 
          style={[
            styles.completionMessage,
            { backgroundColor: pulseColor }
          ]}
        >
          <Text style={styles.completionText}>Puzzle Completed!</Text>
          <Text style={styles.completionSubText}>Great job!</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  landscapeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  boardContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    marginBottom: 16,
  },
  rightPanel: {
    width: '100%',
    maxWidth: 500,
    flex: 1,
  },
  landscapeRightPanel: {
    marginLeft: 16,
    maxWidth: 350,
  },
  cluesContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  difficultyText: {
    fontSize: 16,
    color: theme.colors.textDim,
  },
  activeClueText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  landscapeControls: {
    marginTop: 16,
  },
  button: {
    marginHorizontal: 8,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  completionMessage: {
    position: 'absolute',
    top: '40%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completionSubText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CrosswordGame;