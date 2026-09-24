import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { saveFirstInstall } from '@/utils/checkFirstInstall';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome!',
    description: 'A modern app to simplify your life.',
    image: require('../../../assets/onboarding/slide1.png'),
  },
  {
    id: '2',
    title: 'Track Everything',
    description: 'Stay updated with real-time insights.',
    image: require('../../../assets/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: 'Get Started Now',
    description: 'Create an account and dive in!',
    image: require('../../../assets/onboarding/slide3.png'),
  },
];



export default function GetStartedScreen({ setFirstInstall }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = () => {
    completeIntro();
  };

  const completeIntro = async () => {
     await saveFirstInstall();
     setFirstInstall(false);
  };

  useEffect(() => {
    scrollX.addListener(({ value }) => {
      setCurrentIndex(Math.round(value / width));
    });
    return () => scrollX.removeAllListeners();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth }]}
              />
            );
          })}
        </View>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity style={styles.button} onPress={completeIntro}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '90%',
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  skipBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 14,
    color: '#aaa',
  },
});

