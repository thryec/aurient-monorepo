import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { COLORS } from "../constants";

const { width, height } = Dimensions.get("window");

interface CalendarDay {
  date: number;
  completed: boolean;
  hasPlan: boolean;
}

interface CalendarScreenProps {
  onBack: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onBack }) => {
  // Generate calendar data for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isPast =
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push({
        date: day,
        completed: isPast && Math.random() > 0.3, // Random completion for past days
        hasPlan: isPast, // Only past days have plans
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-3xl font-light text-gray-900 text-center mb-4">
            Your Progress
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            Track your daily wellness journey
          </Text>
        </View>

        <View className="bg-white/90 rounded-2xl p-6 border border-gray-200 mb-8">
          <Text className="text-lg font-medium text-gray-900 mb-4 text-center">
            December 2024
          </Text>

          <View className="flex-row justify-between mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text
                key={day}
                className="text-sm font-medium text-gray-600 w-10 text-center"
              >
                {day}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {calendarDays.map((day, index) => (
              <View
                key={index}
                className="w-10 h-10 items-center justify-center"
              >
                <TouchableOpacity
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    day.hasPlan
                      ? day.completed
                        ? "bg-green-500"
                        : "bg-gray-300"
                      : "bg-transparent"
                  }`}
                  disabled={!day.hasPlan}
                >
                  <Text
                    className={`text-sm font-medium ${
                      day.hasPlan
                        ? day.completed
                          ? "text-white"
                          : "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {day.date}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View className="space-y-4 mb-8">
          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              This Month's Stats
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Days with plans:</Text>
                <Text className="text-gray-900 font-medium">15</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Completed protocols:</Text>
                <Text className="text-gray-900 font-medium">42</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Completion rate:</Text>
                <Text className="text-gray-900 font-medium">87%</Text>
              </View>
            </View>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              Recent Achievements
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-700">🎯 Completed 7-day streak</Text>
              <Text className="text-gray-700">
                💪 Improved sleep quality by 20%
              </Text>
              <Text className="text-gray-700">
                🧘 Reduced stress markers by 15%
              </Text>
            </View>
          </View>
        </View>

        <View className="items-center pb-8">
          <TouchableOpacity
            className="bg-gray-900 border border-gray-700 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
            onPress={onBack}
          >
            <Text className="text-white text-lg font-light">
              Back to Today's Plan
            </Text>
            <Text className="text-white text-lg font-light">→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
