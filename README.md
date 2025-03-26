# Fitness App

A React Native mobile application for tracking fitness workouts, built with Expo and a MySQL backend.

## Features

- User Authentication (Login & Registration)
- Workout Tracking with CRUD operations
- Timer functionality for workouts
- Sound alerts for workout completion
- Configurable server connection for real devices

## Setup Instructions

### Prerequisites

- Node.js and npm
- MySQL server
- Expo CLI and EAS CLI
- Expo account (for EAS builds)

### Database Setup

1. Create a MySQL database using the included schema:

```bash
mysql -u root -p < database.sql
```

2. Configure your MySQL connection in the `.env` file:

```
# MySQL Connection
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=fitness_app
DB_PORT=3306

# Server Configuration
PORT=3001
```

### Backend Setup

1. Install dependencies:

```bash
npm install
```

2. Start the backend server:

```bash
npm run server
```

The server will display available connection URLs including your local network IP.

### Running the App in Development

1. Start the Expo development server:

```bash
npm start
```

2. Use the Expo Go app on your mobile device or run in an emulator.

3. Configure the server connection in the app's Settings screen with your computer's local IP address (e.g., http://192.168.1.100:3001).

## Building for Android

### Development Build

```bash
npm run build:dev
```

### Preview Build (APK)

1. Update the `eas.json` file with your server IP:

```json
"env": {
  "EXPO_PUBLIC_API_URL": "http://YOUR_LOCAL_IP:3001"
}
```

2. Run the build command:

```bash
npm run build:preview
```

### Production Build

```bash
npm run build:production
```

## Troubleshooting

### Connection Issues on Real Devices

- Ensure your phone and computer are on the same WiFi network
- Check that your computer's firewall allows connections to the server port
- Verify the IP address is correct in the app settings
- For Android emulators, use `10.0.2.2` instead of `localhost`

### ViewManagerResolver Errors

If you encounter a ViewManagerResolver error similar to the one in the reference image:

1. Ensure you have the latest versions of navigation packages:

```bash
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

2. Make sure App.js properly initializes screens with `enableScreens()`

3. Wrap your app with `GestureHandlerRootView`

## License

MIT
