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

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    id: "daily-plans",
    title: "Daily Plans",
    description: "Personalized daily wellness protocols",
    icon: "📅",
  },
  {
    id: "ai-insights",
    title: "AI Insights",
    description: "Advanced health analytics and recommendations",
    icon: "🤖",
  },
  {
    id: "notifications",
    title: "Smart Notifications",
    description: "Timely reminders and progress tracking",
    icon: "🔔",
  },
  {
    id: "community",
    title: "Community Access",
    description: "Connect with like-minded wellness enthusiasts",
    icon: "👥",
  },
];

interface PaywallScreenProps {
  onSubscribe: () => void;
  onSkip: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onSubscribe,
  onSkip,
}) => {
  return (
    <LinearGradient
      colors={["#fed7aa", "#fbbf24", "#a78bfa", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Unlock Premium</Text>
          <Text style={styles.subtitle}>
            Get access to personalized daily plans and advanced insights
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <View style={styles.priceCard}>
            <Text style={styles.price}>$9.99</Text>
            <Text style={styles.pricePeriod}>per month</Text>
            <Text style={styles.priceDescription}>
              Cancel anytime • 7-day free trial
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={onSubscribe}
          >
            <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Maybe Later</Text>
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
  featuresContainer: {
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: "300",
    color: "#6b7280",
  },
  pricingContainer: {
    marginBottom: 40,
  },
  priceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  price: {
    fontSize: 48,
    fontWeight: "200",
    color: "#1f2937",
    marginBottom: 4,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: "300",
    color: "#6b7280",
    marginBottom: 8,
  },
  priceDescription: {
    fontSize: 14,
    fontWeight: "300",
    color: "#6b7280",
    textAlign: "center",
  },
  actionsContainer: {
    gap: 16,
  },
  subscribeButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "300",
  },
});
