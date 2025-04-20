import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, GameType, Difficulty, GameInfo } from "../types";
import { theme } from "../styles/theme";
import GameCard from "../components/common/GameCard";
import RealtimeActivities from "../components/common/RealtimeActivities";
import useOrientation from "../hooks/useOrientation";
import IconSudoku from "../assets/icons/IconSudoku";
import IconSlideTiles from "../assets/icons/IconSlideTiles";
import IconFlowFree from "../assets/icons/IconFlowFree";
import IconCrossword from "../assets/icons/IconCrossword";
import IconJigsaw from "../assets/icons/IconJigsaw";
import IconMatchstick from "../assets/icons/IconMatchstick";
import IconSpotDifference from "../assets/icons/IconSpotDifference";
import IconWaterFlow from "../assets/icons/IconWaterFlow";
import IconTrivia from "../assets/icons/IconTrivia";
import IconRiddles from "../assets/icons/IconRiddles";

type GameNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const games: GameInfo[] = [
  {
    id: GameType.SUDOKU,
    title: "Sudoku",
    description: "Classic number logic puzzle",
    color: "#FF6F61",
    implemented: true,
  },
  {
    id: GameType.SLIDE_TILES,
    title: "Slide Tiles",
    description: "Rearrange tiles to solve the puzzle",
    color: "#4DD0E1",
    implemented: true,
  },
  {
    id: GameType.FLOW_FREE,
    title: "Flow Free",
    description: "Connect matching colors",
    color: "#81C784",
    implemented: false,
  },
  {
    id: GameType.CROSSWORD,
    title: "Crossword",
    description: "Classic word puzzle",
    color: "#FFEB3B",
    implemented: true,
  },
  {
    id: GameType.WORDSEARCH,
    title: "Word Search",
    description: "Classic word puzzle",
    color: "#FFEB3B",
    implemented: true,
  },
  {
    id: GameType.JIGSAW,
    title: "Jigsaw",
    description: "Piece together the image",
    color: "#9C27B0",
    implemented: false,
  },
  {
    id: GameType.MATCHSTICK,
    title: "Matchstick",
    description: "Visual logic puzzles with sticks",
    color: "#FF9800",
    implemented: true,
  },
  {
    id: GameType.SPOT_DIFFERENCE,
    title: "Spot the Difference",
    description: "Find differences between images",
    color: "#E91E63",
    implemented: true,
  },
  {
    id: GameType.WATER_FLOW,
    title: "Water Flow",
    description: "Guide water through pipes",
    color: "#00BCD4",
    implemented: true,
  },
  {
    id: GameType.TRIVIA,
    title: "Trivia",
    description: "Test your knowledge",
    color: "#CDDC39",
    implemented: false,
  },
  {
    id: GameType.RIDDLES,
    title: "Riddles",
    description: "Solve mind-bending riddles",
    color: "#009688",
    implemented: false,
  },
];

const getGameIcon = (gameType: GameType) => {
  switch (gameType) {
    case GameType.SUDOKU:
      return <IconSudoku size={50} />;
    case GameType.SLIDE_TILES:
      return <IconSlideTiles size={50} />;
    case GameType.FLOW_FREE:
      return <IconFlowFree size={50} />;
    case GameType.CROSSWORD:
      return <IconCrossword size={50} />;
    case GameType.JIGSAW:
      return <IconJigsaw size={50} />;
    case GameType.MATCHSTICK:
      return <IconMatchstick size={50} />;
    case GameType.SPOT_DIFFERENCE:
      return <IconSpotDifference size={50} />;
    case GameType.WATER_FLOW:
      return <IconWaterFlow size={50} />;
    case GameType.TRIVIA:
      return <IconTrivia size={50} />;
    case GameType.RIDDLES:
      return <IconRiddles size={50} />;
    default:
      return <IconSudoku size={50} />;
  }
};

const HomeScreen = () => {
  const navigation = useNavigation<GameNavigationProp>();
  const orientation = useOrientation();
  const { width } = useWindowDimensions();

  const handleSelectGame = (game: GameInfo) => {
    if (game.implemented) {
      navigation.navigate("Game", {
        gameType: game.id,
        difficulty: Difficulty.EASY,
      });
    }
  };

  const numColumns = orientation === "landscape" ? 3 : 2;
  const cardWidth =
    (width - theme.spacing.large * (numColumns + 1)) / numColumns;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Puzzle World</Text>
        <Text style={styles.subtitle}>
          Challenge your brain with fun puzzles
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: theme.spacing.medium },
        ]}
      >
        {/* Show real-time activities for web platform only */}
        {Platform.OS === "web" && <RealtimeActivities />}

        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              color={game.color}
              icon={getGameIcon(game.id)}
              width={cardWidth}
              onPress={() => handleSelectGame(game)}
              implemented={game.implemented}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.large,
    paddingBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    backgroundColor: theme.colors.backgroundDark,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.medium,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default HomeScreen;
