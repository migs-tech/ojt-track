// Notifications list shared by trainees and supervisors (the "Inbox" tab).
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatDistanceToNowStrict } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationStore } from '@/store/useNotificationStore';
import { notify } from '@/lib/notify';
import { Button, Empty, T, colors, radius, space } from '@/ui';

// "2026-09-24 08:01:00" (server time) -> Date
const parse = (v) => {
  const d = v ? new Date(String(v).replace(' ', 'T')) : null;
  return d && !isNaN(d) ? d : null;
};

const iconFor = (n) => {
  const text = `${n.type || ''} ${n.title || ''}`.toLowerCase();
  if (text.includes('otp') || text.includes('code')) return 'key-outline';
  if (text.includes('report')) return 'document-text-outline';
  if (text.includes('attendance') || text.includes('time')) return 'time-outline';
  if (text.includes('request') || text.includes('supervisor') || text.includes('trainee')) return 'people-outline';
  return 'notifications-outline';
};

export default function NotificationsScreen() {
  const { notifications, getNotification, markAsReadById, markAllAsRead, deleteNotificationById } = useNotificationStore();
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
    Alert.alert('Delete this notification?', n.title, [
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

  const renderItem = ({ item, index }) => {
    const isUnread = !Number(item.is_read);
    const when = parse(item.created_at);
    return (
      <Pressable
        onPress={() => open(item)}
        style={({ pressed }) => [styles.item, index === 0 && styles.first, index === list.length - 1 && styles.last, pressed && { backgroundColor: colors.background }]}
      >
        <Ionicons name={iconFor(item)} size={20} color={isUnread ? colors.primary : colors.subtle} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <View style={styles.itemTop}>
            <T v={isUnread ? 'bodyStrong' : 'body'} style={{ flex: 1, color: colors.ink }} numberOfLines={1}>{item.title}</T>
            {when ? <T v="caption">{formatDistanceToNowStrict(when)}</T> : null}
          </View>
          <T v="caption" numberOfLines={2} style={{ color: isUnread ? colors.text : colors.muted }}>{item.message}</T>
        </View>
        {isUnread ? <View style={styles.dot} /> : null}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.toolbar}>
        <View style={styles.tabs}>
          {['All', 'Unread'].map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <T v="label" style={{ color: tab === t ? colors.ink : colors.muted }}>
                {t}{t === 'Unread' && unread ? ` · ${unread}` : ''}
              </T>
            </Pressable>
          ))}
        </View>
        {unread > 0 ? (
          <Pressable onPress={markAllAsRead} hitSlop={8}>
            <T v="label" style={{ color: colors.primary }}>Mark all read</T>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={loaded ? list : []}
        keyExtractor={(n) => String(n.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          loaded ? (
            <Empty
              icon="notifications-off-outline"
              title={tab === 'Unread' ? "You're all caught up" : 'No notifications yet'}
              text="Updates about attendance, reports and requests appear here."
            />
          ) : null
        }
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          {selected ? (
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <T v="title">{selected.title}</T>
              {parse(selected.created_at) ? (
                <T v="caption" style={{ marginTop: 2 }}>{parse(selected.created_at).toLocaleString()}</T>
              ) : null}
              <T v="body" style={{ marginTop: space.lg }}>{selected.message}</T>
              {code ? (
                <Pressable
                  style={styles.codeBox}
                  onPress={async () => {
                    await Clipboard.setStringAsync(code);
                    notify.info('Copied', `Code ${code} copied.`);
                  }}
                >
                  <T v="display" style={{ letterSpacing: 6, fontVariant: ['tabular-nums'] }}>{code}</T>
                  <T v="caption">Tap to copy</T>
                </Pressable>
              ) : null}
              <View style={styles.actions}>
                <Button title="Delete" variant="dangerOutline" icon="trash-outline" onPress={() => remove(selected)} style={{ flex: 1 }} />
                <Button title="Done" onPress={() => setSelected(null)} style={{ flex: 1 }} />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md },
  tabs: { flexDirection: 'row', backgroundColor: '#ECEEF2', borderRadius: radius.md, padding: 3 },
  tab: { paddingVertical: 6, paddingHorizontal: space.lg, borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surface },
  item: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
  },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  last: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 8 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,24,39,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4, padding: space.xl, paddingBottom: space.xxxl },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.lg },
  codeBox: { marginTop: space.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: space.md, backgroundColor: colors.background },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
});
