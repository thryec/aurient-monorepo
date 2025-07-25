import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { COLORS } from "../constants";

const { width, height } = Dimensions.get("window");

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <View className="flex-1 justify-center items-center px-4 bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      <View className="items-center max-w-[95%]">
        <Text className="text-5xl font-extralight text-gray-900 mb-3 tracking-tight">
          Aurient
        </Text>
        <Text className="text-xl font-light text-gray-700 mb-8 tracking-wide">
          Monetize your health data
        </Text>

        <View className="items-center mb-6">
          <Text className="text-3xl font-light text-gray-900 text-center mb-3 leading-tight">
            Turn your health data into <Text className="italic">IP assets</Text>
          </Text>
          <Text className="text-lg font-light text-gray-700 text-center leading-relaxed">
            AI-powered wellness insights for women to support where the{" "}
            <Text className="font-medium">medical system</Text> and{" "}
            <Text className="font-medium">wearable tech</Text> have fallen
            short.
          </Text>
        </View>

        <View className="gap-3 items-center">
          <TouchableOpacity
            className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-full flex items-center gap-2 min-w-[260px] justify-center"
            onPress={onStart}
          >
            <Text className="text-white text-lg font-light">
              Protect your health data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-300 px-6 py-3 rounded-full flex items-center gap-2 min-w-[260px] justify-center"
            onPress={onStart}
          >
            <Text className="text-gray-900 text-lg font-light">
              Data Marketplace
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
