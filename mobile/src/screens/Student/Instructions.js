import React, { useState, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { WebView } from "react-native-webview";
import { WEB_URL } from "@/lib/api";

export default function Instructions() {
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;

  const startLoading = () => {
    setLoading(true);
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 0.8,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const finishLoading = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => setLoading(false), 300);
    });
  };

  const widthAnimation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <Animated.View
          style={{
            height: 3,
            backgroundColor: "#111827",
            width: widthAnimation,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        />
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: `${WEB_URL}/trainee-instructions` }}
        style={{ flex: 1 }}
        onLoadStart={startLoading}
        onLoadEnd={finishLoading}
      />
    </View>
  );
}
