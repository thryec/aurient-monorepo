import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { IntroScreen } from "../screens/IntroScreen";
import { PrioritiesScreen } from "../screens/PrioritiesScreen";
import { DataConnectionScreen } from "../screens/DataConnectionScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { PaywallScreen } from "../screens/PaywallScreen";
import { NotificationSetupScreen } from "../screens/NotificationSetupScreen";
import { DailyPlansScreen } from "../screens/DailyPlansScreen";
import { CalendarScreen } from "../screens/CalendarScreen";
import { COLORS } from "../constants";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main app flow navigator
const AppFlowNavigator = () => {
  const [userFlow, setUserFlow] = useState({
    hasSeenIntro: false,
    selectedPriorities: [] as string[],
    hasConnectedData: false,
    hasGeneratedInsights: false,
    hasSeenPaywall: false,
    notificationTime: "",
    hasCompletedSetup: false,
  });

  const handleStart = () => {
    setUserFlow((prev) => ({ ...prev, hasSeenIntro: true }));
  };

  const handlePrioritiesContinue = (priorities: string[]) => {
    setUserFlow((prev) => ({ ...prev, selectedPriorities: priorities }));
  };

  const handleDataConnect = (providerId: string) => {
    setUserFlow((prev) => ({ ...prev, hasConnectedData: true }));
  };

  const handleDataSkip = () => {
    setUserFlow((prev) => ({ ...prev, hasConnectedData: true }));
  };

  const handleGenerateInsights = () => {
    setUserFlow((prev) => ({ ...prev, hasGeneratedInsights: true }));
  };

  const handleInsightsContinue = () => {
    setUserFlow((prev) => ({ ...prev, hasGeneratedInsights: true }));
  };

  const handlePaywallSubscribe = () => {
    setUserFlow((prev) => ({ ...prev, hasSeenPaywall: true }));
  };

  const handlePaywallSkip = () => {
    setUserFlow((prev) => ({ ...prev, hasSeenPaywall: true }));
  };

  const handleNotificationSetup = (time: string) => {
    setUserFlow((prev) => ({
      ...prev,
      notificationTime: time,
      hasCompletedSetup: true,
    }));
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!userFlow.hasSeenIntro ? (
        <Stack.Screen name="Intro">
          {(props) => <IntroScreen {...props} onStart={handleStart} />}
        </Stack.Screen>
      ) : !userFlow.selectedPriorities.length ? (
        <Stack.Screen name="Priorities">
          {(props) => (
            <PrioritiesScreen
              {...props}
              onContinue={handlePrioritiesContinue}
            />
          )}
        </Stack.Screen>
      ) : !userFlow.hasConnectedData ? (
        <Stack.Screen name="DataConnection">
          {(props) => (
            <DataConnectionScreen
              {...props}
              onConnect={handleDataConnect}
              onSkip={handleDataSkip}
            />
          )}
        </Stack.Screen>
      ) : !userFlow.hasGeneratedInsights ? (
        <Stack.Screen name="Insights">
          {(props) => (
            <InsightsScreen
              {...props}
              onGenerateInsights={handleGenerateInsights}
              onContinue={handleInsightsContinue}
            />
          )}
        </Stack.Screen>
      ) : !userFlow.hasSeenPaywall ? (
        <Stack.Screen name="Paywall">
          {(props) => (
            <PaywallScreen
              {...props}
              onSubscribe={handlePaywallSubscribe}
              onSkip={handlePaywallSkip}
            />
          )}
        </Stack.Screen>
      ) : !userFlow.hasCompletedSetup ? (
        <Stack.Screen name="NotificationSetup">
          {(props) => (
            <NotificationSetupScreen
              {...props}
              onContinue={handleNotificationSetup}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Main app with daily plans and calendar
const MainNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<"daily" | "calendar">(
    "daily"
  );
  const [completedProtocols, setCompletedProtocols] = useState<string[]>([]);

  const handleToggleProtocol = (protocolId: string) => {
    setCompletedProtocols((prev) =>
      prev.includes(protocolId)
        ? prev.filter((id) => id !== protocolId)
        : [...prev, protocolId]
    );
  };

  const handleViewCalendar = () => {
    setCurrentScreen("calendar");
  };

  const handleCalendarBack = () => {
    setCurrentScreen("daily");
  };

  const handleSelectDay = (date: string) => {
    // Handle day selection - could show historical plan
    console.log("Selected day:", date);
  };

  if (currentScreen === "calendar") {
    return (
      <CalendarScreen
        onSelectDay={handleSelectDay}
        onBack={handleCalendarBack}
      />
    );
  }

  return (
    <DailyPlansScreen
      onToggleProtocol={handleToggleProtocol}
      onViewCalendar={handleViewCalendar}
    />
  );
};

// Tab navigator for future expansion
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppFlowNavigator />
    </NavigationContainer>
  );
};
