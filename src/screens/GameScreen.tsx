import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, GameType, Difficulty } from '../types';
import { theme } from '../styles/theme';
import Header from '../components/common/Header';
import Timer from '../components/common/Timer';
import SudokuGame from '../components/games/sudoku/SudokuGame';
import SlideTilesGame from '../components/games/slideTiles/SlideTilesGame';
import FlowFreeGame from '../components/games/flowFree/FlowFreeGame';
import WaterFlowGame from '../components/games/waterFlow/WaterFlowGame';
import useOrientation from '../hooks/useOrientation';
import useSound from '../hooks/useSound';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

const GameScreen = () => {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { gameType, difficulty } = route.params;
  const orientation = useOrientation();
  const { playSound } = useSound();
  
  const [gameStartTime] = useState<number>(Date.now());
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit Game', 'Are you sure you want to exit? Your progress will be lost.', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'Exit', onPress: () => navigation.goBack() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (isGameCompleted) {
      playSound('win');
      const endTime = Date.now();
      const timeTaken = Math.floor((endTime - gameStartTime) / 1000);
      
      setTimeout(() => {
        navigation.navigate('Completion', {
          gameType,
          difficulty,
          time: timeTaken,
          moves,
        });
      }, 1500);
    }
  }, [isGameCompleted, navigation, gameType, difficulty, gameStartTime, moves, playSound]);

  const handleAddMove = () => {
    setMoves(prev => prev + 1);
    playSound('move');
  };

  const handleHint = () => {
    if (Platform.OS === 'android') {
      // Would use ToastAndroid.show('Hint used', ToastAndroid.SHORT);
      console.log('Hint used (Android Toast)');
    } else {
      // For web or iOS
      Alert.alert('Hint Used', 'A hint has been applied.');
    }
    playSound('hint');
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
      default:
        return <View />;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={gameType}
        subtitle={difficulty}
        showBackButton
        onBack={() => {
          Alert.alert(
            'Exit Game',
            'Are you sure you want to exit? Your progress will be lost.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              { text: 'Exit', onPress: () => navigation.goBack() },
            ]
          );
        }}
        rightComponent={
          <Timer startTime={gameStartTime} isRunning={!isGameCompleted} />
        }
        onHint={handleHint}
      />

      <View style={styles.gameContainer}>{renderGame()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
});

export default GameScreen;
