import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, GameType } from "../types";
import { theme } from "../styles/theme";
import Header from "../components/common/Header";
import Timer from "../components/common/Timer";
import SudokuGame from "../components/games/sudoku/SudokuGame";
import SlideTilesGame from "../components/games/slideTiles/SlideTilesGame";
import FlowFreeGame from "../components/games/flowFree/FlowFreeGame";
import WaterFlowGame from "../components/games/waterFlow/WaterFlowGame";
import CrosswordGame from "../components/games/crossword/CrosswordGame";
import WordSearchGame from "../components/games/wordSearch/WordSearchGame";
import SpotDifferenceGame from "../components/games/spotDifference/SpotDifferenceGame";
import MatchstickGame from "../components/games/matchstick/MatchstickGame";
import useOrientation from "../hooks/useOrientation";
import useSound from "../hooks/useSound";

type GameScreenRouteProp = RouteProp<RootStackParamList, "Game">;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, "Game">;

const GameScreen = () => {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { gameType, difficulty } = route.params;
  const orientation = useOrientation();
  const { playSound } = useSound();

  const [gameStartTime] = useState<number>(Date.now());
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);

  const [headerVisible, setHeaderVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLandscape = orientation === "landscape";

  // Hide header after 5 seconds
  useEffect(() => {
    startHideHeaderTimer();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const startHideHeaderTimer = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setHeaderVisible(false);
    }, 5000);
  };

  const handleScreenTap = () => {
    if (!headerVisible) {
      setHeaderVisible(true);
      startHideHeaderTimer();
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit Game",
        "Are you sure you want to exit? Your progress will be lost.",
        [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "Exit", onPress: () => navigation.goBack() },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (isGameCompleted) {
      playSound("win");
      const endTime = Date.now();
      const timeTaken = Math.floor((endTime - gameStartTime) / 1000);

      setTimeout(() => {
        navigation.navigate("Completion", {
          gameType,
          difficulty,
          time: timeTaken,
          moves,
        });
      }, 1500);
    }
  }, [
    isGameCompleted,
    navigation,
    gameType,
    difficulty,
    gameStartTime,
    moves,
    playSound,
  ]);

  const handleAddMove = () => {
    setMoves((prev) => prev + 1);
    playSound("move");
  };

  const handleHint = () => {
    if (Platform.OS === "android") {
      // Would use ToastAndroid.show('Hint used', ToastAndroid.SHORT);
      console.log("Hint used (Android Toast)");
    } else {
      // For web or iOS
      Alert.alert("Hint Used", "A hint has been applied.");
    }
    playSound("hint");
  };

  const renderGame = () => {
    switch (gameType) {
      case GameType.SUDOKU:
        return (
          <SudokuGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
            orientation={orientation}
          />
        );
      case GameType.SLIDE_TILES:
        return (
          <SlideTilesGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
            orientation={orientation}
          />
        );
      case GameType.FLOW_FREE:
        return (
          <FlowFreeGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
            orientation={orientation}
          />
        );
      case GameType.WATER_FLOW:
        return (
          <WaterFlowGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
            orientation={orientation}
          />
        );
      case GameType.CROSSWORD:
        return (
          <CrosswordGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
            orientation={orientation}
          />
        );
      case GameType.SPOT_DIFFERENCE:
        return (
          <SpotDifferenceGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
          />
        );
      case GameType.MATCHSTICK:
        return (
          <MatchstickGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
          />
        );
      case GameType.CROSSWORD: // Used as placeholder for WordSearch since it's not in the enum
        return (
          <WordSearchGame
            difficulty={difficulty}
            onMove={handleAddMove}
            onComplete={() => setIsGameCompleted(true)}
          />
        );
      default:
        return <View />;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={styles.container}>
        {headerVisible && (
          <Header
            title={gameType}
            subtitle={difficulty}
            showBackButton
            onBack={() => {
              Alert.alert(
                "Exit Game",
                "Are you sure you want to exit? Your progress will be lost.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  { text: "Exit", onPress: () => navigation.goBack() },
                ]
              );
            }}
            rightComponent={
              <Timer startTime={gameStartTime} isRunning={!isGameCompleted} />
            }
            onHint={handleHint}
            containerStyle={{
              height: isLandscape ? 60 : 72,
              paddingVertical: isLandscape ? 4 : 10,
            }}
          />
        )}

        <View
          style={[
            styles.gameContainer,
            isLandscape ? styles.landscapeContainer : styles.portraitContainer,
          ]}
        >
          {renderGame()}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.medium,
    minHeight: 0, // Ensures content can shrink below default minimum
    maxHeight: "100%",
  },
  landscapeContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.large,
  },
  portraitContainer: {
    flexDirection: "column",
    paddingVertical: theme.spacing.medium,
  },
});

export default GameScreen;
