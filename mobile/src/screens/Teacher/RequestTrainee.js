// Supervisor: trainees asking to be supervised. Accept or decline each request.
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useTraineeStore from "@/store/useTraineeStore";
import Avatar from "@/components/Avatar";
import { errorMessage } from "@/lib/api";
import { notify } from "@/lib/notify";

export default function RequestTraineeScreen() {
  const { traineeRequests, fetchTraineeRequests, updateTraineeRequest, fetchTrainees } = useTraineeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [working, setWorking] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchTraineeRequests();
    }, [fetchTraineeRequests])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTraineeRequests();
    setRefreshing(false);
  };

  const respond = async (item, status) => {
    setWorking(item.id);
    try {
      const res = await updateTraineeRequest(item.id, status);
      if (res?.success) {
        if (status === 1) {
          notify.success("Trainee accepted", `${item.trainee_name} is now your trainee.`);
          fetchTrainees();
        } else {
          notify.info("Request declined", `${item.trainee_name} was notified.`);
        }
        await fetchTraineeRequests();
      } else {
        notify.error("Couldn't update the request", res?.message || "Please try again.");
      }
    } catch (e) {
      notify.error("Couldn't update the request", errorMessage(e));
    } finally {
      setWorking(null);
    }
  };

  const decline = (item) => {
    Alert.alert("Decline this request?", `${item.trainee_name} will need to choose another supervisor.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Decline", style: "destructive", onPress: () => respond(item, 2) },
    ]);
  };

  const list = Array.isArray(traineeRequests) ? traineeRequests : [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={list}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E4FC2"]} />}
      ListHeaderComponent={
        list.length ? (
          <Text style={styles.header}>
            {list.length} {list.length === 1 ? "trainee wants" : "trainees want"} you as their supervisor
          </Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Avatar uri={item.avatar_url} name={item.trainee_name} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.trainee_name}</Text>
            {item.course || item.email ? (
              <Text style={styles.sub} numberOfLines={1}>{item.course || item.email}</Text>
            ) : null}
          </View>
          {working === item.id ? (
            <ActivityIndicator color="#1E4FC2" />
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={() => decline(item)} disabled={working !== null}>
                <Ionicons name="close" size={20} color="#B42318" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => respond(item, 1)} disabled={working !== null}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No requests right now</Text>
          <Text style={styles.emptyText}>When a trainee chooses you as their supervisor, they appear here.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  header: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  sub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10 },
  btn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  declineBtn: { borderWidth: 1.5, borderColor: "#fecaca" },
  acceptBtn: { backgroundColor: "#15803D" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#374151" },
  emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
});
