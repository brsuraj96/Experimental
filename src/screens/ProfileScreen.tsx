import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import NetInfo from "@react-native-community/netinfo";
import LoginScreen from "./LoginScreen";
import {
  apiGatewayRequest,
} from "../utils/apiGateway";

/**
 * Persistent Profile Screen (offline-first)
 * - Saves to AsyncStorage immediately (optimistic UI)
 * - Optionally syncs with remote API (toggle USE_REMOTE)
 * - Single reusable modal for all flows
 */

const STORAGE_KEY = "profile:user";
const USE_REMOTE = false; // set true when backend is ready

// ---- Types ----
interface User {
  name: string;
  email: string;
  verified: boolean;
  membership: "Free Plan" | "Premium Plan";
  profilePhoto: string | null;
}

const initialUser: User = {
  name: "",
  email: "",
  verified: false,
  membership: "Free Plan",
  profilePhoto: null,
};

// ---- API Gateway Integration ----
const api = {
  updateProfile: async (payload: Partial<User>) => {
    const res = await apiGatewayRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return await res.json();
  },
  uploadProfilePhoto: async (photo: string) => {
    const res = await apiGatewayRequest("/users/me/avatar", {
      method: "POST",
      body: JSON.stringify({ photo }),
    });
    return await res.json();
  },
  upgradeMembership: async () => {
    const res = await apiGatewayRequest("/users/me/membership", {
      method: "PUT",
      body: JSON.stringify({ membership: "premium" }),
    });
    return await res.json();
  },
  changePassword: async (newPassword: string) => {
    const res = await apiGatewayRequest("/users/me/password", {
      method: "PUT",
      body: JSON.stringify({ password: newPassword }),
    });
    return await res.json();
  },
  enable2FA: async () => {
    const res = await apiGatewayRequest("/users/me/2fa", {
      method: "POST" });
    return await res.json();
  },
  logout: async () => {
    const res = await apiGatewayRequest("/auth/logout", { method: "POST" });
    return await res.json();
  },
};

// ---- Helpers ----
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Offline request queue
let requestQueue: Array<{ type: string; payload: any }> = [];
const processQueue = async () => {
  if (!requestQueue.length) return;
  const { type, payload } = requestQueue[0];
  try {
    if (type === "profile") await api.updateProfile(payload);
    if (type === "photo") await api.uploadProfilePhoto(payload);
    requestQueue.shift();
    await AsyncStorage.setItem("@requestQueue", JSON.stringify(requestQueue));
    processQueue(); // Process next
  } catch (err) {
    console.log("Queue process failed, will retry later.");
  }
};

