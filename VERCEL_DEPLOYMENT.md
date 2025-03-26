# Deploying Your Fitness App Backend to Vercel

This guide will walk you through deploying your Node.js backend to Vercel so that your Fitness App can access it from anywhere.

## Prerequisites

1. A Vercel account - Sign up at [vercel.com](https://vercel.com) if you don't have one
2. Vercel CLI - Install using `npm i -g vercel`
3. Git repository - Your project should be in a Git repository

## Deployment Steps

### 1. Prepare Your Project (Already Completed)

We've already modified your project to be Vercel-ready by:

- Adding a `vercel.json` configuration file
- Updating the server.js file to work in a serverless environment
- Adding fallback to an in-memory database when no MySQL connection is available

### 2. Deploy to Vercel

#### Option 1: Using Vercel CLI

1. Open your terminal and navigate to your project directory
2. Log in to Vercel:
   ```
   vercel login
   ```
3. Deploy your app:
   ```
   vercel
   ```
4. Follow the prompts. You'll be asked a few questions:

   - Set up and deploy? **Yes**
   - Which scope (if you have multiple)? Select your account
   - Link to existing project? **No**
   - What's your project name? **fitness-app-backend** (or any name you prefer)
   - In which directory is your code located? **./** (current directory)
   - Want to override settings? **No**

5. Vercel will deploy your app and provide you with URLs:
   - Production: https://your-project-name.vercel.app
   - Make note of this URL - you'll need it for your mobile app

#### Option 2: Using Vercel Web Interface

1. Push your code to GitHub, GitLab, or BitBucket
2. Log in to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your Git repository
5. Configure the project:
   - Framework Preset: **Other**
   - Root Directory: **./** (leave as is)
   - Build Command: leave empty
   - Output Directory: leave empty
6. Add Environment Variables:
   - Add your database credentials if you have a remote MySQL database
   - These should match the ones in your .env file
7. Click "Deploy"

### 3. Update Your Mobile App

Once deployed, you need to update your mobile app to use the Vercel URL:

1. In the app settings, set the server URL to your Vercel deployment URL:

   ```
   https://your-project-name.vercel.app
   ```

2. For EAS builds, you can set the environment variable in your `eas.json`:

   ```json
   {
     "build": {
       "preview": {
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-project-name.vercel.app"
         }
       }
     }
   }
   ```

3. Build your app again with `npm run build:preview`

## Testing Your Deployment

1. Visit your Vercel URL in a browser:
   ```
   https://your-project-name.vercel.app
   ```
2. You should see a JSON response confirming the server is running

3. Try logging in to your app - it should now connect to your Vercel-hosted backend

## Troubleshooting

- **In-Memory Database**: If you're not connecting to a real MySQL database, your app will use an in-memory database. This means:

  - Data won't persist across requests
  - Everyone will see the same data
  - You can log in with the test account: `test@example.com` / `password123`

- **API Not Found**: Make sure you're using the correct URL format:

  - Correct: `https://your-project-name.vercel.app`
  - Incorrect: `https://your-project-name.vercel.app/api` (don't include /api in the settings)

- **CORS Errors**: If you see CORS errors, verify that your Vercel deployment has the correct CORS settings. The included code should allow all origins.

## Setting Up a Real Database (Optional)

For production use, you should connect to a real database:

1. Set up a MySQL database (PlanetScale, AWS RDS, Digital Ocean, etc.)
2. Add your database credentials to Vercel environment variables:
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
   - DB_PORT

This will ensure your data persists and is available to all users of your app.
