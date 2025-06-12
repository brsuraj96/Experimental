import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

interface ScoreDisplayProps {
  score: number;
  previousScore?: number;
  maxScore?: number;
  notifications?: Array<{
    id: number;
    type: "bonus" | "penalty" | "achievement";
    points: number;
    message: string;
    icon?: string;
    color?: string;
  }>;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  previousScore = 0,
  maxScore = 3000,
  notifications = [],
}) => {
  const { currentTheme } = useTheme();
  const scoreAnimation = useRef(new Animated.Value(previousScore)).current;
  const progressAnimation = useRef(
    new Animated.Value(previousScore / maxScore)
  ).current;

  // Keep track of active notification animations
  const notificationAnims = useRef<{ [key: number]: Animated.Value }>({});

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scoreAnimation, {
        toValue: score,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.timing(progressAnimation, {
        toValue: score / maxScore,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [score, maxScore]);

  // Handle notification animations
  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notificationAnims.current[notification.id]) {
        const anim = new Animated.Value(0);
        notificationAnims.current[notification.id] = anim;

        Animated.sequence([
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
          Animated.delay(1500),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          delete notificationAnims.current[notification.id];
        });
      }
    });
  }, [notifications]);

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <FontAwesome5
          name="star"
          size={16}
          color={currentTheme.colors.accent}
        />
        <Text style={{ color: currentTheme.colors.text }}>{"Score: "}</Text>
        <Animated.View
          style={{
            transform: [
              {
                scale: scoreAnimation.interpolate({
                  inputRange: [0, maxScore],
                  outputRange: [1, 1.2],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          <Text style={[styles.score, { color: currentTheme.colors.text }]}>
            {score.toLocaleString()}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.notificationsContainer}>
        {notifications.map((notification) => (
          <Animated.View
            key={notification.id}
            style={[
              styles.notification,
              {
                opacity: notificationAnims.current[notification.id] || 0,
                backgroundColor: currentTheme.colors.backgroundMedium,
                transform: [
                  {
                    translateY: (
                      notificationAnims.current[notification.id] ||
                      new Animated.Value(0)
                    ).interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  {
                    scale: (
                      notificationAnims.current[notification.id] ||
                      new Animated.Value(0)
                    ).interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {notification.icon && (
              <Text
                style={[
                  styles.notificationIcon,
                  { color: currentTheme.colors.text },
                ]}
              >
                {notification.icon}
              </Text>
            )}
            <Text
              style={[
                styles.notificationText,
                { color: notification.color || currentTheme.colors.accent },
              ]}
            >
              {notification.message}
              {notification.points !== 0 && (
                <Text
                  style={[
                    styles.points,
                    { color: notification.color || currentTheme.colors.accent },
                  ]}
                >
                  {notification.points > 0 ? "+" : ""}
                  {notification.points}
                </Text>
              )}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View
        style={[
          styles.progressBarContainer,
          { backgroundColor: currentTheme.colors.backgroundMedium },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: currentTheme.colors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  score: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationsContainer: {
    position: "absolute",
    top: -40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    marginVertical: 2,
  },
  notificationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  notificationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  points: {
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: "#00000020",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});

export default ScoreDisplay;
