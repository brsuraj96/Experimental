import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...rest
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const { currentTheme } = useTheme();

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

  const getButtonStyle = () => {
    const variantStyles = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
    };

    const sizeStyles = {
      small: styles.smallButton,
      medium: styles.mediumButton,
      large: styles.largeButton,
    };

    return [
      styles.button,
      variantStyles[variant],
      sizeStyles[size],
      disabled && styles.disabledButton,
      style,
    ];
  };

  const getTextStyle = () => {
    const variantTextStyles = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
    };

    const sizeTextStyles = {
      small: styles.smallText,
      medium: styles.mediumText,
      large: styles.largeText,
    };

    return [
      styles.text,
      variantTextStyles[variant],
      sizeTextStyles[size],
      disabled && styles.disabledText,
      textStyle,
    ];
  };

  const styles = StyleSheet.create({
    button: {
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    primaryButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: currentTheme.colors.backgroundLight,
    },
    outlineButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
    },
    smallButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    mediumButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    largeButton: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    disabledButton: {
      opacity: 0.5,
    },
    text: {
      fontWeight: "600",
      textAlign: "center",
    },
    primaryText: {
      color: currentTheme.colors.white,
    },
    secondaryText: {
      color: currentTheme.colors.text,
    },
    outlineText: {
      color: currentTheme.colors.primary,
    },
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    disabledText: {
      opacity: 0.8,
    },
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === "outline"
                ? currentTheme.colors.primary
                : currentTheme.colors.white
            }
            size="small"
          />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;
