import React, { useState } from "react";
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

interface Protocol {
  id: string;
  title: string;
  description: string;
  category: "movement" | "mindfulness" | "nutrition";
  icon: string;
  completed: boolean;
  explanation: string;
  source: string;
}

const dailyPlan: Protocol[] = [
  {
    id: "movement-1",
    title: "Morning Walk",
    description: "15-minute brisk walk to boost metabolism",
    category: "movement",
    icon: "🚶",
    completed: false,
    explanation:
      "Walking in the morning helps regulate your circadian rhythm and boosts metabolism for the day.",
    source: "Journal of Applied Physiology, 2023",
  },
  {
    id: "mindfulness-1",
    title: "Breathing Exercise",
    description: "5-minute box breathing for stress reduction",
    category: "mindfulness",
    icon: "🫁",
    completed: false,
    explanation:
      "Box breathing activates the parasympathetic nervous system, reducing cortisol levels.",
    source: "Harvard Health, 2022",
  },
  {
    id: "nutrition-1",
    title: "Protein-Rich Breakfast",
    description: "Include 20g protein in your morning meal",
    category: "nutrition",
    icon: "🥚",
    completed: false,
    explanation:
      "Protein in the morning helps stabilize blood sugar and provides sustained energy.",
    source: "Nutrition Research, 2023",
  },
];

interface DailyPlansScreenProps {
  onToggleProtocol: (protocolId: string) => void;
  onViewCalendar: () => void;
}

export const DailyPlansScreen: React.FC<DailyPlansScreenProps> = ({
  onToggleProtocol,
  onViewCalendar,
}) => {
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);

  const toggleProtocol = (protocolId: string) => {
    onToggleProtocol(protocolId);
  };

  const toggleExpanded = (protocolId: string) => {
    setExpandedProtocol(expandedProtocol === protocolId ? null : protocolId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "movement":
        return "#ef4444";
      case "mindfulness":
        return "#8b5cf6";
      case "nutrition":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "movement":
        return "Movement";
      case "mindfulness":
        return "Mindfulness";
      case "nutrition":
        return "Nutrition";
      default:
        return category;
    }
  };

  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Plan</Text>
          <Text style={styles.date}>December 15, 2024</Text>
        </View>

        <View style={styles.protocolsContainer}>
          {dailyPlan.map((protocol) => (
            <View key={protocol.id} style={styles.protocolCard}>
              <View style={styles.protocolHeader}>
                <View style={styles.protocolInfo}>
                  <Text style={styles.protocolIcon}>{protocol.icon}</Text>
                  <View style={styles.protocolContent}>
                    <Text style={styles.protocolTitle}>{protocol.title}</Text>
                    <Text style={styles.protocolDescription}>
                      {protocol.description}
                    </Text>
                    <View
                      style={[
                        styles.categoryTag,
                        {
                          backgroundColor:
                            getCategoryColor(protocol.category) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: getCategoryColor(protocol.category) },
                        ]}
                      >
                        {getCategoryLabel(protocol.category)}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    protocol.completed && styles.checkedBox,
                  ]}
                  onPress={() => toggleProtocol(protocol.id)}
                >
                  {protocol.completed && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => toggleExpanded(protocol.id)}
              >
                <Text style={styles.expandButtonText}>
                  {expandedProtocol === protocol.id ? "Hide" : "Learn More"}
                </Text>
              </TouchableOpacity>

              {expandedProtocol === protocol.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.explanationTitle}>Why this works:</Text>
                  <Text style={styles.explanationText}>
                    {protocol.explanation}
                  </Text>
                  <Text style={styles.sourceText}>
                    Source: {protocol.source}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={onViewCalendar}
          >
            <Text style={styles.calendarButtonText}>View Calendar</Text>
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
    marginBottom: 8,
    textAlign: "center",
  },
  date: {
    fontSize: 16,
    fontWeight: "300",
    color: "#6b7280",
  },
  protocolsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  protocolCard: {
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
  protocolHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  protocolInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  protocolIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  protocolContent: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  protocolDescription: {
    fontSize: 14,
    fontWeight: "300",
    color: "#6b7280",
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  expandButton: {
    paddingVertical: 8,
  },
  expandButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "300",
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 231, 235, 0.5)",
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "300",
    color: "#6b7280",
    fontStyle: "italic",
  },
  actionsContainer: {
    alignItems: "center",
  },
  calendarButton: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
  },
  calendarButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});
