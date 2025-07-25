import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { COLORS } from "../constants";

const { width, height } = Dimensions.get("window");

interface DataConnectionScreenProps {
  onConnect: (providerId: string) => void;
  onSkip: () => void;
}

export const DataConnectionScreen: React.FC<DataConnectionScreenProps> = ({
  onConnect,
  onSkip,
}) => {
  return (
    <View className="flex-1 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center max-w-[90%]">
          <Text className="text-4xl font-light text-gray-900 mb-6 text-center">
            Connect your data
          </Text>

          <Text className="text-lg font-light text-gray-700 text-center mb-12 leading-relaxed">
            Connect your wearable devices to get personalized insights and
            recommendations
          </Text>

          <View className="w-full space-y-4 mb-12">
            <TouchableOpacity
              className="bg-white border border-gray-300 px-8 py-4 rounded-full flex items-center gap-3 justify-center"
              onPress={() => onConnect("whoop")}
            >
              <Text className="text-2xl">⌚</Text>
              <Text className="text-gray-900 text-lg font-light">
                Connect Whoop
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-gray-300 px-8 py-4 rounded-full flex items-center gap-3 justify-center"
              onPress={() => onConnect("oura")}
            >
              <Text className="text-2xl">💍</Text>
              <Text className="text-gray-900 text-lg font-light">
                Connect Oura Ring
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border border-gray-300 px-8 py-4 rounded-full flex items-center gap-3 justify-center"
              onPress={() => onConnect("apple-health")}
            >
              <Text className="text-2xl">📱</Text>
              <Text className="text-gray-900 text-lg font-light">
                Connect Apple Health
              </Text>
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-900 border border-gray-700 px-8 py-4 rounded-full flex items-center gap-3 min-w-[280px] justify-center"
              onPress={onSkip}
            >
              <Text className="text-white text-lg font-light">
                Generate Insights
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
