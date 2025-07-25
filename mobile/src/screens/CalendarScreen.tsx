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

interface DayPlan {
  date: string;
  day: number;
  completed: boolean;
  hasPlan: boolean;
  protocols: {
    movement: boolean;
    mindfulness: boolean;
    nutrition: boolean;
  };
}

// Generate sample data for the past 30 days
const generateCalendarData = (): DayPlan[] => {
  const today = new Date();
  const days: DayPlan[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayPlan: DayPlan = {
      date: date.toISOString().split("T")[0],
      day: date.getDate(),
      completed: Math.random() > 0.3, // 70% completion rate
      hasPlan: true,
      protocols: {
        movement: Math.random() > 0.4,
        mindfulness: Math.random() > 0.4,
        nutrition: Math.random() > 0.4,
      },
    };

    days.push(dayPlan);
  }

  return days;
};

interface CalendarScreenProps {
  onSelectDay: (date: string) => void;
  onBack: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onSelectDay,
  onBack,
}) => {
  const [calendarData] = useState<DayPlan[]>(generateCalendarData());

  const getCompletionColor = (completed: boolean) => {
    return completed ? "#10b981" : "#6b7280";
  };

  const getCompletionIcon = (completed: boolean) => {
    return completed ? "✅" : "⭕";
  };

  const getProtocolIcon = (type: string, completed: boolean) => {
    if (!completed) return "⭕";

    switch (type) {
      case "movement":
        return "🏃";
      case "mindfulness":
        return "🧘";
      case "nutrition":
        return "🥗";
      default:
        return "✅";
    }
  };

  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Past 30 days of wellness</Text>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>✅</Text>
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>⭕</Text>
              <Text style={styles.legendText}>Incomplete</Text>
            </View>
          </View>

          <View style={styles.calendarGrid}>
            {calendarData.map((dayPlan, index) => (
              <TouchableOpacity
                key={dayPlan.date}
                style={[
                  styles.dayCard,
                  dayPlan.completed && styles.completedDayCard,
                ]}
                onPress={() => onSelectDay(dayPlan.date)}
                disabled={!dayPlan.hasPlan}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    dayPlan.completed && styles.completedDayNumber,
                  ]}
                >
                  {dayPlan.day}
                </Text>

                <View style={styles.protocolsContainer}>
                  <Text style={styles.protocolIcon}>
                    {getProtocolIcon("movement", dayPlan.protocols.movement)}
                  </Text>
                  <Text style={styles.protocolIcon}>
                    {getProtocolIcon(
                      "mindfulness",
                      dayPlan.protocols.mindfulness
                    )}
                  </Text>
                  <Text style={styles.protocolIcon}>
                    {getProtocolIcon("nutrition", dayPlan.protocols.nutrition)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.completionIcon,
                    { color: getCompletionColor(dayPlan.completed) },
                  ]}
                >
                  {getCompletionIcon(dayPlan.completed)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {calendarData.filter((day) => day.completed).length}
            </Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(
                (calendarData.filter((day) => day.completed).length /
                  calendarData.length) *
                  100
              )}
              %
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
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
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "300",
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "300",
    color: "#6b7280",
    textAlign: "center",
  },
  calendarContainer: {
    marginBottom: 40,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendIcon: {
    fontSize: 16,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#374151",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  dayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: (width - 60) / 3 - 8,
    aspectRatio: 1,
  },
  completedDayCard: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  completedDayNumber: {
    color: "#10b981",
  },
  protocolsContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  protocolIcon: {
    fontSize: 12,
  },
  completionIcon: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "200",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "300",
    color: "#6b7280",
    textAlign: "center",
  },
});
