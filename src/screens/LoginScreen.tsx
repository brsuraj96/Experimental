import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const fakeApi = {
  login: async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (email === "user@example.com" && password === "password123") {
      return {
        ok: true,
        user: {
          email,
          name: "John Doe",
          verified: true,
          membership: "Free Plan",
          profilePhoto: null,
        },
      };
    }
    return { ok: false, error: "Invalid credentials" };
  },
  register: async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    // Simulate registration success
    return {
      ok: true,
      user: {
        email,
        name,
        verified: false,
        membership: "Free Plan",
        profilePhoto: null,
      },
    };
  },
  verifyOtp: async (email: string, otp: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (otp === "123456") return { ok: true };
    return { ok: false, error: "Invalid OTP" };
  },
  sendOtp: async (email: string) => {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  },
};

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [mode, setMode] = useState<"login" | "register" | "otp">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = () => {
    setError("");
    alert("Password reset link sent to your email.");
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    const res = await fakeApi.login(email, password);
    setLoading(false);
    if (res.ok) {
      onLogin(res.user);
    } else {
      setError(res.error ?? "An unknown error occurred");
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    const res = await fakeApi.register(name, email, password);
    setLoading(false);
    if (res.ok) {
      // Send OTP
      await fakeApi.sendOtp(email);
      setMode("otp");
    } else {
      setError("Registration failed.");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) {
      setError("Enter OTP sent to your email.");
      return;
    }
    setLoading(true);
    const res = await fakeApi.verifyOtp(email, otp);
    setLoading(false);
    if (res.ok) {
      onLogin({
        email,
        name,
        verified: true,
        membership: "Free Plan",
        profilePhoto: null,
      });
    } else {
      setError(res.error ?? "An unknown error occurred");
    }
  };

  const { currentTheme } = useTheme();
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        {mode === "login"
          ? "Login"
          : mode === "register"
          ? "Register"
          : "Verify Email"}
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: currentTheme.colors.cardBackground,
            shadowColor: currentTheme.colors.shadow,
          },
        ]}
      >
        {mode === "register" && (
          <View style={styles.inputRow}>
            <Feather
              name="user"
              size={20}
              color={currentTheme.colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: currentTheme.colors.text }]}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={currentTheme.colors.textSecondary}
            />
          </View>
        )}
        {(mode === "login" || mode === "register") && (
          <>
            <View style={styles.inputRow}>
              <Feather
                name="user"
                size={20}
                color={currentTheme.colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: currentTheme.colors.text }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={currentTheme.colors.textSecondary}
              />
            </View>
            <View style={styles.inputRow}>
              <Feather
                name="lock"
                size={20}
                color={currentTheme.colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: currentTheme.colors.text }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={currentTheme.colors.textSecondary}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.showBtn}
              >
                <Text
                  style={{
                    color: currentTheme.colors.textSecondary,
                    fontSize: 16,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {mode === "login" && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotBtn}
              >
                <Text
                  style={[
                    styles.forgotText,
                    { color: currentTheme.colors.primary },
                  ]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {mode === "otp" && (
          <>
            <Text
              style={{
                marginBottom: 8,
                textAlign: "center",
                color: currentTheme.colors.textSecondary,
              }}
            >
              Enter the OTP sent to your email:
            </Text>
            <View style={styles.inputRow}>
              <Feather
                name="mail"
                size={20}
                color={currentTheme.colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: currentTheme.colors.text }]}
                placeholder="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor={currentTheme.colors.textSecondary}
              />
            </View>
          </>
        )}
        {error ? (
          <Text style={[styles.error, { color: currentTheme.colors.error }]}>
            {error}
          </Text>
        ) : null}
        {loading ? (
          <Text
            style={{
              color: currentTheme.colors.textSecondary,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Processing...
          </Text>
        ) : null}
        {mode === "login" && (
          <TouchableOpacity
            style={[
              styles.loginBtn,
              { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={handleLogin}
          >
            <Text
              style={[styles.loginText, { color: currentTheme.colors.white }]}
            >
              Log In
            </Text>
          </TouchableOpacity>
        )}
        {mode === "register" && (
          <TouchableOpacity
            style={[
              styles.loginBtn,
              { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={handleRegister}
          >
            <Text
              style={[styles.loginText, { color: currentTheme.colors.white }]}
            >
              Register
            </Text>
          </TouchableOpacity>
        )}
        {mode === "otp" && (
          <TouchableOpacity
            style={[
              styles.loginBtn,
              { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={handleVerifyOtp}
          >
            <Text
              style={[styles.loginText, { color: currentTheme.colors.white }]}
            >
              Verify
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.bottomRow}>
        {mode === "login" ? (
          <>
            <Text
              style={[
                styles.bottomText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode("register");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.bottomLink,
                  { color: currentTheme.colors.primary },
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </>
        ) : mode === "register" ? (
          <>
            <Text
              style={[
                styles.bottomText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode("login");
                setError("");
              }}
            >
              <Text
                style={[
                  styles.bottomLink,
                  { color: currentTheme.colors.primary },
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafd",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#222",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 18,
    paddingBottom: 2,
    width: "100%",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: "#222",
    backgroundColor: "transparent",
  },
  showBtn: {
    marginLeft: 8,
    padding: 2,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  forgotText: {
    color: "#5a5af7",
    fontWeight: "500",
    fontSize: 15,
  },
  loginBtn: {
    backgroundColor: "#5a5af7",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  error: {
    color: "#d32f2f",
    marginBottom: 12,
    textAlign: "center",
    fontSize: 15,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  bottomText: {
    color: "#888",
    fontSize: 15,
  },
  bottomLink: {
    color: "#5a5af7",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 6,
  },
});

export default LoginScreen;
