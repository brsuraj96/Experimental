import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ScorePopupProps {
  score: number;
  x: number;
  y: number;
  onComplete: () => void;
}

const ScorePopup: React.FC<ScorePopupProps> = ({ score, x, y, onComplete }) => {
  const { currentTheme } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.2,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: x }, { translateY: translateY }, { scale }],
          opacity,
          left: 0,
          top: y,
        },
      ]}
    >
      <Text style={[styles.text, { color: currentTheme.colors.accent }]}>
        {`+${score}`}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    padding: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ScorePopup;
