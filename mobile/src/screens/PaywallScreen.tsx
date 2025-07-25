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

interface PaywallScreenProps {
  onSubscribe: () => void;
  onSkip: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onSubscribe,
  onSkip,
}) => {
  return (
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-4xl font-light text-gray-900 text-center mb-4">
            Unlock Premium Features
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            Get personalized daily plans, advanced insights, and priority
            support
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              ✨ Daily Personalized Plans
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Get customized movement, mindfulness, and nutrition protocols
              tailored to your cycle and goals.
            </Text>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              📊 Advanced Analytics
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Deep dive into your health patterns with detailed insights and
              trend analysis.
            </Text>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              🔔 Smart Notifications
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Receive timely reminders and insights based on your health data
              and preferences.
            </Text>
          </View>

          <View className="bg-white/90 rounded-2xl p-6 border border-gray-200">
            <Text className="text-lg font-medium text-gray-900 mb-2">
              💬 Priority Support
            </Text>
            <Text className="text-gray-700 leading-relaxed">
              Get direct access to our health coaches and personalized guidance.
            </Text>
          </View>
        </View>

        <View className="items-center space-y-4 pb-8">
          <TouchableOpacity
            className="bg-gray-900 border border-gray-700 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
            onPress={onSubscribe}
          >
            <Text className="text-white text-lg font-light">
              Subscribe - $9.99/month
            </Text>
            <Text className="text-white text-lg font-light">→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-300 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
            onPress={onSkip}
          >
            <Text className="text-gray-900 text-lg font-light">
              Continue with Free Plan
            </Text>
            <Text className="text-gray-900 text-lg font-light">→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