const ProfileScreen = () => {
  const { currentTheme } = useTheme();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    null | "edit" | "upgrade" | "password" | "2fa" | "logout"
  >(null);
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: User = JSON.parse(raw);
          setUser(parsed);
          setEditName(parsed.name);
          setEditEmail(parsed.email);
          setPhoto(parsed.profilePhoto);
        } else {
          setUser(initialUser);
          // prime storage with default
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialUser));
          setEditName(initialUser.name);
          setEditEmail(initialUser.email);
          setPhoto(initialUser.profilePhoto);
        }
      } catch (e) {
        console.warn("Failed to load user from storage", e);
        setUser(initialUser);
      } finally {
        setLoading(false);
      }
    })();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        processQueue();
      }
    });
    return () => unsubscribe();
  }, []);

  const persistUser = useCallback(async (next: User) => {
    setUser(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // Helpers
  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, []);

  const openModal = useCallback((type: NonNullable<typeof modalType>) => {
    setModalType(type);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setModalType(null);
    setTempPassword("");
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  // ---- Actions (optimistic, offline-first) ----
  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    const next: User = {
      ...user,
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
    };

    if (!emailRegex.test(next.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // optimistic update
    await persistUser(next);

    if (USE_REMOTE) {
      try {
        setSyncing(true);
        const res = await api.updateProfile({
          name: next.name,
          email: next.email,
        });
        if (!res.ok) throw new Error("Update failed");
      } catch (e) {
        Alert.alert("Sync Failed", "Changes saved locally. We'll retry later.");
      } finally {
        setSyncing(false);
      }
    }

    closeModal();
    Alert.alert("Profile Updated", "Your profile has been updated.");
  }, [user, editName, editEmail, persistUser, closeModal]);

  const handleConfirmUpgrade = useCallback(async () => {
    if (!user) return;
    const next: User = { ...user, membership: "Premium Plan" };

    // optimistic
    await persistUser(next);

    if (USE_REMOTE) {
      try {
        setSyncing(true);
        const res = await api.upgradeMembership();
        if (!res.ok) throw new Error("Upgrade failed");
      } catch (e) {
        Alert.alert("Sync Failed", "Upgrade saved locally. We'll retry later.");
      } finally {
        setSyncing(false);
      }
    }

    closeModal();
    Alert.alert(
      "Upgraded!",
      "You now have unlimited hints and ad-free experience."
    );
  }, [user, persistUser, closeModal]);

  const handleConfirmChangePassword = useCallback(async () => {
    if (!tempPassword.trim()) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (USE_REMOTE) {
      try {
        setSyncing(true);
        const res = await api.changePassword(tempPassword.trim());
        if (!res.ok) throw new Error("Password change failed");
      } catch (e) {
        Alert.alert(
          "Sync Failed",
          "We'll try to update your password when back online."
        );
      } finally {
        setSyncing(false);
      }
    }

    closeModal();
    Alert.alert("Password Changed", "Your password has been updated.");
  }, [tempPassword, closeModal]);

  const handleConfirm2FA = useCallback(async () => {
    if (USE_REMOTE) {
      try {
        setSyncing(true);
        const res = await api.enable2FA();
        if (!res.ok) throw new Error("2FA failed");
      } catch (e) {
        Alert.alert("Sync Failed", "We'll try enabling 2FA again later.");
      } finally {
        setSyncing(false);
      }
    }

    closeModal();
    Alert.alert("2FA Enabled", "Two-factor authentication is now active.");
  }, [closeModal]);

  const handleConfirmLogout = useCallback(async () => {
    try {
      if (USE_REMOTE) {
        setSyncing(true);
        await api.logout();
      }
      // clear local profile (simulate session end)
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(initialUser); // or navigate to auth screen
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialUser));
    } catch (e) {
      console.warn("Logout cleanup failed", e);
    } finally {
      setSyncing(false);
      closeModal();
      Alert.alert("Logged Out", "You have been logged out.");
    }
  }, [closeModal]);

  // ---- Modal Content ----
  const renderModalContent = useMemo(() => {
    switch (modalType) {
      case "edit":
        return (
          <>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              value={editName}
              onChangeText={setEditName}
              style={styles.modalInput}
              autoCapitalize="words"
            />
            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={editEmail}
              onChangeText={setEditEmail}
              style={styles.modalInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile}>
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "upgrade":
        return (
          <>
            <Text style={styles.modalTitle}>Upgrade Membership</Text>
            <Text style={styles.modalDesc}>
              Unlock unlimited hints and ad-free experience!
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmUpgrade}>
                <Text style={styles.confirmText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "password":
        return (
          <>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                placeholder="New Password"
                secureTextEntry={!showPassword}
                value={tempPassword}
                onChangeText={setTempPassword}
                style={[styles.modalInput, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={{ marginLeft: 8 }}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmChangePassword}>
                <Text style={styles.confirmText}>Change</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "2fa":
        return (
          <>
            <Text style={styles.modalTitle}>
              Enable Two-Factor Authentication
            </Text>
            <Text style={styles.modalDesc}>
              A code will be sent to your email for verification.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm2FA}>
                <Text style={styles.confirmText}>Enable</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "logout":
        return (
          <>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalDesc}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmLogout}>
                <Text style={[styles.confirmText, { color: "#d32f2f" }]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  }, [
    modalType,
    editName,
    editEmail,
    tempPassword,
    closeModal,
    handleSaveProfile,
    handleConfirmUpgrade,
    handleConfirmChangePassword,
    handleConfirm2FA,
    handleConfirmLogout,
  ]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  if (!user || !user.email) {
    // Show login page if not logged in
    return (
      <LoginScreen
        onLogin={async (newUser) => {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
          setUser(newUser);
          setEditName(newUser.name);
          setEditEmail(newUser.email);
          setPhoto(newUser.profilePhoto);
        }}
      />
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => openModal("edit")}
          >
            <Feather
              name="edit"
              size={20}
              color={currentTheme.colors.primary}
            />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          {user.profilePhoto ? (
            <Image
              source={{ uri: user.profilePhoto }}
              style={styles.profilePhoto}
            />
          ) : (
            <View
              style={[
                styles.initialsCircle,
                { backgroundColor: currentTheme.colors.primary },
              ]}
            >
              <Text style={styles.initialsText}>{getInitials(user.name)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editPhotoBtn}
            onPress={async () => {
              // Request permission
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission required",
                  "Please allow access to your photos."
                );
                return;
              }
              // Pick image
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });
              if (
                !result.canceled &&
                result.assets &&
                result.assets.length > 0
              ) {
                const uri = result.assets[0].uri;
                // Preview instantly
                const next = { ...user, profilePhoto: uri };
                setUser(next);
                setPhoto(uri);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                // Queue upload if offline
                const netState = await NetInfo.fetch();
                if (USE_REMOTE) {
                  if (netState.isConnected) {
                    await api.uploadProfilePhoto(uri);
                  } else {
                    // Add to requestQueue for later
                    requestQueue.push({ type: "photo", payload: uri });
                    await AsyncStorage.setItem(
                      "@requestQueue",
                      JSON.stringify(requestQueue)
                    );
                  }
                }
                Alert.alert(
                  "Photo Updated",
                  "Your profile photo has been updated."
                );
              }
            }}
          >
            <Feather
              name="camera"
              size={18}
              color={currentTheme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <FontAwesome5
              name="user"
              size={18}
              color={currentTheme.colors.primary}
              style={styles.infoIcon}
            />
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="email"
              size={18}
              color={currentTheme.colors.primary}
              style={styles.infoIcon}
            />
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
              <View style={styles.verifiedRow}>
                <Feather
                  name={user.verified ? "check-circle" : "alert-circle"}
                  size={16}
                  color={user.verified ? "green" : "orange"}
                />
                <Text
                  style={[
                    styles.verifiedText,
                    { color: user.verified ? "green" : "orange" },
                  ]}
                >
                  {user.verified ? " Verified" : " Not Verified"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Membership */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <FontAwesome5
              name="crown"
              size={18}
              color={currentTheme.colors.primary}
              style={styles.infoIcon}
            />
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Membership</Text>
              <Text style={styles.infoValue}>{user.membership}</Text>
              <Text style={styles.membershipBenefits}>
                Unlimited hints, ad-free experience.
              </Text>
              {user.membership === "Free Plan" ? (
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  onPress={() => openModal("upgrade")}
                >
                  <Text style={styles.upgradeBtnText}>Upgrade</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[styles.upgradeBtn, { backgroundColor: "#2e7d32" }]}
                >
                  <Text style={styles.upgradeBtnText}>Premium Active</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Security */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.securityRow}
            onPress={() => openModal("password")}
          >
            <Feather
              name="lock"
              size={18}
              color={currentTheme.colors.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.securityText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.securityRow}
            onPress={() => openModal("2fa")}
          >
            <Feather
              name="shield"
              size={18}
              color={currentTheme.colors.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.securityText}>Two-Factor Authentication</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            style={[
              styles.logoutBtnLayout,
              {
                backgroundColor: currentTheme.colors.primary,
                width: "92%",
                borderRadius: 16,
                shadowColor: currentTheme.colors.shadow,
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
            onPress={() => openModal("logout")}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Unified Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {syncing ? (
              <View style={{ alignItems: "center" }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>Syncing…</Text>
              </View>
            ) : (
              renderModalContent
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#222" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    marginLeft: 6,
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 15,
  },
  profilePhotoContainer: {
    alignItems: "center",
    marginBottom: 18,
    position: "relative",
  },
  profilePhoto: { width: 80, height: 80, borderRadius: 40, marginBottom: 4 },
  initialsCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  initialsText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
  editPhotoBtn: {
    position: "absolute",
    right: 10,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  card: {
    backgroundColor: "#f7f7fa",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoIcon: { marginRight: 12 },
  infoTextBlock: { flex: 1 },
  infoLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    marginBottom: 2,
  },
  verifiedRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  verifiedText: { fontSize: 13, fontWeight: "500" },
  membershipBenefits: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 8,
  },
  upgradeBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  upgradeBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  securityText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutBtn: { marginTop: 18, marginBottom: 32, alignSelf: "center" },
  logoutBtnLayout: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: 320,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  modalLabel: { fontWeight: "bold", marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 8,
    marginBottom: 18,
  },
  modalDesc: { marginBottom: 18 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { marginRight: 16 },
  cancelText: { color: "#888", fontWeight: "bold" },
  confirmText: { color: "#007AFF", fontWeight: "bold" },
});

export default ProfileScreen;
