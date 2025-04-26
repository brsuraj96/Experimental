import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { theme } from "../../styles/theme";

interface DropdownProps<T> {
  value: T;
  items: T[];
  onChange: (value: T) => void;
  containerStyle?: ViewStyle;
  getLabel?: (item: T) => string;
}

function Dropdown<T extends string>({
  value,
  items,
  onChange,
  containerStyle,
  getLabel = (item) => item,
}: DropdownProps<T>) {
  if (Platform.OS === "android") {
    return (
      <View style={[styles.container, containerStyle]}>
        <Picker
          selectedValue={value}
          style={styles.picker}
          onValueChange={onChange}
        >
          {items.map((item) => (
            <Picker.Item key={item} label={getLabel(item)} value={item} />
          ))}
        </Picker>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          const currentIndex = items.indexOf(value);
          const nextValue = items[(currentIndex + 1) % items.length];
          onChange(nextValue);
        }}
      >
        <View style={styles.content}>
          <Text style={styles.text}>{getLabel(value)}</Text>
          <Text style={styles.icon}>▼</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
  },
  picker: {
    height: 50,
    width: 150,
    color: theme.colors.text,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
  },
  button: {
    backgroundColor: theme.colors.backgroundLight,
    padding: 2,
    borderRadius: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  text: {
    color: theme.colors.text,
    fontSize: 12,
  },
  icon: {
    color: theme.colors.text,
    fontSize: 12,
  },
});

export default Dropdown;
