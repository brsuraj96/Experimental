import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { GameType, Difficulty } from "../../types";
import { formatTime } from "../../utils/helpers";
import { useWebSocket } from "../../context/WebSocketContext";
import { theme } from "../../styles/theme";

interface GameSessionActivity {
  id: number;
  user_id: number;
  game_type: GameType;
  difficulty: Difficulty;
  moves: number;
  time_taken: number;
  completed: boolean;
  created_at: string;
  timestamp?: string;
  opacity?: Animated.Value;
}

const MAX_ACTIVITIES = 5;

const RealtimeActivities: React.FC = () => {
  const [activities, setActivities] = useState<GameSessionActivity[]>([]);
  const { addListener, removeListener, isConnected } = useWebSocket();

  useEffect(() => {
    // Only set up listeners for web platform
    if (Platform.OS !== "web") return;

    const handleGameSession = (data: GameSessionActivity) => {
      // Add animation value to the new activity
      const activityWithAnimation = {
        ...data,
        opacity: new Animated.Value(0),
      };

      // Add to activities list and limit to MAX_ACTIVITIES
      setActivities((prev) => {
        const newActivities = [activityWithAnimation, ...prev].slice(
          0,
          MAX_ACTIVITIES
        );
        return newActivities;
      });

      // Animate the new activity
      Animated.sequence([
        Animated.timing(activityWithAnimation.opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(100),
      ]).start();
    };

    // Add WebSocket event listener
    addListener("game_session", handleGameSession);

    // Cleanup
    return () => {
      removeListener("game_session", handleGameSession);
    };
  }, [addListener, removeListener]);

  // Only show on web and when connected
  if (Platform.OS !== "web" || !isConnected) {
    return null;
  }

  // If no activities yet, show a message
  if (activities.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Recent Activity
        </Text>
        <Text
          style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}
        >
          Activity will appear here as players complete games
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.cardBackground },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Recent Activity
      </Text>
      <ScrollView style={styles.scrollContainer}>
        {activities.map((activity) => (
          <Animated.View
            key={activity.id}
            style={[
              styles.activityItem,
              {
                opacity: activity.opacity,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.activityHeader}>
              <Text style={[styles.gameType, { color: theme.colors.primary }]}>
                {activity.game_type}
              </Text>
              <Text
                style={[styles.timeAgo, { color: theme.colors.textSecondary }]}
              >
                Just now
              </Text>
            </View>
            <View style={styles.activityDetails}>
              <Text
                style={[styles.difficultyText, { color: theme.colors.text }]}
              >
                {activity.difficulty}
              </Text>
              <Text
                style={[
                  styles.statsText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {activity.moves} moves • {formatTime(activity.time_taken)}
              </Text>
              <Text
                style={[
                  styles.completionStatus,
                  {
                    color: activity.completed
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {activity.completed ? "✓ Completed" : "× Gave up"}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  scrollContainer: {
    maxHeight: 240,
  },
  activityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gameType: {
    fontWeight: "bold",
    fontSize: 16,
  },
  timeAgo: {
    fontSize: 12,
  },
  activityDetails: {
    marginTop: 4,
  },
  difficultyText: {
    fontSize: 14,
    marginBottom: 2,
  },
  statsText: {
    fontSize: 12,
    marginBottom: 4,
  },
  completionStatus: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyMessage: {
    textAlign: "center",
    padding: 20,
    fontSize: 14,
  },
});

export default RealtimeActivities;
