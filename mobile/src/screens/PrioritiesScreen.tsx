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

interface Priority {
  id: string;
  title: string;
  icon: string;
}

interface PrioritiesScreenProps {
  onContinue: (selectedPriorities: string[]) => void;
}

const priorities: Priority[] = [
  { id: "hormonal-health", title: "Hormonal Health", icon: "🌙" },
  { id: "weight-management", title: "Weight Management", icon: "⚖️" },
  { id: "stress-management", title: "Stress Management", icon: "🧘" },
  { id: "nutrition", title: "Nutrition", icon: "🥗" },
  { id: "fitness", title: "Fitness", icon: "💪" },
  { id: "sleep", title: "Sleep", icon: "😴" },
  { id: "energy", title: "Energy", icon: "⚡" },
  { id: "mood", title: "Mood", icon: "😊" },
  { id: "digestive-health", title: "Digestive Health", icon: "🫀" },
  { id: "immune-system", title: "Immune System", icon: "🛡️" },
  { id: "skin-health", title: "Skin Health", icon: "✨" },
  { id: "mental-clarity", title: "Mental Clarity", icon: "🧠" },
];

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
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <ScrollView className="flex-1 px-6 pt-16">
        <View className="items-center mb-8">
          <Text className="text-3xl font-light text-gray-900 text-center mb-4">
            What are your health priorities?
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            Select at least 2 areas you'd like to focus on
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-3 mb-8">
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.id}
              className={`px-6 py-3 rounded-full border-2 flex-row items-center gap-2 ${
                selectedPriorities.includes(priority.id)
                  ? "bg-purple-200 border-purple-400"
                  : "bg-white/80 border-gray-300"
              }`}
              onPress={() => togglePriority(priority.id)}
            >
              <Text className="text-lg">{priority.icon}</Text>
              <Text
                className={`font-medium ${
                  selectedPriorities.includes(priority.id)
                    ? "text-purple-800"
                    : "text-gray-700"
                }`}
              >
                {priority.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="items-center pb-4">
          <TouchableOpacity
            className={`px-6 py-3 rounded-full flex items-center gap-2 min-w-[260px] justify-center ${
              selectedPriorities.length >= 2
                ? "bg-gray-900 border border-gray-700"
                : "bg-gray-300 border border-gray-400"
            }`}
            onPress={handleContinue}
            disabled={selectedPriorities.length < 2}
          >
            <Text
              className={`text-lg font-light ${
                selectedPriorities.length >= 2 ? "text-white" : "text-gray-500"
              }`}
            >
              Continue ({selectedPriorities.length}/2+)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
