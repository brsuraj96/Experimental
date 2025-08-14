import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import StatCard from "../components/StatCard";

const difficulties = ["Beginner", "Easy", "Medium", "Hard", "Expert"];

const defaultStats = {
  gamesStarted: 0,
  gamesWon: 0,
  winRate: 0,
  winsNoMistakes: 0,
  bestTime: "00:00",
  avgTime: "00:00",
  winStreak: 0,
  bestWinStreak: 0,
};

const STATS_KEY = "statsData";

const StatsScreen = () => {
  const { currentTheme } = useTheme();
  const styles = createStyles(currentTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Beginner");
  const [statsData, setStatsData] = useState<{
    [key: string]: typeof defaultStats;
  }>({});
  const stats = statsData[selectedDifficulty] || defaultStats;

  // Load stats from local storage on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STATS_KEY);
      if (saved) {
        setStatsData(JSON.parse(saved));
      } else {
        // Initialize all difficulties with defaultStats
        const initial: { [key: string]: typeof defaultStats } = {};
        difficulties.forEach((diff) => {
          initial[diff] = { ...defaultStats };
        });
        setStatsData(initial);
      }
    })();
  }, []);

  // Save stats to local storage whenever statsData changes
  useEffect(() => {
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(statsData));
  }, [statsData]);

  // When switching tabs, ensure stats for that difficulty exist
  const handleTabSwitch = (diff: string) => {
    if (!statsData[diff]) {
      setStatsData((prev) => ({ ...prev, [diff]: { ...defaultStats } }));
    }
    setSelectedDifficulty(diff);
  };

  const handleResetStatistics = () => {
    const resetData: { [key: string]: typeof defaultStats } = {};
    difficulties.forEach((diff) => {
      resetData[diff] = { ...defaultStats };
    });
    setStatsData(resetData);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        {/* <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity> */}
      </View>

      {/* Difficulty Tabs */}
      <View style={styles.tabsContainer}>
        {difficulties.map((diff) => (
          <TouchableOpacity
            key={diff}
            style={styles.tabButton}
            onPress={() => handleTabSwitch(diff)}
          >
            <Text
              style={[
                styles.tabText,
                selectedDifficulty === diff && styles.tabTextActive,
              ]}
            >
              {diff}
            </Text>
            {selectedDifficulty === diff && (
              <View style={styles.tabUnderline} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Games Section */}
        <Text style={styles.sectionTitle}>Games</Text>
        <StatCard
          icon={
            <FontAwesome5
              name="puzzle-piece"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Games Started"
          value={stats.gamesStarted}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="trophy"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Games Won"
          value={stats.gamesWon}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="percent"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Win Rate"
          value={`${stats.winRate}%`}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="check-circle"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Wins with No Mistakes"
          value={stats.winsNoMistakes}
        />

        {/* Time Section */}
        <Text style={styles.sectionTitle}>Time</Text>
        <StatCard
          icon={
            <FontAwesome5
              name="stopwatch"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Best Time"
          value={stats.bestTime}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="clock"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Average Time"
          value={stats.avgTime}
        />

        {/* Streak Section */}
        <Text style={styles.sectionTitle}>Streak</Text>
        <StatCard
          icon={
            <FontAwesome5
              name="fire"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Current Win Streak"
          value={stats.winStreak}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="medal"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Best Win Streak"
          value={stats.bestWinStreak}
        />

        {/* Reset Statistics Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetStatistics}
        >
          <Text
            style={[
              styles.resetButtonText,
              { color: currentTheme.colors.primary },
            ]}
          >
            Reset Statistics
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["currentTheme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 30,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      flex: 1,
    },
    tabsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "flex-end",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    tabButton: {
      alignItems: "center",
      flex: 1,
      paddingVertical: 8,
    },
    tabText: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    tabUnderline: {
      marginTop: 4,
      height: 3,
      width: 24,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.colors.textSecondary,
      marginTop: 18,
      marginBottom: 4,
    },
    icon: {
      fontSize: 20,
    },
    resetButton: {
      marginTop: 24,
      alignSelf: "center",
    },
    resetButtonText: {
      fontSize: 15,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
  });

export default StatsScreen;
