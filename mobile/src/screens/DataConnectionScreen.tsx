import React from "react";
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

interface DataProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const dataProviders: DataProvider[] = [
  {
    id: "whoop",
    name: "Whoop",
    description: "Connect your Whoop device for comprehensive health insights",
    icon: "🏃",
    color: "#00D4AA",
  },
  {
    id: "oura",
    name: "Oura Ring",
    description: "Sync your Oura ring data for sleep and recovery analysis",
    icon: "💍",
    color: "#6366F1",
  },
];

interface DataConnectionScreenProps {
  onConnect: (providerId: string) => void;
  onSkip: () => void;
}

export const DataConnectionScreen: React.FC<DataConnectionScreenProps> = ({
  onConnect,
  onSkip,
}) => {
  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Data</Text>
          <Text style={styles.subtitle}>
            Connect your wearable devices to get personalized insights
          </Text>
        </View>

        <View style={styles.providersContainer}>
          {dataProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => onConnect(provider.id)}
            >
              <View style={styles.providerHeader}>
                <Text style={styles.providerIcon}>{provider.icon}</Text>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerDescription}>
                    {provider.description}
                  </Text>
                </View>
              </View>
              <View style={styles.connectButton}>
                <Text style={styles.connectButtonText}>Connect</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.skipContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
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
  providersContainer: {
    gap: 16,
    marginBottom: 40,
  },
  providerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  providerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 14,
    fontWeight: "300",
    color: "#6b7280",
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  connectButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  skipContainer: {
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "300",
  },
});
