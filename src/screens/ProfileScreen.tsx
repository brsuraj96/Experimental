import React from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import ProfileSection from "../components/ProfileSection";

const ProfileScreen = () => {
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background, paddingTop: 30 },
      ]}
    >
      <Text style={styles.title}>Profile</Text>
      <ProfileSection title="Name" value="John Doe" />
      <ProfileSection title="Email" value="john.doe@example.com" />
      <ProfileSection
        title="Membership"
        value="Free"
        actionText="Upgrade"
        onActionPress={() => {}}
      />
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={currentTheme.isDark} onValueChange={toggleTheme} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
  },
});

export default ProfileScreen;
