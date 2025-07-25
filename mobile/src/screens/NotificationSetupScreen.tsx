import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { COLORS } from "../constants";

const { width, height } = Dimensions.get("window");

interface NotificationSetupScreenProps {
  onContinue: (selectedTime: string) => void;
}

const timeSlots = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
];

export const NotificationSetupScreen: React.FC<
  NotificationSetupScreenProps
> = ({ onContinue }) => {
  const [selectedTime, setSelectedTime] = useState<string>("8:00 AM");

  const handleContinue = () => {
    onContinue(selectedTime);
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-3xl font-light text-gray-900 text-center mb-4">
            When would you like your daily plans?
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            Choose a time to receive your personalized daily wellness protocols
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-medium text-gray-900 mb-4 text-center">
            Notification Time
          </Text>
          <View className="flex-row flex-wrap justify-center gap-3">
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                className={`px-4 py-3 rounded-full border-2 ${
                  selectedTime === time
                    ? "bg-purple-200 border-purple-400"
                    : "bg-white/80 border-gray-300"
                }`}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  className={`font-medium ${
                    selectedTime === time ? "text-purple-800" : "text-gray-700"
                  }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="items-center pb-8">
          <TouchableOpacity
            className="bg-gray-900 border border-gray-700 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
            onPress={handleContinue}
          >
            <Text className="text-white text-lg font-light">Continue</Text>
            <Text className="text-white text-lg font-light">→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
