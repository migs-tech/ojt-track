// Supervisor "Trainees" tab: your trainees, and attendance by day.
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useTraineeStore from '@/store/useTraineeStore';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import Avatar from '@/components/Avatar';
import { Card, Empty, Field, Loading, Row, T, colors, radius, space } from '@/ui';

export default function TeacherTraineeScreen() {
  const navigation = useNavigation();
  const {
    trainees,
    fetchTrainees,
    fetchAllAttendanceRecords,
    attendanceRecords,
    fetchTraineeRequests,
    traineeRequests,
    unEnrollTrainee,
  } = useTraineeStore();
  const [tab, setTab] = useState('trainees');
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await Promise.all([fetchTrainees(), fetchAllAttendanceRecords(), fetchTraineeRequests()]);
    setLoaded(true);
  }, [fetchTrainees, fetchAllAttendanceRecords, fetchTraineeRequests]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const list = useMemo(
    () =>
      (Array.isArray(trainees) ? trainees : []).filter((t) =>
        String(t.trainee_name || '').toLowerCase().includes(search.trim().toLowerCase())
      ),
    [trainees, search]
  );

  const days = useMemo(
    () =>
      Object.entries(attendanceRecords?.attendance ?? {})
        .map(([date, d]) => ({ date, present: d.present_count, absent: d.absent_count, trainees: d.trainees }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [attendanceRecords]
  );

  const requests = Array.isArray(traineeRequests) ? traineeRequests : [];

  const unenroll = (t) => {
    Alert.alert(
      `Remove ${t.trainee_name}?`,
      "They'll no longer be your trainee and will need to choose a supervisor again. Their past attendance and reports are kept.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await unEnrollTrainee(t.trainee_id);
              if (res?.success) {
                notify.success('Trainee removed', `${t.trainee_name} is no longer your trainee.`);
                fetchTrainees();
              } else {
                notify.error("Couldn't remove", res?.error || res?.message || 'Please try again.');
              }
            } catch (e) {
              notify.error("Couldn't remove", errorMessage(e));
            }
          },
        },
      ]
    );
  };

  if (!loaded) return <Loading />;

  const header = (
    <View>
      <View style={styles.segment}>
        {[
          ['trainees', `Trainees${Array.isArray(trainees) && trainees.length ? ` · ${trainees.length}` : ''}`],
          ['attendance', 'Attendance'],
        ].map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.segmentItem, tab === key && styles.segmentActive]}>
            <T v="bodyStrong" style={{ color: tab === key ? colors.ink : colors.muted }}>{label}</T>
          </Pressable>
        ))}
      </View>

      {requests.length > 0 ? (
        <Card onPress={() => navigation.navigate('RequestTrainee')} style={styles.requests}>
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          <T v="bodyStrong" style={{ flex: 1 }}>
            {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
          </T>
          <T v="label" style={{ color: colors.primary }}>Review</T>
        </Card>
      ) : null}

      {tab === 'trainees' && Array.isArray(trainees) && trainees.length > 5 ? (
        <Field
          value={search}
          onChangeText={setSearch}
          placeholder="Search trainees"
          autoCorrect={false}
          right={search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.subtle} />
            </Pressable>
          ) : <Ionicons name="search" size={18} color={colors.subtle} />}
          style={{ marginBottom: space.md }}
        />
      ) : null}
    </View>
  );

  const refresh = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />;

  if (tab === 'attendance') {
    return (
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={days}
        keyExtractor={(d) => d.date}
        refreshControl={refresh}
        ListHeaderComponent={header}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => navigation.navigate('AttendanceDetails', { date: item.date, trainees: item.trainees })}
            style={({ pressed }) => [styles.item, index === 0 && styles.first, index === days.length - 1 && styles.last, pressed && { backgroundColor: colors.background }]}
          >
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">{format(new Date(item.date + 'T00:00:00'), 'EEEE, MMM d')}</T>
              <T v="caption">
                {item.present} present{item.absent ? ` · ${item.absent} absent` : ''}
              </T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
          </Pressable>
        )}
        ListEmptyComponent={<Empty icon="calendar-outline" title="No attendance yet" text="Days appear here after you scan your trainees' QR codes." />}
      />
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={list}
      keyExtractor={(t) => String(t.trainee_id)}
      refreshControl={refresh}
      ListHeaderComponent={header}
      renderItem={({ item, index }) => (
        <View style={[styles.itemWrap, index === 0 && styles.first, index === list.length - 1 && styles.last]}>
          <Row
            left={<Avatar uri={item.avatar_url} name={item.trainee_name} size={40} />}
            title={item.trainee_name}
            subtitle={item.course || item.trainee_email}
            onPress={() => navigation.navigate('TraineeDetails', { item })}
            right={
              <Pressable onPress={() => unenroll(item)} hitSlop={10} accessibilityLabel={`Remove ${item.trainee_name}`} style={{ padding: 4 }}>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.subtle} />
              </Pressable>
            }
            last
          />
        </View>
      )}
      ListEmptyComponent={
        <Empty
          icon="people-outline"
          title={search ? 'No matches' : 'No trainees yet'}
          text={search ? 'Try a different name.' : 'When trainees choose you in their app, their requests appear above.'}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.lg, paddingBottom: space.xxxl, flexGrow: 1 },
  segment: { flexDirection: 'row', backgroundColor: '#ECEEF2', borderRadius: radius.md, padding: 3, marginBottom: space.lg },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.surface },
  requests: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg, paddingVertical: space.md },
  itemWrap: { backgroundColor: colors.surface, borderWidth: 1, borderTopWidth: 0, borderColor: colors.border },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
  },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden' },
  last: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, overflow: 'hidden' },
});
