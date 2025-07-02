import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, GameType, Difficulty, GameInfo } from "../types";
// import Animated, {
//   interpolateColor,
//   useAnimatedStyle,
// } from "react-native-reanimated";
import { theme } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";
import Dialog from "../components/common/Dialog";
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
import { useLocalization } from "../context/LocalizationContext";

type GameNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

// Memoize GameCard component
const MemoizedGameCard = memo(GameCard);

// Function to get the appropriate icon component
const getGameIcon = (gameType: GameType, size: number) => {
  switch (gameType) {
    case GameType.SUDOKU:
      return <IconSudoku size={size} />;
    case GameType.SLIDE_TILES:
      return <IconSlideTiles size={size} />;
    case GameType.FLOW_FREE:
      return <IconFlowFree size={size} />;
    case GameType.CROSSWORD:
      return <IconCrossword size={size} />;
    case GameType.MATCHSTICK:
      return <IconMatchstick size={size} />;
    case GameType.SPOT_DIFFERENCE:
      return <IconSpotDifference size={size} />;
    case GameType.WATER_FLOW:
      return <IconWaterFlow size={size} />;
    case GameType.TRIVIA:
      return <IconTrivia size={size} />;
    case GameType.RIDDLES:
      return <IconRiddles size={size} />;
    case GameType.WORDSEARCH:
      return <IconSudoku size={size} />; // Placeholder icon
    default:
      return <IconSudoku size={size} />;
  }
};

const HomeScreen = () => {
  const navigation = useNavigation<GameNavigationProp>();
  const orientation = useOrientation();
  const { width } = useWindowDimensions();
  const { currentTheme } = useTheme();
  const { t, locale } = useLocalization();
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const quitApp = useCallback(() => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    }
  }, []);

  const handleQuit = useCallback(() => {
    setShowQuitDialog(false);
    setTimeout(() => {
      quitApp();
    }, 300);
  }, [quitApp]);

  const handleSelectGame = useCallback(
    (game: GameInfo) => {
      if (game.implemented) {
        navigation.navigate("Game", {
          gameType: game.id,
          difficulty: Difficulty.EASY,
        });
      }
    },
    [navigation]
  );

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      setShowQuitDialog(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const numColumns = orientation === "landscape" ? 3 : 2;
  const cardWidth =
    (width - theme.spacing.large * (numColumns + 1)) / numColumns;

  // Memoize styles to prevent recreation
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: currentTheme.colors.background,
        },
        header: {
          paddingTop: theme.spacing.large,
          paddingBottom: theme.spacing.medium,
          paddingHorizontal: theme.spacing.large,
          backgroundColor: currentTheme.colors.backgroundDark,
        },
        title: {
          fontSize: 30,
          fontWeight: "bold",
          color: currentTheme.colors.text,
          marginBottom: theme.spacing.small,
        },
        subtitle: {
          fontSize: 16,
          color: currentTheme.colors.textSecondary,
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
      }),
    [currentTheme.colors]
  );

  // Memoize game cards rendering
  const renderGameCards = useCallback(
    () => (
      <View style={styles.gamesGrid}>
        {games.map((game) => (
          <MemoizedGameCard
            key={game.id}
            title={game.title}
            description={game.description}
            color={game.color}
            icon={getGameIcon(game.id, 50)}
            width={cardWidth}
            onPress={() => handleSelectGame(game)}
            implemented={game.implemented}
          />
        ))}
      </View>
    ),
    [cardWidth, handleSelectGame, styles.gamesGrid]
  );

  // Memoize games array to prevent recreation
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

  return (
    // <Animated.View style={[styles.container, animatedBackground]}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("appTitle")}</Text>
        <Text style={styles.subtitle}>{t("appSubtitle")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: theme.spacing.medium },
        ]}
      >
        {/* Show real-time activities for web platform only */}
        {Platform.OS === "web" && <RealtimeActivities />}

        {renderGameCards()}
      </ScrollView>

      <Dialog
        visible={showQuitDialog}
        title={t("quitApplication")}
        message={t("quitConfirmation")}
        buttons={[
          {
            text: t("cancel"),
            onPress: () => setShowQuitDialog(false),
            style: "cancel",
          },
          {
            text: t("quit"),
            onPress: handleQuit,
            style: "destructive",
          },
        ]}
        onDismiss={() => setShowQuitDialog(false)}
      />
    </View>
    // </Animated.View>
  );
};

export default memo(HomeScreen);
