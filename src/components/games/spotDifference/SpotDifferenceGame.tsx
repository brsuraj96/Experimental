import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Difficulty, SpotDifferenceLevel, DifferenceSpot } from '../../../types';
import { generateSpotDifferenceLevel } from './spotDifferenceGenerator';
import { theme } from '../../../styles/theme';
import useSound from '../../../hooks/useSound';
import SpotDifferenceImage from './SpotDifferenceImage';

interface SpotDifferenceGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: (moves: number) => void;
}

const SpotDifferenceGame: React.FC<SpotDifferenceGameProps> = ({
  difficulty,
  onMove,
  onComplete,
}) => {
  const [level, setLevel] = useState<SpotDifferenceLevel | null>(null);
  const [moves, setMoves] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [foundDifferences, setFoundDifferences] = useState<number>(0);
  const { width } = useWindowDimensions();
  const { playSound } = useSound();
  
  // Generate a new level when difficulty changes
  useEffect(() => {
    const newLevel = generateSpotDifferenceLevel(difficulty);
    setLevel(newLevel);
    setMoves(0);
    setWrongAttempts(0);
    setFoundDifferences(0);
  }, [difficulty]);
  
  // Check for completion
  useEffect(() => {
    if (level && foundDifferences === level.differences.length) {
      playSound('win');
      onComplete(moves);
    }
  }, [foundDifferences, level, moves, onComplete, playSound]);
  
  // Handle tap on image
  const handleTap = useCallback((imageNum: 1 | 2, x: number, y: number) => {
    if (!level) return;
    
    // Check if tap is close to any difference spot
    const threshold = difficulty === Difficulty.EASY ? 30 : 
                     difficulty === Difficulty.MEDIUM ? 25 : 20;
                     
    // Find closest difference spot
    let foundIndex = -1;
    let minDistance = Infinity;
    
    level.differences.forEach((spot, index) => {
      if (!spot.isFound) {
        const distance = Math.sqrt(Math.pow(spot.x - x, 2) + Math.pow(spot.y - y, 2));
        if (distance < minDistance) {
          minDistance = distance;
          foundIndex = index;
        }
      }
    });
    
    // If found a difference and within threshold
    if (foundIndex !== -1 && minDistance <= threshold) {
      // Mark difference as found
      const updatedDifferences = [...level.differences];
      updatedDifferences[foundIndex] = {
        ...updatedDifferences[foundIndex],
        isFound: true,
      };
      
      setLevel({
        ...level,
        differences: updatedDifferences,
      });
      
      setFoundDifferences(prev => prev + 1);
      setMoves(prev => prev + 1);
      onMove();
      playSound('move');
    } else {
      // Wrong tap
      setWrongAttempts(prev => prev + 1);
      playSound('error');
    }
  }, [level, difficulty, onMove, playSound]);
  
  if (!level) {
    return <View style={styles.loadingContainer} />;
  }
  
  // Calculate the max image width based on screen size
  const maxImageWidth = Math.min(width - 20, 400);
  
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Found: {foundDifferences}/{level.differences.length}
        </Text>
        <Text style={styles.progressText}>
          Wrong Attempts: {wrongAttempts}
        </Text>
      </View>
      
      <View style={styles.imagesContainer}>
        <SpotDifferenceImage
          imageSource={level.image1}
          imageNumber={1}
          maxWidth={maxImageWidth}
          differences={level.differences}
          onTap={handleTap}
        />
        <View style={styles.separator} />
        <SpotDifferenceImage
          imageSource={level.image2}
          imageNumber={2}
          maxWidth={maxImageWidth}
          differences={level.differences}
          onTap={handleTap}
        />
      </View>
      
      <Text style={styles.instructionText}>
        Tap on the differences between the two images
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  imagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  separator: {
    height: 1, 
    width: '100%', 
    backgroundColor: theme.colors.border,
    marginVertical: 5,
  },
  instructionText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SpotDifferenceGame;