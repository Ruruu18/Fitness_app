# Using Your Fitness App

This guide provides instructions for using your Fitness App with the newly configured backend that can operate both locally and on Vercel.

## Getting Started

### Test Account

The app is configured with a test account for quick testing:

- **Email**: test@example.com
- **Password**: password123

This account works when using either:

- The fallback in-memory database (when no MySQL connection is available)
- The local MySQL database (if properly configured)

### Connecting to Different Backends

The app supports three ways to connect to a backend:

1. **Local Development** - When testing on an emulator, the app automatically connects to:

   - Android: http://10.0.2.2:3001
   - iOS: http://localhost:3001

2. **Vercel Deployment** - The app will use the Vercel URL specified in your EAS build environment variables.

3. **Custom Server** - You can set a custom server URL in the app's Settings screen.

## Features

### 1. Authentication

- **Login**: Access your account with registered email and password
- **Registration**: Create a new account
- **Logout**: End your current session

### 2. Workout Management

- **View Workouts**: See a list of all your recorded workouts
- **Add Workout**: Record new workout sessions with details like:

  - Title
  - Description
  - Date
  - Duration (minutes)
  - Calories burned

- **Edit Workout**: Update details of existing workout records
- **Delete Workout**: Remove unwanted workout records

### 3. Settings

The Settings screen allows you to:

- Configure a custom API server URL
- Test the connection to your server
- View connection information (useful for debugging)
- Reset to default local development settings

## Offline/Server Unavailable Mode

When your app cannot connect to the backend server, it automatically switches to a fallback mode with:

- Mock data for demonstration purposes
- Basic login with the test account
- Simulated workout data

## Troubleshooting

### Can't Login

1. Check your internet connection
2. Verify the server is running (for local development)
3. Try the test account (test@example.com / password123)
4. Check the API URL in Settings

### No Workouts Displayed

1. Check if you're properly logged in
2. Try adding a new workout to see if it appears
3. Check your connection status in Settings

### Connection Error

1. If using local development:

   - Make sure your Node.js server is running (`npm run server`)
   - Check there are no errors in the server console

2. If using Vercel:

   - Verify your Vercel deployment is active
   - Check that the correct URL is set in eas.json

3. Try setting a custom URL in the Settings screen
