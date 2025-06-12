import React, { useState, useCallback, memo, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  BackHandler,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Header from "../components/common/Header";
import Dialog from "../components/common/Dialog";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import {
  BaseSettings,
  GameSettingsType,
  SettingItem,
  SettingSection,
  SettingItemComponentProps,
  SettingKey,
  Language,
  FontSize,
} from "../types/settings";
import { Theme } from "../styles/theme";
import CustomDropdown from "../components/common/CustomDropdown";

// Define the DropdownOption type locally since it's not exported from CustomDropdown
interface DropdownOption<T> {
  label: string;
  value: T;
}

interface SettingsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

// Define styles
const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  dropdown: {
    minWidth: 120,
  },
});

const SettingItemComponent: React.FC<
  SettingItemComponentProps & {
    updateBaseSettings: (settings: Partial<BaseSettings>) => void;
  }
> = ({ item, value, onValueChange, theme, onPress, updateBaseSettings }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const { baseSettings } = useSettings();

  // Update local value when prop value or baseSettings changes
  useEffect(() => {
    if (item.key === "darkMode") {
      setLocalValue(baseSettings.darkMode);
    } else {
      setLocalValue(value);
    }
  }, [value, baseSettings.darkMode, item.key]);

  const handleToggleChange = useCallback(
    (newValue: boolean) => {
      setLocalValue(newValue);

      if (item.key === "darkMode") {
        updateBaseSettings({ darkMode: newValue });
      } else {
        onValueChange(item.key as SettingKey, newValue);
      }
    },
    [item.key, onValueChange, updateBaseSettings]
  );

  const renderControl = () => {
    switch (item.type) {
      case "toggle":
        return (
          <Switch
            value={localValue as boolean}
            onValueChange={handleToggleChange}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.background}
            ios_backgroundColor={theme.colors.border}
          />
        );
      case "option":
        if (item.key === "language") {
          return (
            <CustomDropdown<Language>
              value={localValue as Language}
              options={item.options as DropdownOption<Language>[]}
              onValueChange={(newValue) =>
                onValueChange(item.key as SettingKey, newValue)
              }
              style={styles.dropdown}
            />
          );
        } else if (item.key === "fontSize") {
          return (
            <CustomDropdown<FontSize>
              value={localValue as FontSize}
              options={item.options as DropdownOption<FontSize>[]}
              onValueChange={(newValue) =>
                onValueChange(item.key as SettingKey, newValue)
              }
              style={styles.dropdown}
            />
          );
        }
        return null;
      case "link":
        return (
          <FontAwesome5
            name="chevron-right"
            size={16}
            color={theme.colors.textSecondary}
          />
        );
    }
  };

  const content = (
    <View
      style={[
        styles.settingItem,
        {
          borderBottomColor: theme.colors.border,
          backgroundColor: isPressed
            ? theme.colors.backgroundMedium
            : "transparent",
        },
      ]}
    >
      <View style={styles.settingInfo}>
        <FontAwesome5
          name={item.icon}
          size={20}
          color={theme.colors.text}
          style={styles.icon}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {item.label}
          </Text>
          {item.description && (
            <Text
              style={[
                styles.settingDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          )}
        </View>
      </View>
      {renderControl()}
    </View>
  );

  if (item.type === "link") {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={1}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { currentTheme } = useTheme();
  const {
    baseSettings,
    gameSettings,
    currentGameType,
    updateBaseSettings,
    updateGameSettings,
  } = useSettings();
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const currentSettings = useMemo(() => {
    if (currentGameType) {
      return gameSettings[currentGameType];
    }
    return baseSettings;
  }, [currentGameType, gameSettings, baseSettings]);

  const handleSettingChange = useCallback(
    (key: SettingKey, value: boolean | Language | FontSize) => {
      if (currentGameType) {
        const currentGameSettings = gameSettings[currentGameType];
        updateGameSettings(currentGameType, {
          ...currentGameSettings,
          [key]: value,
        } as Partial<GameSettingsType[typeof currentGameType]>);
      } else {
        updateBaseSettings({
          ...baseSettings,
          [key]: value,
        } as Partial<BaseSettings>);
      }
    },
    [
      currentGameType,
      gameSettings,
      baseSettings,
      updateGameSettings,
      updateBaseSettings,
    ]
  );

  // Memoize setting sections to prevent recreation
  const settingSections = useMemo<SettingSection[]>(
    () => [
      {
        title: "General Settings",
        items: [
          {
            type: "toggle" as const,
            key: "audioEffect" as SettingKey,
            label: "Sound Effects",
            icon: "volume-up",
          },
          {
            type: "toggle" as const,
            key: "vibration" as SettingKey,
            label: "Vibration",
            icon: "mobile-alt",
          },
          {
            type: "toggle" as const,
            key: "darkMode" as SettingKey,
            label: "Dark Mode",
            icon: "moon",
          },
          {
            type: "option" as const,
            key: "fontSize" as keyof BaseSettings,
            label: "Font Size",
            icon: "text-height",
            options: [
              { label: "Small", value: "small" as FontSize },
              { label: "Medium", value: "medium" as FontSize },
              { label: "Large", value: "large" as FontSize },
            ],
          },
          {
            type: "option" as const,
            key: "language" as keyof BaseSettings,
            label: "Language",
            icon: "language",
            options: [
              { label: "English", value: "en" as Language },
              { label: "Spanish", value: "es" as Language },
              { label: "French", value: "fr" as Language },
            ],
          },
        ],
      },
      {
        title: "Game Settings",
        items: [
          {
            type: "toggle" as const,
            key: "timer" as SettingKey,
            label: "Timer",
            icon: "clock",
          },
          {
            type: "toggle" as const,
            key: "smartHint" as SettingKey,
            label: "Show Hints",
            icon: "lightbulb",
          },
          {
            type: "toggle" as const,
            key: "showProgress" as SettingKey,
            label: "Show Progress",
            icon: "chart-line",
          },
        ],
      },
      {
        title: "Sudoku Settings",
        items: [
          // {
          //   type: "toggle" as const,
          //   key: "timer" as SettingKey,
          //   label: "Timer",
          //   icon: "clock",
          // },
          {
            type: "toggle" as const,
            key: "mistakeLimit" as SettingKey,
            label: "Mistake Limit",
            icon: "exclamation-circle",
            description: "You will lose the game if you make 3 mistakes",
          },
          {
            type: "toggle" as const,
            key: "numberFirst" as SettingKey,
            label: "Number First",
            icon: "hand-point-up",
            description:
              "Long press a number to lock it, then use it to fill multiple cells",
          },
          {
            type: "toggle" as const,
            key: "highlightPeer" as SettingKey,
            label: "Highlight Peer",
            icon: "th",
            description:
              "Highlight the row, column and block of the selected cell",
          },
          {
            type: "toggle" as const,
            key: "highlightSameNumbers" as SettingKey,
            label: "Highlight Same Numbers",
            icon: "equals",
          },
          {
            type: "toggle" as const,
            key: "autoRemoveNotes" as SettingKey,
            label: "Auto Remove Notes",
            icon: "eraser",
          },
          {
            type: "toggle" as const,
            key: "remainingNumbers" as SettingKey,
            label: "Remaining Numbers",
            icon: "list-ol",
          },
          // {
          //   type: "toggle" as const,
          //   key: "showNotes" as SettingKey,
          //   label: "Show Notes",
          //   icon: "sticky-note",
          // },
          // {
          //   type: "toggle" as const,
          //   key: "autoNotes" as SettingKey,
          //   label: "Auto Notes",
          //   icon: "magic",
          // },
          // {
          //   type: "toggle" as const,
          //   key: "showMistakes" as SettingKey,
          //   label: "Show Mistakes",
          //   icon: "times-circle",
          // },
        ],
      },
      {
        title: "Support and Others",
        items: [
          {
            key: "HelpCenter",
            label: "Help Center",
            icon: "question-circle",
            type: "link",
          },
          { key: "About", label: "About", icon: "info-circle", type: "link" },
          {
            key: "quit",
            label: "Quit",
            icon: "power-off",
            type: "link",
          },
        ],
      },
    ],
    []
  );

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

  // Memoize styles to prevent recreation
  const componentStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        section: {
          marginBottom: 16,
        },
        sectionTitle: {
          fontSize: 14,
          marginLeft: 16,
          marginBottom: 8,
        },
        sectionContent: {
          borderRadius: 12,
          marginHorizontal: 16,
        },
      }),
    []
  );

  const handleSettingPress = useCallback(
    (item: SettingItem) => {
      if (item.type === "link") {
        if (item.onPress) {
          item.onPress();
        } else if (item.key === "quit") {
          setShowQuitDialog(true);
        } else {
          const route = item.key as Exclude<
            keyof RootStackParamList,
            "Game" | "Completion"
          >;
          navigation.navigate(route);
        }
      }
    },
    [navigation]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: currentTheme.colors.background,
        gap: 10,
      }}
    >
      <Header
        title="Settings"
        showBackButton
        onBack={() => navigation.goBack()}
        settings={{ ...currentSettings, timer: false }}
        isGameCompleted={false}
        isPaused={false}
        isThemeSelectorVisible={true}
      />
      <ScrollView
        style={[
          componentStyles.container,
          { backgroundColor: currentTheme.colors.background },
        ]}
      >
        {settingSections.map((section, index) => (
          <View key={index} style={componentStyles.section}>
            <Text
              style={[
                componentStyles.sectionTitle,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              {section.title}
            </Text>
            <View
              style={[
                componentStyles.sectionContent,
                { backgroundColor: currentTheme.colors.backgroundLight },
              ]}
            >
              {section.items.map((item) => {
                const settingValue =
                  item.type === "link"
                    ? false
                    : (currentSettings[item.key as SettingKey] as
                        | boolean
                        | Language
                        | FontSize);
                return (
                  <SettingItemComponent
                    key={item.key}
                    item={item}
                    value={settingValue}
                    onValueChange={handleSettingChange}
                    theme={currentTheme}
                    onPress={() => handleSettingPress(item)}
                    updateBaseSettings={updateBaseSettings}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <Dialog
        visible={showQuitDialog}
        title="Quit Application"
        message="Are you sure you want to quit the application?"
        buttons={[
          {
            text: "Cancel",
            onPress: () => setShowQuitDialog(false),
            style: "cancel",
          },
          {
            text: "Quit",
            onPress: handleQuit,
            style: "destructive",
          },
        ]}
        onDismiss={() => setShowQuitDialog(false)}
      />
    </View>
  );
};

export default memo(SettingsScreen);
