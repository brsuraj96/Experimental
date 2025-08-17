import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { apiService } from "../services/apiService";
import StatCard from "../components/StatCard";
import { GameType, Difficulty } from "../types";

const difficulties = ["Beginner", "Easy", "Medium", "Hard", "Expert"];

interface GameStats {
  gamesStarted: number;
  gamesWon: number;
  winRate: number;
  winsNoMistakes: number;
  bestTime: string;
  avgTime: string;
  winStreak: number;
  bestWinStreak: number;
  totalScore: number;
  averageScore: number;
  hintsUsed: number;
  totalMistakes: number;
}

const defaultStats: GameStats = {
  gamesStarted: 0,
  gamesWon: 0,
  winRate: 0,
  winsNoMistakes: 0,
  bestTime: "00:00",
  avgTime: "00:00",
  winStreak: 0,
  bestWinStreak: 0,
  totalScore: 0,
  averageScore: 0,
  hintsUsed: 0,
  totalMistakes: 0,
};

const STATS_KEY = "statsData";

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const StatsScreen = () => {
  const { currentTheme } = useTheme();
  const styles = createStyles(currentTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [selectedGameType, setSelectedGameType] = useState<GameType>(
    GameType.SUDOKU
  );
  const [statsData, setStatsData] = useState<{
    [key: string]: GameStats;
  }>({});
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const stats =
    statsData[`${selectedGameType}_${selectedDifficulty}`] || defaultStats;

  // Load stats from API or local storage
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // Try to load from API first
        const response = await apiService.getUserStats();

        if (response.success && response.data) {
          // Transform API data to local format
          const transformedStats: { [key: string]: GameStats } = {};

          // Initialize all game types and difficulties
          Object.values(GameType).forEach((gameType) => {
            difficulties.forEach((difficulty) => {
              const key = `${gameType}_${difficulty}`;
              transformedStats[key] = { ...defaultStats };
            });
          });

          // Populate with API data
          if (response.data.gameStats) {
            response.data.gameStats.forEach((stat: any) => {
              const key = `${stat.game_type}_${stat.difficulty}`;
              transformedStats[key] = {
                gamesStarted: stat.total_games_played || 0,
                gamesWon: stat.total_games_won || 0,
                winRate:
                  stat.total_games_played > 0
                    ? Math.round(
                        (stat.total_games_won / stat.total_games_played) * 100
                      )
                    : 0,
                winsNoMistakes: stat.perfect_games || 0,
                bestTime: formatTime(stat.best_time || 0),
                avgTime: formatTime(stat.average_time || 0),
                winStreak: stat.current_streak || 0,
                bestWinStreak: stat.best_streak || 0,
                totalScore: stat.total_score || 0,
                averageScore: stat.average_score || 0,
                hintsUsed: stat.hints_used || 0,
                totalMistakes: stat.total_mistakes || 0,
              };
            });
          }

          setStatsData(transformedStats);
          setIsOnline(true);
        } else {
          // Fallback to local storage
          await loadLocalStats();
          setIsOnline(false);
        }
      } catch (error) {
        console.error("Error loading stats from API:", error);
        await loadLocalStats();
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    const loadLocalStats = async () => {
      try {
        const saved = await AsyncStorage.getItem(STATS_KEY);
        if (saved) {
          setStatsData(JSON.parse(saved));
        } else {
          // Initialize all game types and difficulties with defaultStats
          const initial: { [key: string]: GameStats } = {};
          Object.values(GameType).forEach((gameType) => {
            difficulties.forEach((difficulty) => {
              const key = `${gameType}_${difficulty}`;
              initial[key] = { ...defaultStats };
            });
          });
          setStatsData(initial);
        }
      } catch (error) {
        console.error("Error loading local stats:", error);
      }
    };

    loadStats();
  }, []);

  // Save stats to local storage whenever statsData changes
  useEffect(() => {
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(statsData));
  }, [statsData]);

  // When switching tabs, ensure stats for that difficulty exist
  const handleTabSwitch = (diff: string) => {
    const key = `${selectedGameType}_${diff}`;
    if (!statsData[key]) {
      setStatsData((prev) => ({ ...prev, [key]: { ...defaultStats } }));
    }
    setSelectedDifficulty(diff);
  };

  const handleGameTypeSwitch = (gameType: GameType) => {
    setSelectedGameType(gameType);
  };

  const handleResetStatistics = () => {
    Alert.alert(
      "Reset Statistics",
      "Are you sure you want to reset all statistics? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            const resetData: { [key: string]: GameStats } = {};
            Object.values(GameType).forEach((gameType) => {
              difficulties.forEach((difficulty) => {
                const key = `${gameType}_${difficulty}`;
                resetData[key] = { ...defaultStats };
              });
            });
            setStatsData(resetData);
            await AsyncStorage.setItem(STATS_KEY, JSON.stringify(resetData));
          },
        },
      ]
    );
  };

  const handleRefreshStats = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserStats();
      if (response.success) {
        // Reload stats logic here (same as in useEffect)
        setIsOnline(true);
        Alert.alert("Success", "Statistics refreshed from server");
      } else {
        Alert.alert("Error", "Failed to refresh statistics from server");
      }
    } catch (error) {
      Alert.alert("Error", "Network error while refreshing statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        <Text style={[styles.headerTitle, { marginTop: 16 }]}>
          Loading Statistics...
        </Text>
      </View>
    );
  }

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!isOnline && (
            <FontAwesome5
              name="wifi-slash"
              size={16}
              color={currentTheme.colors.textSecondary}
              style={{ marginRight: 8 }}
            />
          )}
          <TouchableOpacity onPress={handleRefreshStats} disabled={loading}>
            <FontAwesome5
              name="sync-alt"
              size={18}
              color={currentTheme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Game Type Selector */}
      <View style={styles.gameTypeContainer}>
        {Object.values(GameType)
          .slice(0, 3)
          .map((gameType) => (
            <TouchableOpacity
              key={gameType}
              style={[
                styles.gameTypeButton,
                selectedGameType === gameType && styles.gameTypeButtonActive,
              ]}
              onPress={() => handleGameTypeSwitch(gameType)}
            >
              <Text
                style={[
                  styles.gameTypeText,
                  selectedGameType === gameType && styles.gameTypeTextActive,
                ]}
              >
                {gameType}
              </Text>
            </TouchableOpacity>
          ))}
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

        {/* Score Section */}
        <Text style={styles.sectionTitle}>Score</Text>
        <StatCard
          icon={
            <FontAwesome5
              name="star"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Total Score"
          value={stats.totalScore.toLocaleString()}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="chart-line"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Average Score"
          value={Math.round(stats.averageScore).toLocaleString()}
        />

        {/* Gameplay Section */}
        <Text style={styles.sectionTitle}>Gameplay</Text>
        <StatCard
          icon={
            <FontAwesome5
              name="lightbulb"
              size={20}
              color={currentTheme.colors.primary}
            />
          }
          title="Hints Used"
          value={stats.hintsUsed}
        />
        <StatCard
          icon={
            <FontAwesome5
              name="exclamation-triangle"
              size={20}
              color={currentTheme.colors.error}
            />
          }
          title="Total Mistakes"
          value={stats.totalMistakes}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={handleRefreshStats}
            disabled={loading}
          >
            <FontAwesome5 name="sync-alt" size={16} color="white" />
            <Text style={styles.actionButtonText}>
              {isOnline ? "Refresh" : "Sync"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: currentTheme.colors.error },
            ]}
            onPress={handleResetStatistics}
          >
            <FontAwesome5 name="trash" size={16} color="white" />
            <Text style={styles.actionButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
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
    gameTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 16,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    gameTypeButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    gameTypeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    gameTypeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    gameTypeTextActive: {
      color: theme.colors.white,
      fontWeight: "bold",
    },
    actionButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 24,
      paddingHorizontal: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 100,
      justifyContent: "center",
    },
    actionButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
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
