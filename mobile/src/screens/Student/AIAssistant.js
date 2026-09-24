// App.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  Animated,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "@/store/useAuthStore";

const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animateDot = (dot, delay) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -6,
          duration: 250,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ])
    );
  };

  useEffect(() => {
    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.typingBubble}>
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
      />
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
      />
      <Animated.View
        style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
      />
    </View>
  );
};


export default function App() {
  const { user, token} = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: "1", 
      text: "Hello! I’m your AI assistant 🤖. Each reply is a single conversation and I won’t remember previous messages.", 
      sender: "ai" ,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // ✅ default true to check typing
  const [keyboardHeight] = useState(new Animated.Value(0));
  const flatListRef = useRef();

  useEffect(() => {
    // Keyboard listeners
    const showSub = Keyboard.addListener("keyboardWillShow", (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const showSubAndroid = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSubAndroid = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      showSubAndroid.remove();
      hideSubAndroid.remove();
    };
  }, []);

useEffect(() => {
  flatListRef.current?.scrollToEnd({ animated: true });
}, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    Keyboard.dismiss();
    setInput("");

    setTyping(true);
    //token
    console.log("Token:", token);

    try {
      const response = await fetch("https://ojt.kamsite.com/api/ai/AIConversation", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const aiResponse = {
        id: Date.now().toString(),
        text: data.reply || "Sorry, I couldn’t respond.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "⚠️ Oops, something went wrong.", sender: "ai" },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleCopy = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "AI response copied to clipboard ✅");
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" }}
            style={styles.avatar}
          />
        )}
        <TouchableWithoutFeedback
          onLongPress={() => !isUser && handleCopy(item.text)}
        >
          <View
            style={[
              styles.messageContainer,
              isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[styles.message, isUser ? styles.userMessage : styles.aiMessage]}
            >
              {item.text}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        {isUser && (
          <Image
            source={{ uri: user?.avatar_url ?? "https://cdn-icons-png.flaticon.com/512/1946/1946429.png" }}
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
    <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        ListFooterComponent={
          typing ? (
            <View style={styles.row}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" }} style={styles.avatar} />
              <TypingDots />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator
        bounces
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <Animated.View style={[styles.inputContainer, { marginBottom: keyboardHeight }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  chatContainer: { padding: 10, paddingBottom: 80 },

  messageRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 4 },
  userRow: { justifyContent: "flex-end" },
  aiRow: { justifyContent: "flex-start" },

  avatar: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 6 },

  messageContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    maxWidth: "75%",
  },
  userBubble: { backgroundColor: "#0078FF", borderTopRightRadius: 4 },
  aiBubble: { backgroundColor: "#E5E5EA", borderTopLeftRadius: 4 },

  message: { fontSize: 14, lineHeight: 18 },
  aiMessage: { color: "#000" },
  userMessage: { color: "#fff" },

  typingDot: { fontSize: 18, color: "#555", marginHorizontal: 2 },

  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#0078FF",
    borderRadius: 25,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  typingBubble: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#E5E5EA",
  borderRadius: 16,
  paddingHorizontal: 10,
  paddingVertical: 6,
  marginVertical: 4,
  maxWidth: "30%",
},
dot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: "#555",
  marginHorizontal: 2,
},

row: {
  flexDirection: "row",
  alignItems: "flex-end",
  marginVertical: 4,
},
noteText: {
  fontSize: 11,
  color: "#888",
  marginTop: 2,
  marginLeft: 10,
  maxWidth: "75%",
},

});