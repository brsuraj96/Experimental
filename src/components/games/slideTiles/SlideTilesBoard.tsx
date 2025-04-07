import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SlideTileBoard as SlideTileBoardType } from '../../../types';
import SlideTile from './SlideTile';
import { theme } from '../../../styles/theme';

interface SlideTilesBoardProps {
  board: SlideTileBoardType;
  onTilePress: (row: number, col: number) => void;
  gameStarted: boolean;
}

const SlideTilesBoard: React.FC<SlideTilesBoardProps> = ({
  board,
  onTilePress,
  gameStarted,
}) => {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 360);
  const cellSize = boardSize / board.length;

  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
        },
      ]}
    >
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          // Skip rendering the empty tile (0)
          if (value === 0) return null;

          return (
            <SlideTile
              key={value}
              value={value}
              size={cellSize}
              row={rowIndex}
              col={colIndex}
              boardSize={board.length}
              onPress={() => onTilePress(rowIndex, colIndex)}
              gameStarted={gameStarted}
            />
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: theme.colors.backgroundDark,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
  },
});

export default SlideTilesBoard;
