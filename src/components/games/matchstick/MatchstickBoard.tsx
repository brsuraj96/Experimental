import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Line } from "react-native-svg";
import { Matchstick } from "../../../types";
import { theme } from "../../../styles/theme";

interface MatchstickBoardProps {
  matchsticks: Matchstick[];
  onSelectMatchstick: (matchstick: Matchstick) => void;
}

const MatchstickBoard: React.FC<MatchstickBoardProps> = ({
  matchsticks,
  onSelectMatchstick,
}) => {
  // Board dimensions
  const boardWidth = 320;
  const boardHeight = 320;

  return (
    <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
      <Svg width={boardWidth} height={boardHeight}>
        {/* Draw grid lines for reference */}
        {Array.from({ length: 11 }).map((_, index) => (
          <React.Fragment key={`grid-${index}`}>
            {/* Horizontal lines */}
            <Line
              x1={0}
              y1={index * 32}
              x2={boardWidth}
              y2={index * 32}
              stroke={theme.colors.gridLines}
              strokeWidth={1}
            />
            {/* Vertical lines */}
            <Line
              x1={index * 32}
              y1={0}
              x2={index * 32}
              y2={boardHeight}
              stroke={theme.colors.gridLines}
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        {/* Draw matchsticks */}
        {matchsticks.map((matchstick) => (
          <React.Fragment key={matchstick.id}>
            <Line
              x1={matchstick.x1}
              y1={matchstick.y1}
              x2={matchstick.x2}
              y2={matchstick.y2}
              stroke={getMatchstickColor(matchstick)}
              strokeWidth={12}
              strokeLinecap="round"
            />
            {/* Add invisible touchable area over the line */}
            <TouchableOpacity
              style={{
                position: "absolute",
                left: Math.min(matchstick.x1, matchstick.x2) - 15,
                top: Math.min(matchstick.y1, matchstick.y2) - 15,
                width: Math.abs(matchstick.x2 - matchstick.x1) + 30 || 30,
                height: Math.abs(matchstick.y2 - matchstick.y1) + 30 || 30,
                backgroundColor: "transparent",
              }}
              onPress={() => onSelectMatchstick(matchstick)}
            />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

// Helper function to determine matchstick color based on its state
const getMatchstickColor = (matchstick: Matchstick): string => {
  if (!matchstick.isMovable) {
    return theme.colors.text; // Make non-movable matchsticks more visible
  }
  if (matchstick.isSelected) {
    return theme.colors.primary; // Selected matchstick is highlighted
  }
  return matchstick.isPlaced ? theme.colors.success : "#FF5722"; // Brighter orangish-red for matchsticks
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
  },
  matchstickTouchable: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});

export default MatchstickBoard;
