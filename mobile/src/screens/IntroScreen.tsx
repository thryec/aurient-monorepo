import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants";

const { width, height } = Dimensions.get("window");

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Aurient</Text>
        <Text style={styles.subtitle}>Monetize your health data</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Turn your health data into{" "}
            <Text style={styles.italic}>IP assets</Text>
          </Text>
          <Text style={styles.descriptionText}>
            AI-powered wellness insights for women to support where the{" "}
            <Text style={styles.bold}>medical system</Text> and{" "}
            <Text style={styles.bold}>wearable tech</Text> have fallen short.
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start Here</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: width * 0.9,
  },
  title: {
    fontSize: 48,
    fontWeight: "200",
    color: "#1f2937",
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "300",
    color: "#374151",
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  description: {
    fontSize: 28,
    fontWeight: "300",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  italic: {
    fontStyle: "italic",
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#374151",
    textAlign: "center",
    lineHeight: 24,
  },
  bold: {
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});
