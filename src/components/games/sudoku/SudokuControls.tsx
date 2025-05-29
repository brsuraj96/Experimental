import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Easing,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

interface SudokuControlsProps {
  onNumberPress: (number: number) => void;
  onNumberLongPress: (number: number) => void;
  onErasePress: () => void;
  onNotesToggle: () => void;
  onUndoPress: () => void;
  onHintPress: () => void;
  isNoteMode: boolean;
  canUndo: boolean;
  isLandscape: boolean;
  remainingNumbers: number[];
  validNumbers: boolean[];
  selectedNumber: number | null;
  numberFirstMode: boolean;
  lockedNumber: number | null;
  disableNotesButton: boolean;
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: "100%",
      maxHeight: 340,
    },
    landscapeContainer: {
      width: "100%",
      maxHeight: 300,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.medium,
    },
    actionButton: {
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      marginHorizontal: 4,
    },
    iconText: {
      fontSize: 20,
      color: theme.colors.text,
      textAlign: "center",
    },
    actionText: {
      color: theme.colors.text,
      fontSize: 12,
      marginTop: 4,
    },
    disabledButton: {
      opacity: 0.5,
    },
    activeButton: {
      backgroundColor: theme.colors.noteModeBackground,
    },
    numberPad: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: 120,
    },
    numberButton: {
      flex: 1,
      height: 70,
      backgroundColor: theme.colors.backgroundLight,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      marginHorizontal: 2,
      padding: 2,
      position: "relative",
    },
    numberButtonTouchable: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    numberText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    remainingText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginVertical: 1,
    },
    disabledNumberButton: {
      opacity: 0.5,
      backgroundColor: theme.colors.backgroundMedium,
    },
    lockedButton: {
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    lockedNumberText: {
      color: theme.colors.primary,
      fontWeight: "900",
    },
    lockIndicator: {
      position: "absolute",
      top: 1,
      right: 1,
      padding: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundLight,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.5,
          shadowRadius: 1,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    disabledNumberText: {
      color: theme.colors.textSecondary,
    },
    loadingBorderBase: {
      position: "absolute",
      backgroundColor: theme.colors.primary,
      opacity: 0.8,
    },
    loadingBorderTop: {
      top: 0,
      left: 0,
      height: 3,
      width: "100%",
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    loadingBorderRight: {
      top: 0,
      right: 0,
      width: 3,
      height: "100%",
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    loadingBorderBottom: {
      bottom: 0,
      right: 0,
      height: 3,
      width: "100%",
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    loadingBorderLeft: {
      bottom: 0,
      left: 0,
      width: 3,
      height: "100%",
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
  });

export const SudokuControls: React.FC<SudokuControlsProps> = React.memo(
  ({
    onNumberPress,
    onNumberLongPress,
    onErasePress,
    onNotesToggle,
    onUndoPress,
    onHintPress,
    isNoteMode,
    canUndo,
    isLandscape,
    remainingNumbers,
    validNumbers,
    selectedNumber,
    numberFirstMode,
    lockedNumber,
    disableNotesButton,
  }) => {
    const { currentTheme } = useTheme();
    const styles = useMemo(() => createStyles(currentTheme), [currentTheme]);
    const [longPressActive, setLongPressActive] = useState<number | null>(null);
    const fadeAnims = useRef<{ [key: number]: Animated.Value }>({});
    const borderAnims = useRef<{ [key: number]: Animated.Value }>({});
    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

    // Memoize numbers array
    const numbers = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9], []);

    // Initialize animations for each number
    useEffect(() => {
      // Initialize all numbers at once
      numbers.forEach((number) => {
        fadeAnims.current[number] = new Animated.Value(
          lockedNumber === number ? 1 : 0
        );
        borderAnims.current[number] = new Animated.Value(0);
      });
    }, []); // Only run once on mount

    // Animate lock state changes
    useEffect(() => {
      numbers.forEach((number) => {
        const isLocked = lockedNumber === number;
        Animated.spring(fadeAnims.current[number], {
          toValue: isLocked ? 1 : 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }).start();
      });
    }, [lockedNumber, numbers]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
        Object.values(fadeAnims.current).forEach((anim) => {
          anim.setValue(0);
        });
        Object.values(borderAnims.current).forEach((anim) => {
          anim.stopAnimation();
          anim.setValue(0);
        });
      };
    }, []);

    const handleLongPressStart = useCallback(
      (number: number) => {
        setLongPressActive(number);

        // Only start the border animation in number-first mode
        if (numberFirstMode) {
          borderAnims.current[number].setValue(0);
          Animated.timing(borderAnims.current[number], {
            toValue: 1,
            duration: 500, // Match the long press duration
            useNativeDriver: true,
          }).start();
        }

        longPressTimeout.current = setTimeout(() => {
          onNumberLongPress(number);
          setLongPressActive(null);
        }, 500);
      },
      [onNumberLongPress, numberFirstMode]
    );

    const handlePressOut = useCallback(() => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
      // Reset all border animations
      numbers.forEach((number) => {
        borderAnims.current[number].stopAnimation();
        borderAnims.current[number].setValue(0);
      });
      setLongPressActive(null);
    }, [numbers]);

    const renderActionButton = useCallback(
      ({
        icon,
        onPress,
        text,
        isActive = false,
        testID,
        disabled = false,
      }: {
        icon: string;
        onPress: () => void;
        text: string;
        isActive?: boolean;
        testID?: string;
        disabled?: boolean;
      }) => (
        <TouchableOpacity
          style={[
            styles.actionButton,
            isActive && styles.activeButton,
            disabled && styles.disabledButton,
          ]}
          onPress={onPress}
          testID={testID}
          disabled={disabled}
        >
          <FontAwesome5 name={icon} style={styles.iconText} />
          <Text style={styles.actionText}>{text}</Text>
        </TouchableOpacity>
      ),
      [styles]
    );

    const renderNumberButton = useCallback(
      (number: number) => {
        const isDisabled = !validNumbers[number - 1];
        const isLocked = lockedNumber === number;
        // Disable all numbers except the locked one when in number-first mode and a number is locked
        const isDisabledByLock =
          numberFirstMode && lockedNumber !== null && !isLocked;
        const remaining = remainingNumbers[number - 1] || 0;
        const isLongPressed = longPressActive === number;

        return (
          <View
            key={number}
            style={[
              styles.numberButton,
              (isDisabled || isDisabledByLock) && styles.disabledNumberButton,
              numberFirstMode && isLocked && styles.lockedButton,
              numberFirstMode &&
                selectedNumber === number &&
                styles.activeButton,
            ]}
          >
            {borderAnims.current[number] && numberFirstMode && (
              <>
                <Animated.View
                  style={[
                    styles.loadingBorderBase,
                    styles.loadingBorderTop,
                    {
                      transform: [
                        {
                          scaleX: borderAnims.current[number].interpolate({
                            inputRange: [0, 0.25],
                            outputRange: [0, 1],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                      transformOrigin: "left",
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.loadingBorderBase,
                    styles.loadingBorderRight,
                    {
                      transform: [
                        {
                          scaleY: borderAnims.current[number].interpolate({
                            inputRange: [0.25, 0.5],
                            outputRange: [0, 1],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                      transformOrigin: "top",
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.loadingBorderBase,
                    styles.loadingBorderBottom,
                    {
                      transform: [
                        {
                          scaleX: borderAnims.current[number].interpolate({
                            inputRange: [0.5, 0.75],
                            outputRange: [0, 1],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                      transformOrigin: "right",
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.loadingBorderBase,
                    styles.loadingBorderLeft,
                    {
                      transform: [
                        {
                          scaleY: borderAnims.current[number].interpolate({
                            inputRange: [0.75, 1],
                            outputRange: [0, 1],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                      transformOrigin: "bottom",
                    },
                  ]}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.numberButtonTouchable}
              onPress={() => onNumberPress(number)}
              onLongPress={() => handleLongPressStart(number)}
              onPressOut={handlePressOut}
              disabled={isDisabled || isDisabledByLock}
            >
              <Text
                style={[
                  styles.numberText,
                  isDisabled && styles.disabledNumberText,
                  numberFirstMode && isLocked && styles.lockedNumberText,
                ]}
              >
                {number}
              </Text>
              {remaining > 0 && (
                <Text style={styles.remainingText}>{remaining}</Text>
              )}
            </TouchableOpacity>
            {fadeAnims.current[number] && (
              <Animated.View
                style={[
                  styles.lockIndicator,
                  {
                    opacity: fadeAnims.current[number],
                    transform: [
                      {
                        scale: fadeAnims.current[number].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <FontAwesome5
                  name="lock"
                  size={12}
                  color={currentTheme.colors.primary}
                />
              </Animated.View>
            )}
          </View>
        );
      },
      [
        validNumbers,
        lockedNumber,
        remainingNumbers,
        longPressActive,
        styles,
        onNumberPress,
        handleLongPressStart,
        handlePressOut,
        currentTheme.colors.primary,
        numberFirstMode,
        selectedNumber,
      ]
    );

    const actionButtons = useMemo(
      () => (
        <View style={styles.actionButtons}>
          {renderActionButton({
            icon: "pencil-alt",
            onPress: onNotesToggle,
            text: "Note",
            isActive: isNoteMode,
            testID: "note-button",
            disabled:
              disableNotesButton || (numberFirstMode && lockedNumber !== null),
          })}
          {renderActionButton({
            icon: "undo",
            onPress: onUndoPress,
            text: "Undo",
            testID: "undo-button",
            disabled: !canUndo,
          })}
          {renderActionButton({
            icon: "eraser",
            onPress: onErasePress,
            text: "Erase",
            testID: "erase-button",
          })}
          {renderActionButton({
            icon: "lightbulb",
            onPress: onHintPress,
            text: "Hint",
            testID: "hint-button",
          })}
        </View>
      ),
      [
        styles,
        renderActionButton,
        isNoteMode,
        onNotesToggle,
        onUndoPress,
        onErasePress,
        onHintPress,
        canUndo,
        disableNotesButton,
      ]
    );

    const numberPad = useMemo(
      () => (
        <View style={styles.numberPad}>{numbers.map(renderNumberButton)}</View>
      ),
      [styles, numbers, renderNumberButton]
    );

    return (
      <View style={isLandscape ? styles.landscapeContainer : styles.container}>
        {actionButtons}
        {numberPad}
      </View>
    );
  }
);

SudokuControls.displayName = "SudokuControls";

export default SudokuControls;
