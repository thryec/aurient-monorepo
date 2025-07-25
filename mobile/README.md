# Aurient Mobile App

A React Native mobile app for personalized wellness plans and health data monetization.

## App Flow

The mobile app follows this user journey:

### 1. Intro Screen
- Welcome screen with Aurient branding
- "Start Here" button to begin onboarding

### 2. Priorities Selection
- Users select their health priorities:
  - Hormonal Health
  - Weight Management  
  - Stress Management
  - Nutrition
  - Fitness
- Multi-select interface with checkboxes

### 3. Data Connection
- Connect wearable devices (Whoop, Oura Ring)
- Option to skip data connection
- Clean card-based interface

### 4. AI Insights
- Display personalized insights based on user data
- "Generate New Insights" button
- "Continue to Daily Plans" button

### 5. Paywall Screen
- Premium features showcase
- $9.99/month pricing
- 7-day free trial
- "Start Free Trial" and "Maybe Later" options

### 6. Notification Setup
- First-time users set daily plan notification time
- Time slot selection (6 AM - 9 PM)
- Advent calendar style interface

### 7. Daily Plans
- Three daily protocols: Movement, Mindfulness, Nutrition
- Expandable cards with explanations and sources
- Checkbox completion tracking
- "View Calendar" button

### 8. Calendar View
- 30-day progress view
- Advent calendar style with completion indicators
- Protocol type icons (🏃🧘🥗)
- Statistics cards (Days Completed, Success Rate)

## Design System

The app uses a consistent design system matching the web frontend:

### Colors
- Primary gradient: Orange → Pink → Purple → Blue
- White cards with subtle shadows
- Green for completed items
- Blue for interactive elements

### Typography
- Light font weights (200-300) for elegance
- Consistent spacing and sizing
- Clear hierarchy with titles and descriptions

### Components
- Card-based layouts with rounded corners
- Subtle shadows and borders
- Consistent button styling
- Expandable content sections

## Technical Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Expo Linear Gradient** for backgrounds
- **State management** with React hooks

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
npm run ios
# or
npm run android
```

## File Structure

```
src/
├── screens/
│   ├── IntroScreen.tsx
│   ├── PrioritiesScreen.tsx
│   ├── DataConnectionScreen.tsx
│   ├── InsightsScreen.tsx
│   ├── PaywallScreen.tsx
│   ├── NotificationSetupScreen.tsx
│   ├── DailyPlansScreen.tsx
│   └── CalendarScreen.tsx
├── navigation/
│   └── AppNavigator.tsx
├── constants/
│   └── index.ts
└── types/
    └── index.ts
```

## Features

### Current (UI Only)
- ✅ Complete onboarding flow
- ✅ Priority selection
- ✅ Data connection interface
- ✅ AI insights display
- ✅ Paywall screen
- ✅ Notification setup
- ✅ Daily plans with protocols
- ✅ Calendar view with progress
- ✅ Protocol completion tracking

### Future Implementation
- 🔄 Actual data integration (Whoop/Oura APIs)
- 🔄 AI insights generation
- 🔄 Push notifications
- 🔄 Payment processing
- 🔄 Data persistence
- 🔄 User authentication
- 🔄 Real-time plan generation

## Notes

- All screens use placeholder data for demonstration
- Linear gradient backgrounds match web frontend
- Mobile-optimized layouts and interactions
- Consistent with Aurient brand identity
- Ready for backend integration 