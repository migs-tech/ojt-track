import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import Swiper from "react-native-swiper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveFirstInstall } from '@/utils/checkFirstInstall';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

export default function InstructionScreen({ route, setFirstInstall }) {
  const { role } = route.params;
  const swiperRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (role === "trainee") {
      setSlides([
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Generate OTP",
          subtitle: "Generate a one-time PIN before generating QR for attendance.",
          icon: "🔐",
          gradient: ['#667eea', '#764ba2'],
        },
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Generate QR",
          subtitle: "After OTP verification, you can generate your own attendance QR code.",
          icon: "📱",
          gradient: ['#f093fb', '#f5576c'],
        },
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Daily Accomplishment Report",
          subtitle: "Submit your daily accomplishment reports inside the app.",
          icon: "📝",
          gradient: ['#4facfe', '#00f2fe'],
        },
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Monitor Work Hours",
          subtitle: "View your time-in/out logs and total work hours.",
          icon: "⏰",
          gradient: ['#43e97b', '#38f9d7'],
        },
      ]);
    } else {
      setSlides([
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Manage Trainees",
          subtitle: "Accept, monitor, evaluate or unenroll trainees.",
          icon: "👥",
          gradient: ['#667eea', '#764ba2'],
        },
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Scan Attendance QR",
          subtitle: "Scan trainee QR or manually input attendance.",
          icon: "📸",
          gradient: ['#f093fb', '#f5576c'],
        },
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Evaluate Trainees",
          subtitle: "Submit performance evaluations for each trainee.",
          icon: "⭐",
          gradient: ['#4facfe', '#00f2fe'],
        },
        {
          img: require("../../../assets/onboarding/slide1.png"),
          title: "Attendance Logs",
          subtitle: "View and monitor complete attendance records.",
          icon: "📊",
          gradient: ['#43e97b', '#38f9d7'],
        },
      ]);
    }
  }, []);

  const finish = async () => {
    await AsyncStorage.setItem("firstInstallDone", "true");
    await saveFirstInstall();
    setFirstInstall(false);
  };

  const handleSkip = () => {
    swiperRef.current?.scrollTo(slides.length - 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        showsButtons={false}
        autoplay={false}
        onIndexChanged={(index) => setCurrentIndex(index)}
        paginationStyle={styles.pagination}
      >
        {slides.map((slide, index) => (
          <LinearGradient
            key={index}
            colors={slide.gradient}
            style={styles.slide}
          >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {index + 1} / {slides.length}
              </Text>
            </View>

            {/* Icon Badge */}
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>{slide.icon}</Text>
            </View>

            {/* Image Container */}
            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={slide.img} 
                  style={styles.image} 
                  resizeMode="contain" 
                />
              </View>
            </View>

            {/* Content Card */}
            <View style={styles.contentCard}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>

              {index === slides.length - 1 ? (
                <TouchableOpacity style={styles.finishBtn} onPress={finish}>
                  <Text style={styles.finishText}>Get Started</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.nextBtn}
                  onPress={() => swiperRef.current?.scrollBy(1)}
                >
                  <Text style={styles.nextText}>Next</Text>
                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        ))}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: 40,
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  imageWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 30,
    padding: 20,
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 28,
    paddingBottom: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  pagination: {
    bottom: 220,
  },
  dot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 24,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    gap: 8,
  },
  nextText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  arrow: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
  finishBtn: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finishText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});