import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  findNodeHandle,
  UIManager,
} from "react-native";
import { WordSearchBoard as WordSearchBoardType } from "../../../types";
import { theme } from "../../../styles/theme";
import WordSearchCell from "./WordSearchCell";

interface WordSearchBoardProps {
  board: WordSearchBoardType;
  onCellPress: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
  onCellRelease: () => void;
}

const WordSearchBoard: React.FC<WordSearchBoardProps> = ({
  board,
  onCellPress,
  onCellDrag,
  onCellRelease,
}) => {
  const { width } = Dimensions.get("window");
  const boardSize = Math.min(width - 32, 360);
  const gridSize = board.length;
  const cellSize = boardSize / gridSize;

  const boardRef = useRef<View>(null);
  const boardMeasurements = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Function to convert touch coordinates to grid position
  const touchToGridPosition = (pageX: number, pageY: number) => {
    const { x, y } = boardMeasurements.current;

    // Calculate position relative to board
    const relativeX = pageX - x;
    const relativeY = pageY - y;

    // Convert to grid coordinates
    const row = Math.floor(relativeY / cellSize);
    const col = Math.floor(relativeX / cellSize);

    return { row, col };
  };

  // Measure the board position on layout
  const onBoardLayout = () => {
    if (boardRef.current) {
      const nodeHandle = findNodeHandle(boardRef.current);
      if (nodeHandle) {
        UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
          boardMeasurements.current = { x: pageX, y: pageY, width, height };
        });
      }
    }
  };

  // Create PanResponder for handling drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt: any) => {
        const { pageX, pageY } = evt.nativeEvent;
        const { row, col } = touchToGridPosition(pageX, pageY);

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          onCellPress(row, col);
        }
      },

      onPanResponderMove: (evt: any) => {
        const { pageX, pageY } = evt.nativeEvent;
        const { row, col } = touchToGridPosition(pageX, pageY);

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          onCellDrag(row, col);
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
      ref={boardRef}
      onLayout={onBoardLayout}
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.grid}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <WordSearchCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                size={cellSize}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
  },
  grid: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
});

export default WordSearchBoard;
