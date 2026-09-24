import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function RatingModal({ visible, supervisor, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Supervisor Details */}
          <Image source={{ uri: supervisor.image }} style={styles.avatar} />
          <Text style={styles.name}>{supervisor.name}</Text>
          <Text style={styles.company}>{supervisor.company}</Text>

          {/* Stars */}
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Icon
                  name={i <= rating ? "star" : "star-o"}
                  size={32}
                  color="#FFD700"
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment box */}
          <TextInput
            style={styles.input}
            placeholder="Leave a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
          />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold" },
  company: { fontSize: 14, color: "gray", marginBottom: 10 },
  stars: { flexDirection: "row", marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  btnCancel: {
    backgroundColor: "#999",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  btnSubmit: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
