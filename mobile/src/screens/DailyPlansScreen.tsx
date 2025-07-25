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

interface Protocol {
  id: string;
  type: "movement" | "mindfulness" | "nutrition";
  title: string;
  description: string;
  duration: string;
  source: string;
  completed: boolean;
}

interface DailyPlansScreenProps {
  onViewCalendar: () => void;
}

export const DailyPlansScreen: React.FC<DailyPlansScreenProps> = ({
  onViewCalendar,
}) => {
  const [protocols, setProtocols] = useState<Protocol[]>([
    {
      id: "1",
      type: "movement",
      title: "Morning Yoga Flow",
      description:
        "A gentle 15-minute yoga sequence to energize your body and mind, focusing on hip openers and gentle twists.",
      duration: "15 min",
      source: "Based on your stress levels and sleep quality",
      completed: false,
    },
    {
      id: "2",
      type: "mindfulness",
      title: "Breathing Meditation",
      description:
        "Practice 4-7-8 breathing technique to reduce cortisol levels and improve focus throughout the day.",
      duration: "10 min",
      source: "Recommended for your elevated stress markers",
      completed: false,
    },
    {
      id: "3",
      type: "nutrition",
      title: "Protein-Rich Breakfast",
      description:
        "Include 20g of protein in your morning meal to support muscle recovery and maintain stable energy levels.",
      duration: "5 min prep",
      source: "Optimized for your fitness goals and cycle phase",
      completed: false,
    },
  ]);

  const toggleProtocol = (protocolId: string) => {
    setProtocols((prev) =>
      prev.map((protocol) =>
        protocol.id === protocolId
          ? { ...protocol, completed: !protocol.completed }
          : protocol
      )
    );
  };

  const getProtocolIcon = (type: string) => {
    switch (type) {
      case "movement":
        return "💪";
      case "mindfulness":
        return "🧘";
      case "nutrition":
        return "🥗";
      default:
        return "✨";
    }
  };

  const getProtocolColor = (type: string) => {
    switch (type) {
      case "movement":
        return "bg-blue-100 border-blue-300";
      case "mindfulness":
        return "bg-purple-100 border-purple-300";
      case "nutrition":
        return "bg-green-100 border-green-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-3xl font-light text-gray-900 text-center mb-4">
            Today's Plan
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            Your personalized wellness protocols for today
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          {protocols.map((protocol) => (
            <View
              key={protocol.id}
              className={`rounded-2xl p-6 border-2 ${getProtocolColor(protocol.type)}`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">
                    {getProtocolIcon(protocol.type)}
                  </Text>
                  <View>
                    <Text className="text-lg font-medium text-gray-900">
                      {protocol.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {protocol.duration}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    protocol.completed
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => toggleProtocol(protocol.id)}
                >
                  {protocol.completed && (
                    <Text className="text-white text-sm">✓</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text className="text-gray-700 leading-relaxed mb-3">
                {protocol.description}
              </Text>

              <Text className="text-sm text-gray-500 italic">
                {protocol.source}
              </Text>
            </View>
          ))}
        </View>

        <View className="items-center pb-8">
          <TouchableOpacity
            className="bg-gray-900 border border-gray-700 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
            onPress={onViewCalendar}
          >
            <Text className="text-white text-lg font-light">View Calendar</Text>
            <Text className="text-white text-lg font-light">→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
