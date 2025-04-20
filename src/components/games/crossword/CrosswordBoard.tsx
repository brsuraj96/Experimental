import React from 'react';
import { 
  StyleSheet, 
  View, 
  useWindowDimensions,
  Platform 
} from 'react-native';
import { CrosswordBoard as CrosswordBoardType } from '../../../types';
import CrosswordCell from './CrosswordCell';
import { theme } from '../../../styles/theme';

interface CrosswordBoardProps {
  board: CrosswordBoardType;
  onCellPress: (row: number, col: number) => void;
}

const CrosswordBoard: React.FC<CrosswordBoardProps> = ({ 
  board, 
  onCellPress 
}) => {
  const { width } = useWindowDimensions();
  const boardSize = board.length;
  
  // Calculate the size of each cell based on screen width
  // Use a little less than full width to add padding around the board
  const maxBoardWidth = Math.min(width - 32, 500);
  const cellSize = Math.floor((maxBoardWidth - (boardSize * 2)) / boardSize);
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.board, 
        { width: (cellSize + 2) * boardSize + 2 }
      ]}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <CrosswordCell
                key={`cell-${rowIndex}-${colIndex}`}
                cell={cell}
                size={cellSize}
                onPress={() => onCellPress(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  board: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
});

export default CrosswordBoard;