import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "@/store/useAuthStore";

export default function EditProfileScreen() {
  const { profile, getUserProfile, updateUserProfile, loading } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(null); // "success" | "error"
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch profile once
  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  // Sync UI state when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.complete_name || "");
      setUsername(profile.username || "");
      setEmail(profile.email || "");
      setBirthday(profile.birthdate || "");
      setProfileImage(profile.avatar_url || null);
    }
  }, [profile]);

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  // Check if data changed
  const hasChanges =
    file ||
    name !== (profile?.complete_name || "") ||
    username !== (profile?.username || "") ||
    email !== (profile?.email || "") ||
    birthday !== (profile?.birthdate || "");

  // Save profile
  const handleSave = async () => {
    setMessage("");
    setMessageType(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("birthday", birthday);

      if (file) {
        formData.append("profileImage", {
          uri: file.uri,
          type: file.mimeType || "image/jpeg",
          name: file.fileName || "profile.jpg",
        });
      }

      await updateUserProfile(formData);
      await getUserProfile();
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
      setMessageType("error");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Profile Photo */}
        <View style={styles.profilePicContainer}>
          <Image
            source={{
              uri: file?.uri || profileImage || "https://static.vecteezy.com/system/resources/previews/037/336/395/non_2x/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg",
            }}
            style={styles.profilePic}
          />
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changePhoto}>
              {profileImage ? "Change photo" : "Add photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.item}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Add email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Birthday</Text>
            <TouchableOpacity
              style={{ flex: 2 }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.input, { paddingVertical: 0 }]}>
                {birthday || "Add birthday"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={birthday ? new Date(birthday) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setBirthday(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
        )}

        {/* Feedback Message */}
        {message ? (
          <View
            style={[
              styles.messageBox,
              messageType === "success" ? styles.successBox : styles.errorBox,
            ]}
          >
            <Icon
              name={messageType === "success" ? "checkmark-circle" : "close-circle"}
              size={20}
              color={messageType === "success" ? "green" : "red"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: messageType === "success" ? "green" : "red",
                fontSize: 14,
              }}
            >
              {message}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          disabled={!hasChanges || loading}
          onPress={handleSave}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profilePicContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhoto: {
    marginTop: 8,
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  input: {
    flex: 2,
    fontSize: 14,
    color: "#000",
    textAlign: "right",
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 10,
    borderRadius: 6,
  },
  successBox: {
    backgroundColor: "#E6F4EA",
    borderColor: "green",
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: "#FDECEA",
    borderColor: "red",
    borderWidth: 1,
  },
});
