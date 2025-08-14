import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ProfileSection = ({
  title,
  value,
  actionText,
  onActionPress,
}: {
  title: string;
  value: string;
  actionText?: string;
  onActionPress?: () => void;
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    fontSize: 14,
    marginTop: 4,
  },
  action: {
    fontSize: 14,
    color: "blue",
    marginTop: 4,
  },
});

export default ProfileSection;
