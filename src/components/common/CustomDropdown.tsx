import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";

interface CustomDropdownProps<T> {
  value: T;
  options: { label: string; value: T }[];
  onValueChange: (value: T) => void;
  style?: any;
}

const CustomDropdown = <T extends string>({
  value,
  options,
  onValueChange,
  style,
}: CustomDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme } = useTheme();
  const selectedOption = options.find((option) => option.value === value);

  const themedStyles = StyleSheet.create({
    container: {
      minWidth: 120,
      ...style,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.backgroundLight,
    },
    buttonText: {
      fontSize: 12,
      color: currentTheme.colors.text,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    dropdownContainer: {
      backgroundColor: currentTheme.colors.backgroundLight,
      borderRadius: 12,
      padding: 16,
      width: "80%",
      maxWidth: 300,
      maxHeight: "80%",
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    optionText: {
      fontSize: 16,
      color: currentTheme.colors.text,
    },
    selectedOption: {
      backgroundColor: currentTheme.colors.backgroundMedium,
    },
    selectedOptionText: {
      color: currentTheme.colors.primary,
      fontWeight: "600",
    },
    closeButton: {
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: currentTheme.colors.primary,
      alignItems: "center",
    },
    closeButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={themedStyles.container}>
      <TouchableOpacity
        style={themedStyles.button}
        onPress={() => setIsOpen(true)}
      >
        <Text style={themedStyles.buttonText}>
          {selectedOption?.label || "Select"}
        </Text>
        <FontAwesome5
          name="chevron-down"
          size={16}
          color={currentTheme.colors.text}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={themedStyles.modalContainer}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={themedStyles.dropdownContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  themedStyles.option,
                  option.value === value && themedStyles.selectedOption,
                ]}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    themedStyles.optionText,
                    option.value === value && themedStyles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={themedStyles.closeButton}
              onPress={() => setIsOpen(false)}
            >
              <Text style={themedStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;
