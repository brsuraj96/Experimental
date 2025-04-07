import React from 'react';
import { View, StyleSheet, useWindowDimensions, PanResponder } from 'react-native';
import { FlowBoard, FlowColor } from '../../../types';
import FlowFreeCell from './FlowFreeCell';
import { theme } from '../../../styles/theme';

interface FlowFreeBoardProps {
  board: FlowBoard;
  activeColor: FlowColor | null;
  onCellPress: (row: number, col: number) => void;
  onCellMove: (row: number, col: number) => void;
  onCellRelease: () => void;
}

const FlowFreeBoard: React.FC<FlowFreeBoardProps> = ({
  board,
  activeColor,
  onCellPress,
  onCellMove,
  onCellRelease,
}) => {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 360);

  // Calculate grid dimensions
  const gridSize = board.length;
  const cellSize = boardSize / gridSize;

  // Create PanResponder for handling touch gestures
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touch = evt.nativeEvent;
        const row = Math.floor((touch.locationY - 2) / cellSize);
        const col = Math.floor((touch.locationX - 2) / cellSize);
        
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          onCellPress(row, col);
        }
      },
      onPanResponderMove: (evt) => {
        const touch = evt.nativeEvent;
        const row = Math.floor((touch.locationY - 2) / cellSize);
        const col = Math.floor((touch.locationX - 2) / cellSize);
        
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          onCellMove(row, col);
        }
      },
      onPanResponderRelease: () => {
        onCellRelease();
      },
      onPanResponderTerminate: () => {
        onCellRelease();
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <FlowFreeCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            size={cellSize}
            isActive={cell?.color === activeColor}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    padding: 2,
    position: 'relative',
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
    overflow: 'hidden',
  },
});

export default FlowFreeBoard;
