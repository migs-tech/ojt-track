// Trainee reports: write today's report, and see past ones.
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { format, isToday } from 'date-fns';
import { useReportStore } from '@/store/useReportStore';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import { Button, Card, Empty, Field, Loading, Notice, Screen, T, colors, radius, space } from '@/ui';

const Tab = createMaterialTopTabNavigator();

// Report dates come as "YYYY-MM-DD" (or with a time); show them in the phone's local calendar
const reportDate = (d) => (d ? new Date(String(d).slice(0, 10) + 'T00:00:00') : null);

function SubmitReport({ navigation }) {
  const { saveReport, loading, getReports } = useReportStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const pickPhoto = async (camera) => {
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      setFormError(camera ? 'Allow camera access to take a photo.' : 'Allow photo access to choose a picture.');
      return;
    }
    // Compressed so it stays under the server's 5 MB limit
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 };
    const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets?.length) {
      setPhoto(result.assets[0]);
      setErrors((e) => ({ ...e, photo: '' }));
    }
  };

  const submit = async () => {
    const e = {};
    if (!title.trim()) e.title = 'Add a short title.';
    if (!description.trim()) e.description = 'Describe what you worked on.';
    if (!photo) e.photo = 'Add a photo of your work.';
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;

    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    // The calendar day on the phone (toISOString() is UTC and can shift the day)
    form.append('date', format(date, 'yyyy-MM-dd'));
    form.append('files[]', { uri: photo.uri, name: photo.fileName || 'photo.jpg', type: photo.mimeType || 'image/jpeg' });

    try {
      const res = await saveReport(form);
      if (res.success) {
        notify.success('Report submitted', 'Your supervisor can see it now.');
        setTitle('');
        setDescription('');
        setDate(new Date());
        setPhoto(null);
        await getReports();
        navigation.navigate('History');
      } else {
        setFormError(res.message || "Couldn't submit the report.");
      }
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't submit the report."));
    }
  };

  return (
    <Screen keyboard>
      {formError ? <Notice tone="danger" style={{ marginBottom: space.lg }}>{formError}</Notice> : null}

      <T v="label" style={{ marginBottom: 6 }}>Date</T>
      <Pressable onPress={() => setShowDate(true)} style={styles.dateField} accessibilityRole="button">
        <T v="body" style={{ flex: 1, color: colors.ink }}>
          {isToday(date) ? `Today, ${format(date, 'MMMM d')}` : format(date, 'EEEE, MMMM d')}
        </T>
        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
      </Pressable>
      {showDate ? (
        <DateTimePicker
          value={date}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selected) => {
            setShowDate(Platform.OS === 'ios');
            if (selected) setDate(selected);
          }}
        />
      ) : null}

      <Field
        label="Title"
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          setErrors((e) => ({ ...e, title: '' }));
        }}
        placeholder="e.g. Set up the office network"
        error={errors.title}
        maxLength={120}
      />
      <Field
        label="What did you do?"
        value={description}
        onChangeText={(t) => {
          setDescription(t);
          setErrors((e) => ({ ...e, description: '' }));
        }}
        placeholder="Tasks you worked on, what you learned, any problems."
        multiline
        error={errors.description}
      />

      <T v="label" style={{ marginBottom: 6 }}>Photo</T>
      {photo ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
          <View style={styles.photoActions}>
            <Button title="Change" variant="secondary" small onPress={() => pickPhoto(false)} style={{ flex: 1 }} />
            <Button title="Remove" variant="ghost" small onPress={() => setPhoto(null)} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={[styles.photoEmpty, errors.photo && { borderColor: colors.danger }]}>
          <T v="caption" style={{ textAlign: 'center', marginBottom: space.md }}>A photo of your work is required.</T>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Button title="Take photo" icon="camera-outline" variant="secondary" small onPress={() => pickPhoto(true)} style={{ flex: 1 }} />
            <Button title="Choose" icon="image-outline" variant="secondary" small onPress={() => pickPhoto(false)} style={{ flex: 1 }} />
          </View>
        </View>
      )}
      {errors.photo ? <T v="caption" style={{ color: colors.danger, marginTop: 6 }}>{errors.photo}</T> : null}

      <Button title="Submit report" onPress={submit} loading={loading} style={{ marginTop: space.xxl }} />
    </Screen>
  );
}

function History({ navigation }) {
  const { reports, getReports } = useReportStore();
  const [loaded, setLoaded] = useState(reports.length > 0);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getReports().finally(() => setLoaded(true));
    }, [getReports])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getReports();
    setRefreshing(false);
  };

  if (!loaded) return <Loading />;
  const list = reports.filter(Boolean);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.lg, flexGrow: 1 }}
      data={list}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
      renderItem={({ item }) => {
        const d = reportDate(item.date);
        return (
          <Card onPress={() => navigation.navigate('ReportDetails', { reportId: item.id })}>
            <T v="caption">{d ? format(d, 'EEEE, MMMM d, yyyy') : ''}</T>
            <T v="heading" style={{ marginTop: 2 }} numberOfLines={1}>{item.title}</T>
            <T v="caption" numberOfLines={2} style={{ marginTop: 2, color: colors.text }}>{item.description}</T>
          </Card>
        );
      }}
      ListEmptyComponent={
        <Empty
          icon="document-text-outline"
          title="No reports yet"
          text="Reports you submit appear here."
          action="Write a report"
          onAction={() => navigation.navigate('Submit Report')}
        />
      }
    />
  );
}

export default function StudentReportScreen({ route }) {
  const initialTab = route?.params?.screen === 'History' ? 'History' : 'Submit Report';
  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600', textTransform: 'none' },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 2 },
        tabBarStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
        swipeEnabled: false,
      }}
    >
      <Tab.Screen name="Submit Report" component={SubmitReport} options={{ title: 'Write' }} />
      <Tab.Screen name="History" component={History} options={{ title: 'History' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    marginBottom: space.lg,
  },
  photoEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: colors.surface,
  },
  photoWrap: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  photo: { width: '100%', height: 200, backgroundColor: colors.divider },
  photoActions: { flexDirection: 'row', gap: space.sm, padding: space.sm },
});
