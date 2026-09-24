// Supervisor "Reports" tab: each trainee's latest reports.
import React, { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useReportStore } from '@/store/useReportStore';
import Avatar from '@/components/Avatar';
import { Card, Empty, Loading, T, colors, radius, space } from '@/ui';

const reportDate = (d) => (d ? new Date(String(d).slice(0, 10) + 'T00:00:00') : null);

export default function ReportScreen() {
  const navigation = useNavigation();
  const { getTraineeLatestReport } = useReportStore();
  const [list, setList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await getTraineeLatestReport();
    setList(Array.isArray(res?.data) ? res.data : []);
  }, [getTraineeLatestReport]);

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

  if (list === null) return <Loading />;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, flexGrow: 1 }}
      data={list}
      keyExtractor={(item) => String(item.trainee_id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      renderItem={({ item }) => {
        const reports = (item.reports || []).filter(Boolean);
        const latest = reports[0];
        const count = Number(item.report_count) || reports.length;
        const d = reportDate(latest?.date);
        const image = latest?.image_url || latest?.files?.[0];
        return (
          <Card
            padded={false}
            onPress={() => navigation.navigate('TraineeReportList', { traineeId: item.trainee_id, traineeName: item.trainee_name })}
          >
            <View style={styles.head}>
              <Avatar uri={item.avatar_url} name={item.trainee_name} size={36} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong" numberOfLines={1}>{item.trainee_name}</T>
                <T v="caption">
                  {count ? `${count} ${count === 1 ? 'report' : 'reports'}` : 'No reports yet'}
                </T>
              </View>
              {count ? <T v="label" style={{ color: colors.primary }}>View all</T> : null}
            </View>
            {latest ? (
              <View style={styles.latest}>
                <View style={{ flex: 1 }}>
                  <T v="caption">{d ? `Latest · ${format(d, 'EEE, MMM d')}` : 'Latest'}</T>
                  <T v="body" style={{ color: colors.ink, marginTop: 2 }} numberOfLines={1}>{latest.title}</T>
                  <T v="caption" numberOfLines={2} style={{ marginTop: 2 }}>{latest.description}</T>
                </View>
                {image ? <Image source={{ uri: image }} style={styles.thumb} /> : null}
              </View>
            ) : null}
          </Card>
        );
      }}
      ListEmptyComponent={
        <Empty icon="document-text-outline" title="No reports yet" text="When your trainees submit reports, they appear here." />
      }
    />
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  latest: {
    flexDirection: 'row',
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.divider },
});
