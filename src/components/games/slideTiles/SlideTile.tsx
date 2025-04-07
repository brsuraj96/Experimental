import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '../../../styles/theme';

interface SlideTileProps {
  value: number;
  size: number;
  row: number;
  col: number;
  boardSize: number;
  onPress: () => void;
  gameStarted: boolean;
}

const SlideTile: React.FC<SlideTileProps> = ({
  value,
  size,
  row,
  col,
  boardSize,
  onPress,
  gameStarted,
}) => {
  // Animation values
  const translateX = useRef(new Animated.Value(col * size)).current;
  const translateY = useRef(new Animated.Value(row * size)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Update position when row/col changes
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: col * size,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    Animated.timing(translateY, {
      toValue: row * size,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [col, row, size, translateX, translateY]);

  // Add a subtle scale animation when game starts
  useEffect(() => {
    if (gameStarted) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.elastic(1.2),
        }),
      ]).start();
    }
  }, [gameStarted, scale]);

  // Tile press animation
  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  // Calculate if this tile is in the correct position
  const correctRow = Math.floor((value - 1) / boardSize);
  const correctCol = (value - 1) % boardSize;
  const isCorrectPosition = row === correctRow && col === correctCol;

  return (
    <Animated.View
      style={[
        styles.tileWrapper,
        {
          width: size,
          height: size,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tile,
          {
            width: size - 8,
            height: size - 8,
            backgroundColor: isCorrectPosition
              ? `${theme.colors.success}80`
              : theme.colors.backgroundLight,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tileText,
            {
              fontSize: size * 0.4,
              color: isCorrectPosition ? theme.colors.success : theme.colors.text,
            },
          ]}
        >
          {value}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  tile: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tileText: {
    fontWeight: 'bold',
  },
});

export default SlideTile;
