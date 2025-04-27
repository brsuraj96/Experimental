import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface GameCardProps {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  width: number;
  onPress: () => void;
  implemented: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  color,
  icon,
  width,
  onPress,
  implemented,
}) => {
  const { currentTheme } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    cardWrapper: {
      marginBottom: currentTheme.spacing.medium,
    },
    card: {
      backgroundColor: currentTheme.colors.backgroundLight,
      borderRadius: 16,
      borderWidth: 2,
      padding: currentTheme.spacing.medium,
      minHeight: 180,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: currentTheme.spacing.medium,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: currentTheme.colors.text,
      textAlign: "center",
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      textAlign: "center",
    },
    comingSoonBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: currentTheme.colors.overlay,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    comingSoonText: {
      color: currentTheme.colors.white,
      fontSize: 10,
      fontWeight: "bold",
    },
  });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          width,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: color,
            opacity: implemented ? 1 : 0.6,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!implemented}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {!implemented && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GameCard;
