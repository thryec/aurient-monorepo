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

interface TimeSlot {
  id: string;
  time: string;
  label: string;
}

const timeSlots: TimeSlot[] = [
  { id: "6am", time: "6:00 AM", label: "Early Bird" },
  { id: "7am", time: "7:00 AM", label: "Morning" },
  { id: "8am", time: "8:00 AM", label: "Breakfast" },
  { id: "9am", time: "9:00 AM", label: "Work Start" },
  { id: "12pm", time: "12:00 PM", label: "Lunch" },
  { id: "6pm", time: "6:00 PM", label: "Evening" },
  { id: "8pm", time: "8:00 PM", label: "Night" },
  { id: "9pm", time: "9:00 PM", label: "Bedtime" },
];

interface NotificationSetupScreenProps {
  onContinue: (selectedTime: string) => void;
}

export const NotificationSetupScreen: React.FC<
  NotificationSetupScreenProps
> = ({ onContinue }) => {
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleContinue = () => {
    if (selectedTime) {
      onContinue(selectedTime);
    }
  };

  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Plans</Text>
          <Text style={styles.subtitle}>
            When would you like to receive your daily wellness plan?
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Choose your preferred time:</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeCard,
                  selectedTime === slot.id && styles.selectedTimeCard,
                ]}
                onPress={() => setSelectedTime(slot.id)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === slot.id && styles.selectedTimeText,
                  ]}
                >
                  {slot.time}
                </Text>
                <Text
                  style={[
                    styles.timeSlotLabel,
                    selectedTime === slot.id && styles.selectedTimeLabel,
                  ]}
                >
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            You'll receive a personalized daily plan with movement, mindfulness,
            and nutrition recommendations at your selected time.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedTime && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedTime}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  timeContainer: {
    marginBottom: 40,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "300",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  timeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: (width - 60) / 2,
  },
  selectedTimeCard: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  selectedTimeText: {
    color: "#3b82f6",
  },
  timeSlotLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: "#6b7280",
  },
  selectedTimeLabel: {
    color: "#3b82f6",
  },
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
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
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});
