import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { theme } from "../../styles/theme";

const { width, height } = Dimensions.get("window");

// Generate random confetti particles
const generateConfetti = (count: number) => {
  const confetti = [];
  const colors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.success,
    theme.colors.accent,
    theme.colors.primaryLight,
    theme.colors.error,
  ];

  for (let i = 0; i < count; i++) {
    const size = Math.random() * 10 + 5;
    confetti.push({
      id: i,
      x: Math.random() * width,
      y: -20 - Math.random() * 100,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: new Animated.Value(0),
      position: new Animated.ValueXY({
        x: Math.random() * width,
        y: -20 - Math.random() * 100,
      }),
    });
  }

  return confetti;
};

const Confetti: React.FC = () => {
  const confettiItems = useRef(generateConfetti(100)).current;

  useEffect(() => {
    // Animate each confetti particle
    confettiItems.forEach((item) => {
      const duration = Math.random() * 3000 + 2000;
      const targetY = height + 50;
      const targetX = item.x + (Math.random() * 200 - 100);

      // Create falling animation
      Animated.parallel([
        Animated.timing(item.position, {
          toValue: { x: targetX, y: targetY },
          duration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(item.rotation, {
            toValue: 1,
            duration: Math.random() * 2000 + 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
      ]).start();
    });
  }, [confettiItems]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiItems.map((item) => {
        const rotateZ = item.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.confetti,
              {
                width: item.size,
                height: item.size,
                backgroundColor: item.color,
                transform: [
                  { translateX: item.position.x },
                  { translateY: item.position.y },
                  { rotateZ },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  confetti: {
    position: "absolute",
    opacity: 0.8,
  },
});

export default Confetti;
