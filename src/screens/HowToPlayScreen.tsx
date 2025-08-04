import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useLocalization } from "../context/LocalizationContext";
import { GameType, GameInfo } from "../types";
import { FontAwesome5 } from "@expo/vector-icons";
import Header from "../components/common/Header";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
// Import icons
import IconSudoku from "../assets/icons/IconSudoku";
import IconSlideTiles from "../assets/icons/IconSlideTiles";
import IconFlowFree from "../assets/icons/IconFlowFree";
import IconCrossword from "../assets/icons/IconCrossword";
import IconMatchstick from "../assets/icons/IconMatchstick";
import IconSpotDifference from "../assets/icons/IconSpotDifference";
import IconWaterFlow from "../assets/icons/IconWaterFlow";
import IconTrivia from "../assets/icons/IconTrivia";
import IconRiddles from "../assets/icons/IconRiddles";
import IconJigsaw from "../assets/icons/IconJigsaw";

const getGameIcon = (gameType: GameType, size: number, color?: string) => {
  switch (gameType) {
    case GameType.SUDOKU:
      return <IconSudoku size={size} color={color} />;
    case GameType.SLIDE_TILES:
      return <IconSlideTiles size={size} color={color} />;
    case GameType.FLOW_FREE:
      return <IconFlowFree size={size} color={color} />;
    case GameType.CROSSWORD:
      return <IconCrossword size={size} color={color} />;
    case GameType.MATCHSTICK:
      return <IconMatchstick size={size} color={color} />;
    case GameType.SPOT_DIFFERENCE:
      return <IconSpotDifference size={size} color={color} />;
    case GameType.WATER_FLOW:
      return <IconWaterFlow size={size} color={color} />;
    case GameType.TRIVIA:
      return <IconTrivia size={size} color={color} />;
    case GameType.RIDDLES:
      return <IconRiddles size={size} color={color} />;
    case GameType.WORDSEARCH:
      return <IconJigsaw size={size} color={color} />; // Use jigsaw as placeholder
    default:
      return <IconJigsaw size={size} color={color} />;
  }
};

type NavigationProp = StackNavigationProp<RootStackParamList, "HowToPlay">;

const HowToPlayScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentTheme } = useTheme();
  const { t, locale } = useLocalization();
  const theme = currentTheme;

  const games: GameInfo[] = useMemo(
    () => [
      {
        id: GameType.SUDOKU,
        title: t("sudoku"),
        description: t("sudokuDescription"),
        color: theme.colors.primary,
        implemented: true,
      },
      {
        id: GameType.SLIDE_TILES,
        title: t("slideTiles"),
        description: t("slideTilesDescription"),
        color: theme.colors.primary,
        implemented: true,
      },
      {
        id: GameType.FLOW_FREE,
        title: t("flowFree"),
        description: t("flowFreeDescription"),
        color: theme.colors.success,
        implemented: true,
      },
      {
        id: GameType.CROSSWORD,
        title: t("crossword"),
        description: t("crosswordDescription"),
        color: theme.colors.secondary,
        implemented: true,
      },
      {
        id: GameType.WORDSEARCH,
        title: t("wordSearch"),
        description: t("wordSearchDescription"),
        color: theme.colors.primaryLight,
        implemented: true,
      },
      {
        id: GameType.MATCHSTICK,
        title: t("matchstick"),
        description: t("matchstickDescription"),
        color: theme.colors.secondary,
        implemented: true,
      },
      {
        id: GameType.SPOT_DIFFERENCE,
        title: t("spotDifference"),
        description: t("spotDifferenceDescription"),
        color: theme.colors.error,
        implemented: true,
      },
      {
        id: GameType.WATER_FLOW,
        title: t("waterFlow"),
        description: t("waterFlowDescription"),
        color: theme.colors.water,
        implemented: true,
      },
      {
        id: GameType.TRIVIA,
        title: t("trivia"),
        description: t("triviaDescription"),
        color: theme.colors.success,
        implemented: false,
      },
      {
        id: GameType.RIDDLES,
        title: t("riddles"),
        description: t("riddlesDescription"),
        color: theme.colors.primary,
        implemented: false,
      },
    ],
    [t, locale, theme.colors]
  );

  const handleGamePress = (gameId: GameType) => {
    navigation.navigate("HowToPlayDetail", { gameType: gameId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title={t("howToPlay")}
        showBackButton
        onBack={() => navigation.goBack()}
        isGameCompleted={false}
        isPaused={false}
        isThemeSelectorVisible={false}
        settings={{
          audioEffect: false,
          vibration: false,
          darkMode: false,
          fontSize: "medium",
          language: "en",
          timer: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.listContainer}>
          {games.map((game, idx) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.row, { borderBottomColor: theme.colors.border }]}
              activeOpacity={0.7}
              onPress={() => handleGamePress(game.id)}
            >
              <View style={styles.iconContainer}>
                {getGameIcon(game.id, 30, theme.colors.primary)}
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {game.title}
              </Text>
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 0,
  },
  listContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    // You may want to use theme.colors.backgroundLight here
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  iconContainer: {
    marginRight: 16,
    width: 24,
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
});

export default HowToPlayScreen;
