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

interface InsightsScreenProps {
  onContinue: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  onContinue,
}) => {
  return (
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-3xl font-light text-gray-900 text-center mb-4">
            Your AI Insights
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            Based on your health data and priorities
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              Sleep Pattern Analysis
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Your sleep efficiency has improved by 15% this week. Your deep
              sleep duration is optimal, but you could benefit from going to bed
              30 minutes earlier to maximize REM sleep.
            </Text>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              Stress Management
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Your stress levels are elevated during work hours. Consider
              implementing 5-minute breathing exercises every 2 hours to
              maintain optimal cortisol levels.
            </Text>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              Nutrition Recommendations
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Your hydration levels are good, but you could benefit from
              increasing your protein intake by 20g daily to support your
              fitness goals and recovery.
            </Text>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              Hormonal Health
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Your cycle data suggests optimal timing for high-intensity
              workouts. Consider scheduling strength training during days 5-14
              of your cycle for maximum performance.
            </Text>
          </View>
        </View>

        <View className="items-center pb-8">
          <TouchableOpacity
            className="bg-gray-900 border border-gray-700 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
            onPress={onContinue}
          >
            <Text className="text-white text-lg font-light">
              Continue to Daily Plans
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
