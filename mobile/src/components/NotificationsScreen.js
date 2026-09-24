// Notifications list shared by trainees and supervisors (the "Mail" tab).
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationStore } from '@/store/useNotificationStore';
import { notify } from '@/lib/notify';

const BLUE = '#2076cc';

// "2026-09-24 08:01:00" (server time) -> Date
const parse = (v) => (v ? new Date(String(v).replace(' ', 'T')) : null);

const iconFor = (n) => {
  const text = `${n.type || ''} ${n.title || ''}`.toLowerCase();
  if (text.includes('otp') || text.includes('code')) return ['key-outline', '#7c3aed'];
  if (text.includes('report')) return ['document-text-outline', '#0891b2'];
  if (text.includes('attendance') || text.includes('time')) return ['time-outline', '#d97706'];
  if (text.includes('request') || text.includes('supervisor') || text.includes('trainee')) return ['people-outline', '#059669'];
  if (text.includes('quote')) return ['sunny-outline', '#f59e0b'];
  return ['notifications-outline', BLUE];
};

export default function NotificationsScreen() {
  const { notifications, getNotification, markAsReadById, markAllAsRead, deleteNotificationById } =
    useNotificationStore();
  const [tab, setTab] = useState('All');
  const [loaded, setLoaded] = useState(notifications !== null);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getNotification().finally(() => setLoaded(true));
    }, [getNotification])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getNotification();
    setRefreshing(false);
  };

  const list = useMemo(() => {
    const all = [...(notifications || [])].sort((a, b) => (parse(b.created_at) || 0) - (parse(a.created_at) || 0));
    return tab === 'Unread' ? all.filter((n) => !Number(n.is_read)) : all;
  }, [notifications, tab]);

  const unread = (notifications || []).filter((n) => !Number(n.is_read)).length;

  const open = (n) => {
    setSelected(n);
    if (!Number(n.is_read)) markAsReadById(n.id);
  };

  const remove = (n) => {
    Alert.alert('Delete notification?', n.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSelected(null);
          await deleteNotificationById(n.id);
        },
      },
    ]);
  };

  const code = selected ? (String(selected.message || '').match(/\b(\d{6})\b/) || [])[1] : null;

  const renderItem = ({ item }) => {
    const [icon, color] = iconFor(item);
    const isUnread = !Number(item.is_read);
    const when = parse(item.created_at);
    return (
      <TouchableOpacity style={[styles.item, isUnread && styles.itemUnread]} onPress={() => open(item)}>
        <View style={[styles.itemIcon, { backgroundColor: color + '1a' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.itemTop}>
            <Text style={[styles.itemTitle, isUnread && { fontWeight: '700' }]} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread ? <View style={styles.dot} /> : null}
          </View>
          <Text style={styles.itemBody} numberOfLines={2}>{item.message}</Text>
          {when && !isNaN(when) ? (
            <Text style={styles.itemTime}>{formatDistanceToNow(when, { addSuffix: true })}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.tabs}>
          {['All', 'Unread'].map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t}
                {t === 'Unread' && unread ? ` (${unread})` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} hitSlop={8}>
            <Text style={styles.link}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={loaded ? list : []}
        keyExtractor={(n) => String(n.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE]} />}
        ListEmptyComponent={
          !loaded ? (
            <View>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.item, { opacity: 0.5 }]}>
                  <View style={[styles.itemIcon, { backgroundColor: '#e2e8f0' }]} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <View style={styles.skel} />
                    <View style={[styles.skel, { width: '80%' }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>{tab === 'Unread' ? "You're all caught up" : 'No notifications yet'}</Text>
              <Text style={styles.emptyText}>Updates about attendance, reports and requests show up here.</Text>
            </View>
          )
        }
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          {selected ? (
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>{selected.title}</Text>
              {parse(selected.created_at) ? (
                <Text style={styles.itemTime}>{parse(selected.created_at).toLocaleString()}</Text>
              ) : null}
              <Text style={styles.sheetBody}>{selected.message}</Text>
              {code ? (
                <TouchableOpacity
                  style={styles.codeBox}
                  onPress={async () => {
                    await Clipboard.setStringAsync(code);
                    notify.info('Copied', `Code ${code} copied.`);
                  }}
                >
                  <Text style={styles.codeText}>{code}</Text>
                  <Text style={styles.itemTime}>Tap to copy</Text>
                </TouchableOpacity>
              ) : null}
              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(selected)}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  <Text style={{ color: '#dc2626', fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  tabs: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 3 },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#0f172a' },
  link: { color: BLUE, fontWeight: '600' },
  item: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  itemUnread: { backgroundColor: '#f0f7ff' },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0f172a' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BLUE },
  itemBody: { fontSize: 13, color: '#475569', marginTop: 2, lineHeight: 18 },
  itemTime: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  skel: { height: 12, borderRadius: 6, backgroundColor: '#e2e8f0' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#334155' },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginBottom: 14 },
  sheetTitle: { fontSize: 19, fontWeight: '700', color: '#0f172a' },
  sheetBody: { fontSize: 15, color: '#334155', marginTop: 12, lineHeight: 22 },
  codeBox: {
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
  },
  codeText: { fontSize: 28, fontWeight: '800', letterSpacing: 6, color: '#4338ca' },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
  deleteBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  closeBtn: { flex: 1, backgroundColor: BLUE, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
