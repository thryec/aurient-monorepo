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

interface Priority {
  id: string;
  title: string;
  icon: string;
}

const priorities: Priority[] = [
  {
    id: "hormonal",
    title: "Hormonal Health",
    icon: "🌙",
  },
  {
    id: "weight",
    title: "Weight Management",
    icon: "⚖️",
  },
  {
    id: "stress",
    title: "Stress Management",
    icon: "🧘",
  },
  {
    id: "nutrition",
    title: "Nutrition",
    icon: "🥗",
  },
  {
    id: "fitness",
    title: "Fitness",
    icon: "💪",
  },
  {
    id: "sleep",
    title: "Sleep",
    icon: "😴",
  },
  {
    id: "energy",
    title: "Energy",
    icon: "⚡",
  },
  {
    id: "mood",
    title: "Mood",
    icon: "😊",
  },
  {
    id: "focus",
    title: "Focus",
    icon: "🎯",
  },
  {
    id: "recovery",
    title: "Recovery",
    icon: "🔄",
  },
  {
    id: "immunity",
    title: "Immunity",
    icon: "🛡️",
  },
  {
    id: "digestion",
    title: "Digestion",
    icon: "🌱",
  },
];

interface PrioritiesScreenProps {
  onContinue: (selectedPriorities: string[]) => void;
}

export const PrioritiesScreen: React.FC<PrioritiesScreenProps> = ({
  onContinue,
}) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const togglePriority = (priorityId: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priorityId)
        ? prev.filter((id) => id !== priorityId)
        : [...prev, priorityId]
    );
  };

  const handleContinue = () => {
    if (selectedPriorities.length >= 2) {
      onContinue(selectedPriorities);
    }
  };

  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's select your priorities</Text>
          <Text style={styles.subtitle}>
            Please select two or more to proceed
          </Text>
        </View>

        <View style={styles.tagsContainer}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.tag,
                selectedPriorities.includes(priority.id) && styles.selectedTag,
              ]}
              onPress={() => togglePriority(priority.id)}
            >
              <Text style={styles.tagIcon}>{priority.icon}</Text>
              <Text
                style={[
                  styles.tagText,
                  selectedPriorities.includes(priority.id) &&
                    styles.selectedTagText,
                ]}
              >
                {priority.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedPriorities.length < 2 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={selectedPriorities.length < 2}
        >
          <Text style={styles.continueButtonText}>
            Continue ({selectedPriorities.length} selected)
          </Text>
        </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 40,
  },
  tag: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: (width - 60) / 2 - 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTag: {
    backgroundColor: "#f3f4f6",
    borderColor: "#8b5cf6",
    borderWidth: 2,
  },
  tagIcon: {
    fontSize: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },
  selectedTagText: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#e5e7eb",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
