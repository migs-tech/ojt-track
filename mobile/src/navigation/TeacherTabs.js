// src/navigation/TeacherTabs.js
import React from 'react';
import Avatar from '@/components/Avatar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TeacherHomeScreen from '@/screens/Teacher/TeacherHomeScreen';
import TeacherReportScreen from '@/screens/Teacher/TeacherReportScreen';
import TeacherMailScreen from '@/screens/Teacher/TeacherMailScreen';
import TeacherProfileScreen from '@/screens/Teacher/TeacherProfileScreen';
import TeacherTrainee from '@/screens/Teacher/TeacherTrainee';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import { useAuth } from "@/store/useAuthStore";
import {useNotificationStore} from "@/store/useNotificationStore";
import { useNavigation } from '@react-navigation/native'; 

const Tab = createBottomTabNavigator();
function CustomHeader() {
  const { profile, getUserProfile } = useAuth();

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

    return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Avatar
          uri={profile?.avatar_url}
          name={profile?.complete_name || profile?.username}
          size={40}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{`${greeting}, ${profile?.complete_name || "Unknown"}`}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      {/* Add bottom spacing below content */}
      <View style={{ height: 12 }} />
    </View>
  );
}

export default function TeacherTabs() {
     const { unreadCount, getNotification } = useNotificationStore();
     const { user} = useAuth();
     const [showProfileModal, setShowProfileModal] = useState(false);
     const { navigate } = useNavigation();

      useEffect(() => {
        getNotification();
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
          height: 100,
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
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
          else if (route.name === 'Trainee') {
            iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#3a5bc0ff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={TeacherHomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Report" 
        component={TeacherReportScreen} 
        options={{ title: 'Report' }}
      />
       <Tab.Screen 
        name="Trainee" 
        component={TeacherTrainee} 
        options={{ title: 'Trainee' }}
      />
       <Tab.Screen 
        name="Mail" 
        component={TeacherMailScreen} 
        options={{ title: 'Mail',
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
        component={TeacherProfileScreen} 
        options={{
           title: 'Profile', 
           headerShown: false, // Hide header for Profile screen
        }}
      />
    </Tab.Navigator>
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