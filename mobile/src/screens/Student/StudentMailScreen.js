import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


export default function StudentMailScreen() {
    const {
    notifications,
    getNotification,
    markAsReadById,
    deleteNotificationById,
  } = useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sortOrder, setSortOrder] = useState("Newest");

  // 🔹 Fetch notifications on screen focus
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        await getNotification();
        setLoading(false);
      };
      fetchData();
    }, [getNotification])
  );
  
  // 🔹 Mark as read
const markAsRead = async (id) => {
  try {
    await markAsReadById(id);
    // store already updates `notifications`, no need for setMessages
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};

// 🔹 Delete
const deleteNotification = async (id) => {
  try {
    await deleteNotificationById(id);
    setActionModalVisible(false);
    // store already updates `notifications`
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

  // 🔹 Copy OTP
  const copyToClipboard = async (otp) => {
    await Clipboard.setStringAsync(otp);
  };

  // 🔹 Filter + sort
  const filteredMessages = (notifications || [])
    .filter((msg) =>
      activeTab === "All"
        ? true
        : activeTab === "Unread"
        ? !msg.is_read
        : msg.is_read
    )
    .sort((a, b) => {
      if (sortOrder === "Newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "Oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortOrder === "A-Z") return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });

  const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonTitle} />
    <View style={styles.skeletonBody} />
    <View style={styles.skeletonDate} />
  </View>
);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {['All', 'Unread', 'Read'].map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Header */}
      <View style={styles.messageHeader}>
        <Text style={styles.messageCount}>All Messages ({filteredMessages.length})</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Feather name="filter" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading ? (
        <ScrollView contentContainerStyle={styles.flatListContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.flatListContent} showsVerticalScrollIndicator={false}>
          {filteredMessages.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              style={[styles.card, msg.is_read && { opacity: 0.6 }]}
              onPress={() => {
                setSelectedMessage(msg);
                setActionModalVisible(true);
                if (!msg.is_read) markAsRead(msg.id);
              }}
            >
              <Text style={styles.msgTitle}>{msg.title}</Text>
              <Text style={styles.msgBody} numberOfLines={2}>{msg.message}</Text>
              <Text style={styles.msgDate}>{new Date(msg.created_at).toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {['Newest', 'Oldest', sortOrder === 'A-Z' ? 'Z-A' : 'A-Z'].map((option) => (
              <TouchableOpacity key={option} onPress={() => {
                setSortOrder(option);
                setFilterModalVisible(false);
              }}>
                <Text style={styles.modalOption}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal visible={actionModalVisible} transparent animationType="slide">
        <View style={styles.actionOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setActionModalVisible(false)} />
          <View style={styles.actionSheet}>
            {selectedMessage && (
              <>
                {selectedMessage.type === 'otp' ? (() => {
                  // Extract OTP
                  const match = selectedMessage.message.match(/OTP:\s*(\d+)\s*-\s*(.*)/i);
                  const otpCode = match ? match[1] : '';
                  const msgText = "Please show this to your supervisor.";

                  return (
                    <>
                      <Text style={styles.supervisorText}>{msgText}</Text>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(otpCode)}
                        style={styles.otpBox}
                      >
                        <Text style={styles.otpText}>{otpCode}</Text>
                        <Text style={styles.tapHint}>Tap to copy</Text>
                      </TouchableOpacity>
                    </>
                  );
                })() : (
                  <>
                    <Text style={styles.modalTitle}>{selectedMessage.title}</Text>
                    <Text style={{ fontSize: 14, color: '#444', marginBottom: 16 }}>
                      {selectedMessage.message}
                    </Text>
                  </>
                )}

                {/* Delete button */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => deleteNotification(selectedMessage.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#e53935" />
                  <Text style={[styles.actionText, { color: '#e53935' }]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 16, backgroundColor: '#f9fafb' },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  tabBtn: { paddingVertical: 8 },
  tabText: { fontSize: 14, color: '#666' },
  tabTextActive: { fontWeight: 'bold', color: '#2076cc' },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  messageCount: { fontSize: 16, fontWeight: '600' },
  flatListContent: { paddingBottom: 50 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  msgTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  msgBody: { fontSize: 14, color: '#444' },
  msgDate: { fontSize: 12, color: '#888', marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 8, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalOption: { paddingVertical: 10, fontSize: 16 },
  modalClose: { fontSize: 16, marginTop: 10, textAlign: 'right', fontWeight: '600' },

  /* Slide-up modal */
  actionOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  backdrop: { flex: 1 },
  actionSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  actionText: { fontSize: 16, fontWeight: '500', color: '#333' },

  supervisorText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  otpText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2076cc',
    letterSpacing: 4,
  },
  tapHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  skeletonCard: {
  backgroundColor: "#fff",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
},
skeletonTitle: {
  height: 16,
  backgroundColor: "#e0e0e0",
  borderRadius: 4,
  marginBottom: 8,
  width: "60%",
},
skeletonBody: {
  height: 14,
  backgroundColor: "#e0e0e0",
  borderRadius: 4,
  marginBottom: 6,
  width: "90%",
},
skeletonDate: {
  height: 12,
  backgroundColor: "#e0e0e0",
  borderRadius: 4,
  width: "40%",
},
});
