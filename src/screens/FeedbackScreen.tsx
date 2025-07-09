import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

const FEEDBACK_OPTIONS = [
  "Select the Problem Type",
  "Purchase",
  "Bug",
  "Suggestion",
];

const FeedbackScreen = () => {
  const { currentTheme } = useTheme();
  const navigation = useNavigation();
  const HIGHLIGHT_COLOR = currentTheme.colors.primary;
  const ERROR_COLOR = currentTheme.colors.error || "#e53935";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(FEEDBACK_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [dropdownFocused, setDropdownFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    category: false,
    message: false,
  });
  const [submitted, setSubmitted] = useState(false);

  // Validation logic
  const isNameValid = name.trim().length > 0;
  const isCategoryValid = category !== FEEDBACK_OPTIONS[0];
  const isMessageValid = message.trim().length > 0;
  const isFormValid = isNameValid && isCategoryValid && isMessageValid;

  const showNameError = (touched.name || submitted) && !isNameValid;
  const showCategoryError = (touched.category || submitted) && !isCategoryValid;
  const showMessageError = (touched.message || submitted) && !isMessageValid;

  const handleSend = () => {
    setSubmitted(true);
    if (!isFormValid) return;
    // Placeholder: Implement send logic
    navigation.goBack();
  };

  // Deselect all inputs and close dropdown on outside press
  const handleDismiss = () => {
    Keyboard.dismiss();
    setNameFocused(false);
    setEmailFocused(false);
    setDropdownFocused(false);
    setMessageFocused(false);
    setDropdownOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: currentTheme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: currentTheme.colors.primary },
            ]}
          >
            <Text
              style={[styles.headerTitle, { color: currentTheme.colors.white }]}
            >
              Help Center
            </Text>
            <Text
              style={[
                styles.headerSubTitle,
                { color: currentTheme.colors.white },
              ]}
            >
              Provide your feed back here
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome5
                name="times"
                size={24}
                color={currentTheme.colors.white}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={[styles.label, { color: currentTheme.colors.text }]}>
              Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.backgroundLight,
                  borderColor: currentTheme.colors.border,
                },
                nameFocused && { borderColor: HIGHLIGHT_COLOR },
                showNameError && { borderColor: ERROR_COLOR },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name here"
              placeholderTextColor={currentTheme.colors.textSecondary}
              onFocus={() => {
                setNameFocused(true);
                setTouched((t) => ({ ...t, name: true }));
              }}
              onBlur={() => setNameFocused(false)}
              returnKeyType="next"
            />
            {showNameError && (
              <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                Name is required.
              </Text>
            )}
            <Text style={[styles.label, { color: currentTheme.colors.text }]}>
              E-Mail (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.backgroundLight,
                  borderColor: currentTheme.colors.border,
                },
                emailFocused && { borderColor: HIGHLIGHT_COLOR },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email id here"
              placeholderTextColor={currentTheme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              returnKeyType="next"
            />
            <Text style={[styles.label, { color: currentTheme.colors.text }]}>
              Opinion Category
            </Text>
            {/* Dropdown */}
            <View style={{ position: "relative", marginBottom: 4 }}>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: currentTheme.colors.backgroundLight,
                    borderColor: currentTheme.colors.border,
                  },
                  (dropdownOpen || dropdownFocused) && {
                    borderColor: HIGHLIGHT_COLOR,
                  },
                  showCategoryError && { borderColor: ERROR_COLOR },
                ]}
                onPress={() => {
                  setDropdownOpen((open) => !open);
                  setDropdownFocused(true);
                  setTouched((t) => ({ ...t, category: true }));
                }}
                activeOpacity={0.8}
                onBlur={() => setDropdownFocused(false)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {category}
                </Text>
                <FontAwesome5
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={currentTheme.colors.textSecondary}
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
              {dropdownOpen && (
                <View
                  style={[
                    styles.dropdownList,
                    {
                      backgroundColor: currentTheme.colors.backgroundLight,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                >
                  {FEEDBACK_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        option === category && {
                          backgroundColor: HIGHLIGHT_COLOR,
                        },
                      ]}
                      onPress={() => {
                        setCategory(option);
                        setDropdownOpen(false);
                        setDropdownFocused(false);
                        setTouched((t) => ({ ...t, category: true }));
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: currentTheme.colors.text },
                          option === category && {
                            color: currentTheme.colors.white,
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {showCategoryError && (
              <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                Please select a problem type.
              </Text>
            )}
            <Text style={[styles.label, { color: currentTheme.colors.text }]}>
              Message
            </Text>
            {/* Multiline Text Input */}
            <TextInput
              style={[
                styles.textArea,
                {
                  color: currentTheme.colors.text,
                  backgroundColor: currentTheme.colors.backgroundLight,
                  borderColor: currentTheme.colors.border,
                },
                messageFocused && { borderColor: HIGHLIGHT_COLOR },
                showMessageError && { borderColor: ERROR_COLOR },
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your feedback here"
              placeholderTextColor={currentTheme.colors.textSecondary}
              multiline
              numberOfLines={6}
              onFocus={() => {
                setMessageFocused(true);
                setTouched((t) => ({ ...t, message: true }));
              }}
              onBlur={() => setMessageFocused(false)}
            />
            {showMessageError && (
              <Text style={[styles.errorText, { color: ERROR_COLOR }]}>
                Message is required.
              </Text>
            )}
            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, !isFormValid && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={!isFormValid}
            >
              <FontAwesome5
                name="location-arrow"
                size={32}
                color={currentTheme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    paddingHorizontal: 16,
    position: "relative",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    paddingTop: 6,
  },
  headerSubTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 15,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownList: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 4,
    maxHeight: 160,
    overflow: "hidden",
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginTop: 8,
    minHeight: 250,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 13,
    marginBottom: 2,
    marginLeft: 2,
  },
  sendButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "transparent",
    zIndex: 2,
  },
});

export default FeedbackScreen;
