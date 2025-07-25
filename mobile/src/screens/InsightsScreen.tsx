import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants";

const { width } = Dimensions.get("window");

interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

const insights: Insight[] = [
  {
    id: "sleep",
    title: "Sleep Optimization",
    description:
      "Your sleep quality has improved 15% this week. Consider maintaining your current bedtime routine.",
    category: "Recovery",
    icon: "😴",
    color: "#8b5cf6",
  },
  {
    id: "stress",
    title: "Stress Management",
    description:
      "Your HRV indicates elevated stress levels. Try 10 minutes of meditation before bed.",
    category: "Wellness",
    icon: "🧘",
    color: "#10b981",
  },
  {
    id: "nutrition",
    title: "Nutrition Insights",
    description:
      "Your energy levels peak after protein-rich meals. Consider increasing protein intake.",
    category: "Nutrition",
    icon: "🥗",
    color: "#f59e0b",
  },
  {
    id: "fitness",
    title: "Fitness Progress",
    description:
      "Your recovery time has decreased by 20%. You're ready to increase workout intensity.",
    category: "Fitness",
    icon: "💪",
    color: "#ef4444",
  },
];

interface InsightsScreenProps {
  onGenerateInsights: () => void;
  onContinue: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  onGenerateInsights,
  onContinue,
}) => {
  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your AI Insights</Text>
          <Text style={styles.subtitle}>
            Personalized recommendations based on your data
          </Text>
        </View>

        <View style={styles.insightsContainer}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightCategory}>{insight.category}</Text>
                </View>
              </View>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={onGenerateInsights}
          >
            <Text style={styles.generateButtonText}>Generate New Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>
              Continue to Daily Plans
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "300",
    color: "#374151",
    textAlign: "center",
    lineHeight: 24,
  },
  insightsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  insightCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  insightCategory: {
    fontSize: 14,
    fontWeight: "300",
    color: "#6b7280",
  },
  insightDescription: {
    fontSize: 14,
    fontWeight: "300",
    color: "#374151",
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 16,
  },
  generateButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
  continueButton: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});
