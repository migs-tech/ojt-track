// src/navigation/StudentTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StudentHomeScreen from '../screens/Student/StudentHomeScreen';
import StudentProfileScreen from '../screens/Student/StudentProfileScreen';
import StudentMailScreen from '../screens/Student/StudentMailScreen';
import StudentReportScreen from '../screens/Student/StudentReportScreen';
import StudentQrScreen from '../screens/Student/StudentQrScreen';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useMemo} from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import {useNotificationStore} from "@/store/useNotificationStore";
import { useAuth } from "@/store/useAuthStore";
import EmailCheckModal from '@/components/EmailCheckModal';
import { useNavigation } from '@react-navigation/native';
import useTraineeStore  from '@/store/useTraineeStore';
import Avatar from '@/components/Avatar';

const Tab = createBottomTabNavigator();
function CustomHeader() {
  const { profile, getUserProfile, user } = useAuth();

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const displayData = profile && Object.keys(profile).length > 0 ? profile : user;


    return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Avatar
          uri={displayData?.avatar_url}
          name={displayData?.complete_name || displayData?.username}
          size={40}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{`${greeting}, ${displayData?.complete_name || "Unknown"}`}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      {/* Add bottom spacing below content */}
      <View style={{ height: 12 }} />
    </View>
  );
}

export default function StudentTabs() {
     const { unreadCount, getNotification } = useNotificationStore();
     const { user} = useAuth();
     const { checkOjtCompletionStatus } = useTraineeStore();
     const [showProfileModal, setShowProfileModal] = useState(false);
     const { navigate } = useNavigation();
     const [showCompleteOjtModal, setShowCompleteOjtModal] = useState(false);

      useEffect(() => {
        const fetch = async () => {
          await getNotification();
          const ojtStatus = await checkOjtCompletionStatus();
          if (ojtStatus && ojtStatus.completed && !ojtStatus.is_rated) {
            setShowCompleteOjtModal(true);
          } else {
            setShowCompleteOjtModal(false);
          }
        };
        fetch();
      }, [getNotification]);

      useEffect(() => {
      if (user) {
        if (!user.complete_name) {
          setShowProfileModal(true);
        }
      }
    }, [user]);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: '#3a5bc0ff', // blue background
            height: 120,
          },
          headerTintColor: '#fff', // white text in header
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitle: () => <CustomHeader />,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Mail') {
              iconName = focused ? 'mail' : 'mail-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Report') {
              iconName = focused ? 'file-chart' : 'file-chart-outline';
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            } else if (route.name === 'QR Code') {
              iconName = focused ? 'qrcode' : 'qrcode';
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#3a5bc0ff',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
          name="Home"
          component={StudentHomeScreen}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="Report"
          component={StudentReportScreen}
          options={{ title: 'Report' }}
        />
        <Tab.Screen
          name="QR Code"
          component={StudentQrScreen}
          options={{ title: 'QR Code' }}
        />
        <Tab.Screen
          name="Mail"
          component={StudentMailScreen}
          options={{
            title: 'Mail',
            tabBarBadge: unreadCount > 0 ? unreadCount : null,
            tabBarBadgeStyle: {
              backgroundColor: 'red',
              color: 'white',
              fontSize: 12,
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={StudentProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
       {!showProfileModal && !showCompleteOjtModal && <EmailCheckModal />}
      <Modal visible={showProfileModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Profile Incomplete</Text>
            <Text style={styles.modalMessage}>
              Please update your information to continue using the app.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.laterButton]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={() => {
                  setShowProfileModal(false);
                  navigate("EditProfile"); // ✅ Global navigation
                }}
              >
                <Text style={styles.buttonText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showCompleteOjtModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
            }}
          >
            {/* 🎉 Icon for greeting */}
            <Ionicons name="sparkles-outline" size={48} color="#f39c12" style={{ marginBottom: 12 }} />

            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              OJT Completion
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#555",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Congratulations on completing your OJT!{"\n"}Please rate your supervisor as part of requirements.
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                marginTop: 10,
              }}
            >
              {/* Later Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  marginRight: 8,
                  paddingVertical: 12,
                  backgroundColor: "#ccc",
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => setShowCompleteOjtModal(false)}
              >
                <Text style={{ color: "#333", fontSize: 16, fontWeight: "600" }}>
                  Later
                </Text>
              </TouchableOpacity>

              {/* Rate Now Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  marginLeft: 8,
                  paddingVertical: 12,
                  backgroundColor: "#4CAF50",
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => {
                  setShowCompleteOjtModal(false);
                  navigate("OjtCompletion");
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  Rate Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> 
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
    paddingBottom: 12, // Optional extra space inside header
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  textContainer: {
    flexDirection: 'column',
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: '#fff',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  laterButton: {
    backgroundColor: "#ccc",
  },
  updateButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});