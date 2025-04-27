import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Header from "../components/common/Header";
import { useTheme } from "../context/ThemeContext";
import { useSettings, Settings } from "../context/SettingsContext";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

interface SettingsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type SettingItemType = "toggle" | "option" | "link";

interface BaseSettingItem {
  key: string;
  label: string;
  icon: string;
  type: SettingItemType;
  description?: string;
}

interface ToggleSettingItem extends BaseSettingItem {
  type: "toggle";
  key: keyof Settings;
}

interface OptionSettingItem extends BaseSettingItem {
  type: "option";
  value: string;
}

interface LinkSettingItem extends BaseSettingItem {
  type: "link";
  key: keyof RootStackParamList | "quit";
  onPress?: () => void;
}

type SettingItem = ToggleSettingItem | OptionSettingItem | LinkSettingItem;

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { currentTheme } = useTheme();
  const { settings, updateSetting } = useSettings();

  const settingSections: SettingSection[] = [
    {
      title: "General Settings",
      items: [
        { key: "Premium", label: "Get Premium", icon: "crown", type: "link" },
        {
          key: "Statistics",
          label: "Statistics",
          icon: "chart-bar",
          type: "link",
        },
        {
          key: "HowToPlay",
          label: "How to Play",
          icon: "question-circle",
          type: "link",
        },
      ],
    },
    {
      title: "Gameplay Settings",
      items: [
        { key: "timer", label: "Timer", icon: "clock", type: "toggle" },
        {
          key: "mistakeLimit",
          label: "Mistake Limit",
          icon: "exclamation-circle",
          type: "toggle",
          description: "You will lose the game if you make 3 mistakes",
        },
        {
          key: "numberFirst",
          label: "Number First",
          icon: "hand-point-up",
          type: "toggle",
          description:
            "Lock a number by long pressing it, then use it for multiple cells",
        },
        {
          key: "highlightPeer",
          label: "Highlight Peer",
          icon: "th",
          type: "toggle",
          description:
            "Highlight the row, column and block of the selected cell",
        },
        {
          key: "highlightSameNumbers",
          label: "Highlight Same Numbers",
          icon: "equals",
          type: "toggle",
        },
        {
          key: "autoRemoveNotes",
          label: "Auto-Remove Notes",
          icon: "eraser",
          type: "toggle",
        },
        {
          key: "autoComplete",
          label: "Auto Complete",
          icon: "magic",
          type: "toggle",
        },
        {
          key: "completionRate",
          label: "Puzzle Completion Rate",
          icon: "percentage",
          type: "toggle",
        },
        { key: "showScore", label: "Show Score", icon: "star", type: "toggle" },
        {
          key: "tournament",
          label: "Tournament",
          icon: "trophy",
          type: "toggle",
        },
        {
          key: "animatedScoring",
          label: "Animated Scoring",
          icon: "medal",
          type: "toggle",
        },
        {
          key: "lightningMode",
          label: "Lightning Mode",
          icon: "bolt",
          type: "toggle",
        },
        {
          key: "remainingNumbers",
          label: "Remaining Numbers",
          icon: "list-ol",
          type: "toggle",
        },
        {
          key: "smartHint",
          label: "Smart Hint",
          icon: "lightbulb",
          type: "toggle",
        },
      ],
    },
    {
      title: "UI/UX Settings",
      items: [
        {
          key: "language",
          label: "Language",
          icon: "language",
          type: "option",
          value: "English",
        },
        { key: "darkMode", label: "Dark Mode", icon: "moon", type: "toggle" },
      ],
    },
    {
      title: "Sound and Notifications",
      items: [
        {
          key: "audioEffect",
          label: "Audio Effect",
          icon: "volume-up",
          type: "toggle",
        },
        {
          key: "vibration",
          label: "Vibration",
          icon: "mobile-alt",
          type: "toggle",
        },
        {
          key: "notification",
          label: "Notification",
          icon: "bell",
          type: "toggle",
        },
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
          onPress: () => {
            /* handle quit */
          },
        },
      ],
    },
  ];

  const isLinkItem = (item: SettingItem): item is LinkSettingItem =>
    item.type === "link";

  const renderSettingItem = (item: SettingItem) => {
    const renderControl = () => {
      switch (item.type) {
        case "toggle":
          return (
            <Switch
              value={settings[item.key]}
              onValueChange={(value) => updateSetting(item.key, value)}
              trackColor={{
                false: currentTheme.colors.backgroundLight,
                true: currentTheme.colors.primary,
              }}
              thumbColor={
                settings[item.key]
                  ? currentTheme.colors.text
                  : currentTheme.colors.backgroundDark
              }
            />
          );
        case "option":
          return (
            <View style={styles.optionValue}>
              <Text
                style={[styles.optionText, { color: currentTheme.colors.text }]}
              >
                {item.value}
              </Text>
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={currentTheme.colors.text}
              />
            </View>
          );
        default:
          return (
            <FontAwesome5
              name="chevron-right"
              size={16}
              color={currentTheme.colors.text}
            />
          );
      }
    };

    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.settingItem,
          { borderBottomColor: currentTheme.colors.border },
        ]}
        onPress={() => {
          if (isLinkItem(item)) {
            if (item.onPress) {
              item.onPress();
            } else if (item.key !== "quit") {
              // Ensure we're only navigating to valid routes
              const route = item.key as Exclude<
                keyof RootStackParamList,
                "Game" | "Completion"
              >;
              navigation.navigate(route);
            }
          }
        }}
      >
        <View style={styles.settingItemLeft}>
          <FontAwesome5
            name={item.icon}
            size={20}
            color={currentTheme.colors.text}
          />
          <View style={styles.labelContainer}>
            <Text
              style={[styles.settingLabel, { color: currentTheme.colors.text }]}
            >
              {item.label}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.settingDescription,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        {renderControl()}
      </TouchableOpacity>
    );
  };

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
      />
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: currentTheme.colors.background },
        ]}
      >
        {settingSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: currentTheme.colors.backgroundLight },
              ]}
            >
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  labelContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  optionValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginRight: 8,
    fontSize: 16,
  },
});

export default SettingsScreen;
