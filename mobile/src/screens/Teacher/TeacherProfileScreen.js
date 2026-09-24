import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useAuth } from "@/store/useAuthStore";

export default function TeacherProfileScreen() {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const navigation = useNavigation();
  const { profile, logout } = useAuth();

  const MenuItem = ({ icon, label, onPress, tag }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!!tag}>
      <View style={styles.menuLeft}>
        {icon}
        <Text style={styles.menuText}>{label}</Text>
        {tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {/* Left Avatar */}
          <View style={styles.avatar}>
            <Image
              source={{ uri: profile?.avatar_url || 'https://www.gravatar.com/avatar/placeholder' }}
              style={styles.avatarImage}
            />
          </View>

          {/* Right User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.name}>{profile?.complete_name || "Unknown"}</Text>
            <Text style={styles.email}>{profile?.email || "N/A"}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {/* Edit Profile */}
          <MenuItem
            icon={<Ionicons name="person-outline" size={20} color="#0057ff" />}
            label="Edit Profile"
            onPress={() => navigation.navigate("EditProfile")}
          />
          {/* Change Password */}
          <MenuItem
            icon={<Ionicons name="lock-closed-outline" size={20} color="#0057ff" />}
            label="Change Password"
            onPress={() => navigation.navigate("ChangePassword")}
          />
          {/* Manage notifications */}
          <MenuItem
            icon={<Ionicons name="notifications-outline" size={20} color="#0057ff" />}
            label="Manage Notifications"
            onPress={() => navigation.navigate("ManageNotifications")}
          />

          {/* Settings (Coming Soon) */}
          {/* <MenuItem
            icon={<Ionicons name="settings-outline" size={20} color="#0057ff" />}
            label="Settings"
            tag="Coming Soon"
          /> */}

          {/*Instructions Page */}
          <MenuItem
            icon={<Ionicons name="book-outline" size={20} color="#0057ff" />}
            label="Instructions"
            onPress={() => navigation.navigate("Instructions")}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Logout */}
          <MenuItem
            icon={<Ionicons name="log-out-outline" size={20} color="red" />}
            label="Logout"
            onPress={() => setLogoutVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.logoutConfirmButton]}
                onPress={() => {
                  setLogoutVisible(false);
                  logout();
                }}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    backgroundColor: "#3a5bc0ff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 80,
  },
  avatar: {
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  userInfo: { flex: 1 },
  name: { color: "#fff", fontSize: 18, fontWeight: "600" },
  email: { color: "#fff", fontSize: 14, marginTop: 2 },
  menu: { marginTop: 15, backgroundColor: "#fff" },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { marginLeft: 12, fontSize: 15, color: "#333" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },

  // Tag styles
  tag: {
    marginLeft: 8,
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: "#666", fontWeight: "500" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#eee" },
  logoutConfirmButton: { backgroundColor: "red" },
  cancelText: { color: "#333", fontWeight: "600" },
  logoutText: { color: "#fff", fontWeight: "600" },
});
