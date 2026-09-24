// Trainee attendance history with total hours.
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useAuth } from '@/store/useAuthStore';
import { Badge, Card, Empty, Loading, ProgressBar, T, colors, radius, space } from '@/ui';

// "12h 30m 5s" -> "12h 30m"
const short = (d) => (d ? String(d).replace(/\s*\d+s$/, '') : null);
const toHours = (text) => {
  const m = String(text || '').match(/(\d+)h\s*(\d+)m/);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};

export default function AttendanceScreen() {
  const { myAttendance, fetchMyAttendance } = useAttendanceStore();
  const { profile } = useAuth();
  const [loaded, setLoaded] = useState(!!myAttendance);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMyAttendance().finally(() => setLoaded(true));
    }, [fetchMyAttendance])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAttendance();
    setRefreshing(false);
  };

  if (!loaded) return <Loading />;

  const records = myAttendance?.records || [];
  const present = records.filter((r) => r.is_present && r.time_in).length;
  const absent = records.filter((r) => Number(r.status) === 2).length;
  const done = toHours(myAttendance?.total_hours);
  const required = Number(profile?.ojt_required_hours) || 0;

  const renderItem = ({ item, index }) => {
    const isAbsent = Number(item.status) === 2 || !item.time_in;
    const inProgress = !isAbsent && !item.time_out;
    return (
      <View style={[styles.row, index === 0 && styles.first, index === records.length - 1 && styles.last]}>
        <View style={{ flex: 1 }}>
          <T v="bodyStrong">{item.date}</T>
          <T v="caption">
            {isAbsent ? 'No time-in recorded' : inProgress ? `In ${item.time_in}` : `${item.time_in} – ${item.time_out}`}
          </T>
        </View>
        {isAbsent ? (
          <Badge tone="danger">Absent</Badge>
        ) : inProgress ? (
          <Badge tone="primary">In progress</Badge>
        ) : (
          <T v="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{short(item.duration)}</T>
        )}
      </View>
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, flexGrow: 1 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListHeaderComponent={
        <>
          <Card style={{ marginBottom: space.xl }}>
            <T v="overline">TOTAL HOURS</T>
            <T v="display" style={{ marginTop: 2, fontVariant: ['tabular-nums'] }}>
              {short(myAttendance?.total_hours) || '0h 0m'}
            </T>
            {required ? (
              <>
                <ProgressBar value={(done / required) * 100} tone={colors.success} style={{ marginTop: space.md }} />
                <T v="caption" style={{ marginTop: space.sm }}>
                  {Math.floor(done)} of {required} required hours
                </T>
              </>
            ) : null}
            <View style={styles.stats}>
              <Stat value={present} label="Present" />
              <Stat value={absent} label="Absent" />
              <Stat value={records.length} label="Days" />
            </View>
          </Card>
          {records.length ? <T v="overline" style={{ marginBottom: space.sm }}>HISTORY</T> : null}
        </>
      }
      ListEmptyComponent={
        <Empty icon="calendar-outline" title="No attendance yet" text="Days appear here after your supervisor scans your QR code." />
      }
    />
  );
}

function Stat({ value, label }) {
  return (
    <View style={{ flex: 1 }}>
      <T v="title" style={{ fontVariant: ['tabular-nums'] }}>{value}</T>
      <T v="caption">{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.divider },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
  },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  last: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
});
