import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const quickActions = [
  { id: "1", name: "Send Money", icon: "send" },
  { id: "2", name: "Cash In", icon: "wallet" },
  { id: "3", name: "Pay Bills", icon: "file-tray-full" },
  { id: "4", name: "Buy Load", icon: "phone-portrait" },
  { id: "5", name: "QR Pay", icon: "qr-code" },
  { id: "6", name: "History", icon: "time" },
];

const transactions = [
  { id: "1", name: "Meralco Bill", type: "Bill", amount: "- ₱1,500", time: "10:45 AM" },
  { id: "2", name: "Top Up", type: "Add", amount: "+ ₱2,000", time: "Yesterday" },
  { id: "3", name: "Shopee", type: "Send", amount: "- ₱799", time: "Sep 29" },
  { id: "4", name: "Load Purchase", type: "Bill", amount: "- ₱100", time: "Sep 27" },
];

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>My Wallet</Text>
        <Text style={styles.balanceAmount}>₱ 8,500.00</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceButton}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
            <Text style={styles.balanceButtonText}>Cash In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceButton}>
            <MaterialCommunityIcons name="arrow-down-circle" size={20} color="#fff" />
            <Text style={styles.balanceButtonText}>Cash Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity key={action.id} style={styles.quickItem}>
            <Ionicons name={action.icon} size={28} color="#2563EB" />
            <Text style={styles.quickText}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={styles.transactionIcon}>
                <MaterialCommunityIcons
                  name={item.type === "Add" ? "arrow-down-bold" : "arrow-up-bold"}
                  size={20}
                  color={item.type === "Add" ? "green" : "red"}
                />
              </View>
              <View>
                <Text style={styles.transactionName}>{item.name}</Text>
                <Text style={styles.transactionTime}>{item.time}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === "Add" ? "green" : "red" },
              ]}
            >
              {item.amount}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  balanceCard: {
    backgroundColor: "linear-gradient(90deg, #2563EB, #1D4ED8)", // gradient-like
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  balanceTitle: { color: "#fff", fontSize: 16 },
  balanceAmount: { color: "#fff", fontSize: 30, fontWeight: "bold", marginVertical: 8 },
  balanceActions: { flexDirection: "row", marginTop: 12 },
  balanceButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  balanceButtonText: { color: "#fff", marginLeft: 6, fontSize: 13 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  quickText: { fontSize: 13, marginTop: 6, textAlign: "center", color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#374151" },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  transactionIcon: {
    backgroundColor: "#E5E7EB",
    padding: 6,
    borderRadius: 30,
    marginRight: 10,
  },
  transactionName: { fontSize: 14, fontWeight: "500", color: "#111827" },
  transactionTime: { fontSize: 12, color: "#6B7280" },
  transactionAmount: { fontSize: 14, fontWeight: "bold" },
});