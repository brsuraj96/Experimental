import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/common/Header";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";

const APP_NAME = "Puzzle World";
const APP_SUBTITLE = "Free Classic Puzzle Games";
const APP_VERSION = "1.0.0";
const TERMS_URL = "https://puzzleworld.app/terms";
const PRIVACY_URL = "https://puzzleworld.app/privacy";

const AboutScreen = () => {
  const { currentTheme } = useTheme();
  const navigation = useNavigation();

  // Fix: Only navigate back on hardware back press, do not show exit dialog
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => backHandler.remove();
    }, [navigation])
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <Header
        title="About"
        showBackButton
        onBack={() => navigation.goBack()}
        settings={{
          darkMode: false,
          audioEffect: false,
          vibration: false,
          fontSize: "medium",
          language: "en",
          timer: false,
        }}
        isGameCompleted={false}
      />
      <View style={styles.centerContent}>
        {/* App Icon */}
        <View style={styles.iconWrapper}>
          {/* If you have an SVG/TSX icon, render it here. Otherwise, use a placeholder. */}
          <Image
            source={require("../assets/image/puzzle_world.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        {/* App Name */}
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
          {APP_NAME}
        </Text>
        {/* Subtitle */}
        <Text
          style={[
            styles.subtitle,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          {APP_SUBTITLE}
        </Text>
        {/* Version */}
        <Text style={[styles.version, { color: currentTheme.colors.textDim }]}>
          version {APP_VERSION}
        </Text>
      </View>
      {/* Footer Links */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
          <Text
            style={[
              styles.footerLink,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            Terms of Service
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.footerDivider,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          |
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
          <Text
            style={[
              styles.footerLink,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.4)",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android shadow
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
    gap: 8,
  },
  footerLink: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footerDivider: {
    fontSize: 14,
    marginHorizontal: 8,
  },
});

export default AboutScreen;
