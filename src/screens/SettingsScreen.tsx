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
import { useLocalization } from "../context/LocalizationContext";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
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
  const { t, locale, setLocale, availableLocales } = useLocalization();
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
      if (key === "language") {
        setLocale(value as Language); // update i18next language immediately
      }
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
      setLocale,
    ]
  );

  // Memoize setting sections to prevent recreation
  const settingSections = useMemo<SettingSection[]>(
    () => [
      {
        title: t("generalSettings"),
        items: [
          {
            type: "toggle" as const,
            key: "audioEffect" as SettingKey,
            label: t("soundEffects"),
            icon: "volume-up",
          },
          {
            type: "toggle" as const,
            key: "vibration" as SettingKey,
            label: t("vibration"),
            icon: "mobile-alt",
          },
          {
            type: "toggle" as const,
            key: "darkMode" as SettingKey,
            label: t("darkMode"),
            icon: "moon",
          },
          {
            type: "option" as const,
            key: "fontSize" as keyof BaseSettings,
            label: t("fontSize"),
            icon: "text-height",
            options: [
              { label: t("small"), value: "small" as FontSize },
              { label: t("medium"), value: "medium" as FontSize },
              { label: t("large"), value: "large" as FontSize },
            ],
          },
          {
            type: "option" as const,
            key: "language" as keyof BaseSettings,
            label: t("language"),
            icon: "language",
            // options: [
            //   { label: t("english"), value: "en" as Language },
            //   { label: t("spanish"), value: "es" as Language },
            //   { label: t("french"), value: "fr" as Language },
            //   { label: t("german"), value: "de" as Language },
            //   { label: t("chinese"), value: "zh" as Language },
            //   { label: t("hindi"), value: "hi" as Language },
            //   { label: t("arabic"), value: "ar" as Language },
            //   { label: t("russian"), value: "ru" as Language },
            //   { label: t("japanese"), value: "ja" as Language },
            //   { label: t("portuguese"), value: "pt" as Language },
            //   { label: t("italian"), value: "it" as Language },
            //   { label: t("korean"), value: "ko" as Language },
            //   { label: t("turkish"), value: "tr" as Language },
            //   { label: t("polish"), value: "pl" as Language },
            //   { label: t("dutch"), value: "nl" as Language },
            //   { label: t("swedish"), value: "sv" as Language },
            // ],
            options: availableLocales.map((locale) => ({
              label: locale.label,
              value: locale.code as Language,
            })),
          },
        ],
      },
      {
        title: t("Game Settings"),
        items: [
          // {
          //   type: "toggle" as const,
          //   key: "timer" as SettingKey,
          //   label: t("timer"),
          //   icon: "clock",
          // },
          {
            type: "toggle" as const,
            key: "smartHint" as SettingKey,
            label: t("smartHint"),
            icon: "lightbulb",
          },
          {
            type: "toggle" as const,
            key: "showScore" as SettingKey,
            label: t("showScore"),
            icon: "star",
          },
          {
            type: "toggle" as const,
            key: "showProgress" as SettingKey,
            label: t("showProgress"),
            icon: "chart-line",
          },
        ],
      },
      {
        title: t("Sudoku Settings"),
        items: [
          {
            type: "toggle" as const,
            key: "mistakeLimit" as SettingKey,
            label: t("mistakeLimit"),
            icon: "exclamation-circle",
            description: t("You will lose the game if you make 3 mistakes"),
          },
          {
            type: "toggle" as const,
            key: "numberFirst" as SettingKey,
            label: t("Number First"),
            icon: "hand-point-up",
            description: t(
              "Long press a number to lock it, then use it to fill multiple cells"
            ),
          },
          {
            type: "toggle" as const,
            key: "highlightPeer" as SettingKey,
            label: t("Highlight Peer"),
            icon: "th",
            description: t(
              "Highlight the row, column and block of the selected cell"
            ),
          },
          {
            type: "toggle" as const,
            key: "highlightSameNumbers" as SettingKey,
            label: t("Highlight Same Numbers"),
            icon: "equals",
          },
          {
            type: "toggle" as const,
            key: "autoRemoveNotes" as SettingKey,
            label: t("Auto Remove Notes"),
            icon: "eraser",
          },
          {
            type: "toggle" as const,
            key: "remainingNumbers" as SettingKey,
            label: t("Remaining Numbers"),
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
        title: t("Support and Others"),
        items: [
          {
            key: "HowToPlay",
            label: t("How To Play"),
            icon: "file-alt",
            type: "link",
          },
          {
            key: "HelpCenter",
            label: t("Help Center"),
            icon: "question-circle",
            type: "link",
          },
          {
            key: "About",
            label: t("About"),
            icon: "info-circle",
            type: "link",
          },
          {
            key: "quit",
            label: t("Quit"),
            icon: "power-off",
            type: "link",
          },
        ],
      },
    ],
    [t, locale, availableLocales]
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
        } else if (item.key === "HelpCenter") {
          navigation.navigate("HelpCenter");
        } else if (item.key === "HowToPlay") {
          navigation.navigate("HowToPlay");
        } else if (item.key === "HowToPlayDetail") {
          navigation.navigate("HowToPlayDetail", { gameType: currentGameType });
        } else {
          navigation.navigate(item.key as any);
        }
      }
    },
    [navigation, currentGameType]
  );

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
    <View
      style={{
        flex: 1,
        backgroundColor: currentTheme.colors.background,
        gap: 10,
      }}
    >
      <Header
        title={t("settings")}
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
                if (
                  (item.key as string) === "showProgress" &&
                  !("showScore" in currentSettings && currentSettings.showScore)
                ) {
                  return null;
                }
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
  );
};

export default memo(SettingsScreen);
