import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";

interface SudokuCellProps {
  value?: number | null;
  notes: boolean[];
  isFixed?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isSimilarValue?: boolean;
  isError?: boolean;
  isLockedNumber?: boolean;
  size: number;
  onPress?: () => void;
  onFillNumber?: (number: number) => void;
  lockedNumber?: number | null;
  rightBorder?: boolean;
  bottomBorder?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  notes,
  isFixed,
  isSelected,
  isHighlighted,
  isSimilarValue,
  isError,
  isLockedNumber,
  size,
  onPress,
  onFillNumber,
  lockedNumber,
  rightBorder,
  bottomBorder,
}) => {
  const { currentTheme } = useTheme();
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger ripple animation when a number is placed in number-first mode
    if (lockedNumber && value === lockedNumber && !isFixed && !isError) {
      rippleAnim.setValue(0);
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [value, lockedNumber, isFixed, isError]);

  const handlePress = () => {
    // If there's a locked number and the cell is empty or has an error, fill it
    if (lockedNumber && (value === null || isError) && onFillNumber) {
      onFillNumber(lockedNumber);
    } else if (onPress) {
      onPress();
    }
  };

  const styles = StyleSheet.create({
    cell: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: currentTheme.colors.backgroundDark,
      position: "relative",
    },
    highlightedCell: {
      backgroundColor: `${currentTheme.colors.secondary}33`,
    },
    selectedCell: {
      backgroundColor: `${currentTheme.colors.primary}4D`,
    },
    errorCell: {
      backgroundColor: `${currentTheme.colors.error}33`,
    },
    lockedNumberCell: {
      backgroundColor: `${currentTheme.colors.primary}33`,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
    },
    value: {
      fontSize: 22,
      fontWeight: "600",
      color: currentTheme.colors.text,
      textAlign: "center",
      width: "100%",
      height: "100%",
      textAlignVertical: "center",
    },
    fixedValue: {
      fontWeight: "bold",
      color: currentTheme.colors.primary,
    },
    errorValue: {
      color: currentTheme.colors.error,
    },
    lockedValue: {
      color: currentTheme.colors.primary,
      fontWeight: "900",
    },
    notesContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    noteText: {
      position: "absolute",
      fontSize: 10,
      textAlign: "center",
      lineHeight: 12,
      color: currentTheme.colors.textSecondary,
    },
    rippleEffect: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 4,
      backgroundColor: currentTheme.colors.primary,
    },
  });

  const renderNotes = () => {
    if (value !== null) return null;

    const noteSize = size / 3;

    return (
      <View style={styles.notesContainer}>
        {notes.map((isActive, index) => {
          if (!isActive) return null;

          const noteValue = index + 1;
          const row = Math.floor(index / 3);
          const col = index % 3;

          return (
            <Text
              key={index}
              style={{
                ...styles.noteText,
                left: col * noteSize,
                top: row * noteSize,
                width: noteSize,
                height: noteSize,
              }}
            >
              {noteValue}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRightWidth: rightBorder ? 2 : 1,
          borderBottomWidth: bottomBorder ? 2 : 1,
          borderLeftWidth: 0,
          borderTopWidth: 0,
          borderRightColor: rightBorder
            ? currentTheme.colors.text
            : `${currentTheme.colors.text}33`,
          borderBottomColor: bottomBorder
            ? currentTheme.colors.text
            : `${currentTheme.colors.text}33`,
        },
        isHighlighted && styles.highlightedCell,
        isSelected && styles.selectedCell,
        isError && styles.errorCell,
        isSimilarValue && !isError && styles.highlightedCell,
        isLockedNumber && styles.lockedNumberCell,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.rippleEffect,
          {
            opacity: rippleAnim.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0, 0.4, 0],
            }),
            transform: [
              {
                scale: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      {value ? (
        <Text
          style={[
            styles.value,
            isFixed && styles.fixedValue,
            isError && styles.errorValue,
            isLockedNumber && styles.lockedValue,
          ]}
        >
          {value}
        </Text>
      ) : (
        renderNotes()
      )}
    </TouchableOpacity>
  );
};

export default SudokuCell;
