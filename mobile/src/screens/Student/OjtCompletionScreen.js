// src/screens/Student/OjtCompletionScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useSupervisorStore } from '@/store/useSupervisorStore';
import useTraineeStore  from '@/store/useTraineeStore';

const StarRating = ({ rating, setRating,  submitted  }) => {
  const handlePress = (index) => {
    if (submitted) return;
    if (rating === index + 0.5) {
      setRating(index + 1); // second tap -> full star
    } else {
      setRating(index + 0.5); // first tap -> half star
    }
  };

  return (
    <View style={styles.starWrapper}>
      {/* Stars row */}
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, index) => {
          let icon = "star-outline";
          if (rating >= index + 1) {
            icon = "star"; // full
          } else if (rating >= index + 0.5) {
            icon = "star-half"; // half
          }
          return (
            <TouchableOpacity key={index} onPress={() => handlePress(index)} disabled={submitted}>
              <Ionicons name={icon} size={32} color="#FFD700" />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rating label below */}
      <Text style={styles.ratingLabel}>{rating} out of 5</Text>
    </View>
  );
};

const OJTCompletionScreen = () => {
  const [supervisorRating, setSupervisorRating] = useState(0);
  const [workExpRating, setWorkExpRating] = useState(0);
  const [learningRating, setLearningRating] = useState(0);
  const [envRating, setEnvRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [confirm, setConfirm] = useState(false);
  const { mySupervisor } = useSupervisorStore();
  const { ojtCompletion, getOjtCompletion } = useTraineeStore();
  const [submitted, setSubmitted] = useState(false);


  const supervisor = {
    id: mySupervisor[0]?.supervisor_id || null,
    name: mySupervisor[0].supervisor_name || "N/A",
    company: mySupervisor[0].company_name || "N/A",
    image: mySupervisor[0].avatar_url || null,
  };

    const [message, setMessage] = useState(null);
    
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

  const handleSubmit = async() => {
    if (!confirm) {
      showMessage("Please confirm completion by checking the box.", "warning");
      return;
    }

    const data = {
      supervisor_id: supervisor.id,
      supervisor_rating: supervisorRating,
      work_experience_rating: workExpRating,
      learning_experience_rating: learningRating,
      work_environment_rating: envRating,
      feedback,
      suggestion,
    };

    try {
      const response = await ojtCompletion(data);
      if (response.success) {
        showMessage("OJT Completion submitted successfully!", "success");
        setSubmitted(true);
      } else {
        showMessage("Submission failed: " + response.message, "error");
      }
    } catch (error) {
      showMessage("An error occurred. Please try again.", "error");
    } 
  };

  const fetchOjtCompletion = async () => {
    try {
      const data = await getOjtCompletion();
      if (data.result) {
        setSupervisorRating(data.result.supervisor_rating || 0);
        setWorkExpRating(data.result.work_experience_rating || 0);
        setLearningRating(data.result.learning_experience_rating || 0);
        setEnvRating(data.result.environment_rating || 0);
        setFeedback(data.result.feedback || "");
        setSuggestion(data.result.suggestion || "");
        setConfirm(true); // assume already confirmed if data exists
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error fetching OJT completion data:", error);
    }
  };

  React.useEffect(() => {
    fetchOjtCompletion();
  }, []);

  return (
     <View style={{ flex: 1 }}>
    {message && (
      <View
        style={[
          styles.messageBanner,
          styles[message.type],
        ]}
      >
        <Ionicons
          name={
            message.type === "success"
              ? "checkmark-circle"
              : message.type === "error"
              ? "close-circle"
              : message.type === "info"
              ? "information-circle"
              : "warning"
          }
          size={22}
          color={
            message.type === "success"
              ? "#2E7D32"
              : message.type === "error"
              ? "#C62828"
              : message.type === "info"
              ? "#0288D1"
              : "#ED6C02"
          }
        />
        <Text style={styles.messageText}>
          {message.text}
        </Text>
      </View>
    )}
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OJT Completion</Text>
      <Text style={styles.message}>
        Congratulations for completing your On-the-Job Training!
      </Text>

      {/* Supervisor Info */}
      <View style={styles.supervisorCard}>
        <Text style={styles.supervisorTitle}>Supervisor</Text>
        <View style={styles.supervisorRow}>
          <Image
            source={{
              uri:
                supervisor.image && supervisor.image.trim() !== ""
                  ? supervisor.image
                  : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.supervisorName}>{supervisor.name}</Text>
            <Text style={styles.supervisorCompany}>{supervisor.company}</Text>
          </View>
        </View>
      </View>

      {/* Supervisor Evaluation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Supervisor Evaluation</Text>
        <Text style={styles.cardDesc}>
          Rate your supervisor’s guidance and support.
        </Text>
        <StarRating rating={supervisorRating} setRating={setSupervisorRating} submitted={submitted} />
      </View>

      {/* Work Experience */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Work Experience</Text>
        <Text style={styles.cardDesc}>
          Rate your overall work experience during OJT.
        </Text>
        <StarRating rating={workExpRating} setRating={setWorkExpRating} submitted={submitted}/>
      </View>

      {/* Learning Experience */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learning Experience</Text>
        <Text style={styles.cardDesc}>
          Rate the knowledge and skills you gained.
        </Text>
        <StarRating rating={learningRating} setRating={setLearningRating} submitted={submitted} />
      </View>

      {/* Work Environment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Work Environment</Text>
        <Text style={styles.cardDesc}>
          Rate the environment and culture of your workplace.
        </Text>
        <StarRating rating={envRating} setRating={setEnvRating} submitted={submitted} />
      </View>

      {/* Written Feedback */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Written Feedback</Text>
        <Text style={styles.cardDesc}>Please provide your feedback.</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your feedback here..."
          value={feedback}
          onChangeText={setFeedback}
          multiline
          editable={!submitted}
        />
      </View>

      {/* Suggestions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suggestions for Improvement</Text>
        <TextInput
          style={styles.input}
          placeholder="Any suggestions..."
          value={suggestion}
          onChangeText={setSuggestion}
          multiline
          editable={!submitted}
        />
      </View>

      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={confirm}
          onValueChange={setConfirm}
          color={confirm ? "#3a5bc0ff" : undefined}
          disabled={submitted} // 🔒 lock if already submitted
        />
        <Text style={styles.checkboxText}>
          I confirm that I have completed all requirements for my On-the-Job
          Training program.
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!confirm || submitted) && styles.submitButtonDisabled, // 🔒 greyed out
        ]}
        onPress={handleSubmit}
        disabled={!confirm || submitted} // 🔒 disable if not confirmed OR already submitted
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

export default OJTCompletionScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 16,
    paddingHorizontal: 16, 
    backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#222",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc", // greyed out when disabled
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
  },
  supervisorCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  supervisorTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  supervisorRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  supervisorName: { fontSize: 16, fontWeight: "600" },
  supervisorCompany: { fontSize: 14, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#666", marginBottom: 8 },
  starWrapper: {
    alignItems: "center",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
    gap: 9,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxText: { marginLeft: 8, flex: 1, fontSize: 14, color: "#333" },
  submitButton: {
    backgroundColor: "#3a5bc0ff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  success: { backgroundColor: "#DFF6E0" }, // light green
  error: { backgroundColor: "#FDE2E1" }, // light red
  info: { backgroundColor: "#E0F2FE" }, // light blue
  warning: { backgroundColor: "#FFF4E5" }, // light yellow
  messageText: { marginLeft: 8, fontSize: 15, fontWeight: "600" },
});