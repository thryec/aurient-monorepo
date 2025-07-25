# Aurient Mobile App

A React Native mobile application built with Expo for the Aurient project.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API and external services
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── constants/      # App constants and configuration
├── assets/             # Images, fonts, and other assets
├── App.tsx            # Main app component
├── app.json           # Expo configuration
└── package.json       # Dependencies and scripts
```

## 🛠️ Key Features

- **React Native with Expo**: Modern mobile development framework
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation between screens
- **Web3 Integration**: Built-in support for blockchain interactions
- **Secure Storage**: Secure key and data storage
- **Cross-platform**: iOS, Android, and Web support
- **Web Browser Integration**: Deep linking and external browser support

## 📦 Dependencies

### Core
- `expo`: React Native framework
- `react-native`: Mobile app framework
- `typescript`: Type safety

### Navigation
- `@react-navigation/native`: Navigation library
- `@react-navigation/stack`: Stack navigation
- `@react-navigation/bottom-tabs`: Tab navigation

### Web3 & Blockchain
- `viem`: Ethereum client
- `wagmi`: React hooks for Ethereum
- `@tanstack/react-query`: Data fetching

### UI & UX
- `react-native-reanimated`: Animations
- `react-native-gesture-handler`: Gestures
- `react-native-svg`: SVG support
- `react-native-safe-area-context`: Safe area handling

### Security & Storage
- `expo-secure-store`: Secure storage
- `expo-web-browser`: Web browser integration

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the mobile directory:
```
EXPO_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id
EXPO_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

### App Configuration
Edit `app.json` to customize:
- App name and bundle identifier
- Icons and splash screen
- Platform-specific settings

## 🚀 Deployment

### Building for Production

1. **Android APK**:
```bash
npm run build:android
```

2. **iOS App Store**:
```bash
npm run build:ios
```

### Ejecting from Expo
If you need to eject from Expo managed workflow:
```bash
npm run eject
```

## 🔄 Extracting to Separate Repository

This mobile app is designed to be easily extractable to a separate repository. To do so:

1. Copy the entire `mobile/` directory
2. Create a new repository
3. Update the following files:
   - `package.json`: Update name and remove any monorepo-specific configurations
   - `app.json`: Update bundle identifiers if needed
   - `README.md`: Update project references

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper types in `src/types/`
4. Update constants in `src/constants/`
5. Test on both iOS and Android

## 📄 License

This project is part of the Aurient monorepo and follows the same license terms. 