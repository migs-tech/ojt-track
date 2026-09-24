// Profile tab for trainees and supervisors: who is signed in, settings, help and sign out.
import React, { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/store/useAuthStore';
import { checkOjtCompletionStatus } from '@/api/studentApi';
import Avatar from '@/components/Avatar';
import { Badge, Card, Row, Screen, Section, T, colors, space } from '@/ui';

export default function ProfileScreen({ trainee }) {
  const navigation = useNavigation();
  const { profile, user, getUserProfile, logout } = useAuth();
  const [completion, setCompletion] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getUserProfile();
      if (trainee) checkOjtCompletionStatus().then(setCompletion).catch(() => null);
    }, [trainee, getUserProfile])
  );

  const name = profile?.full_name || profile?.complete_name || user?.username || '';
  const verified = Number(profile?.email_flg) === 1;
  const details = [profile?.course, profile?.company].filter(Boolean).join(' · ');

  const signOut = () => {
    Alert.alert('Sign out?', 'You will need your password to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.xl }}>
        <Avatar uri={profile?.avatar_url} name={name} size={56} />
        <View style={{ flex: 1 }}>
          <T v="heading" numberOfLines={1}>{name || (trainee ? 'Trainee' : 'Supervisor')}</T>
          {profile?.email ? <T v="caption" numberOfLines={1}>{profile.email}</T> : null}
          {details ? <T v="caption" numberOfLines={1}>{details}</T> : null}
        </View>
      </Card>

      <Section title="Account">
        <Card padded={false}>
          <Row icon="person-outline" title="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <Row icon="lock-closed-outline" title="Change password" onPress={() => navigation.navigate('ChangePassword')} />
          {trainee ? (
            <Row
              icon="mail-outline"
              title="Email verification"
              right={<Badge tone={verified ? 'success' : 'warning'}>{verified ? 'Verified' : 'Not verified'}</Badge>}
              onPress={() => navigation.navigate('EmailVerification')}
            />
          ) : null}
          <Row icon="notifications-outline" title="Notification settings" onPress={() => navigation.navigate('ManageNotifications')} last />
        </Card>
      </Section>

      {trainee ? (
        <Section title="OJT">
          <Card padded={false}>
            <Row icon="document-attach-outline" title="Document requests" subtitle="Ask for a report of your hours or activity" onPress={() => navigation.navigate('Requests')} />
            <Row icon="chatbubble-ellipses-outline" title="AI assistant" subtitle="Help with writing your reports" onPress={() => navigation.navigate('AIAssistant')} />
            {completion?.completed ? (
              <Row
                icon="ribbon-outline"
                title="OJT completion"
                right={<Badge tone={completion.is_rated ? 'success' : 'primary'}>{completion.is_rated ? 'Submitted' : 'Ready'}</Badge>}
                onPress={() => navigation.navigate('OjtCompletion')}
                last
              />
            ) : (
              <Row
                icon="ribbon-outline"
                title="OJT completion"
                subtitle={completion ? `Available after ${completion.required_hours ?? 'your required'} hours` : undefined}
                last
              />
            )}
          </Card>
        </Section>
      ) : null}

      <Section title="Help">
        <Card padded={false}>
          <Row icon="help-circle-outline" title="How it works" onPress={() => navigation.navigate('Instructions')} last />
        </Card>
      </Section>

      <Card padded={false}>
        <Row icon="log-out-outline" title="Sign out" danger onPress={signOut} right={null} last />
      </Card>

      <T v="caption" style={{ textAlign: 'center', marginTop: space.xxl, color: colors.subtle }}>
        OJT Track {Constants.expoConfig?.version ? `v${Constants.expoConfig.version}` : ''}
      </T>
    </Screen>
  );
}
