# Fitness App

A React Native application for tracking fitness workouts with MySQL database integration.

## Features

- User Authentication (Login & Registration)
- Workout Tracking with CRUD operations
- Connect to local MySQL database

## Setup Instructions

### Prerequisites

- Node.js and npm
- MySQL server running locally
- Expo CLI

### Database Setup

1. Create a MySQL database by importing the database schema:

```bash
mysql -u root -p < database.sql
```

Alternatively, you can run the SQL commands in the `database.sql` file manually in your MySQL client.

### Backend Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the root of the project with the following variables:

```
# MySQL Connection
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=fitness_app
DB_PORT=3306

# Server Configuration
PORT=3000
```

Replace `your_mysql_username` and `your_mysql_password` with your MySQL credentials.

3. Start the backend server:

```bash
npm run server
```

### Frontend Setup

1. Update the API URL in `src/services/api.js` if you're not running on localhost or using a different port:

```javascript
// If running on physical device, use your computer's local IP instead of localhost
const API_URL = "http://localhost:3000/api";
```

2. Start the Expo development server:

```bash
npm start
```

3. Use Expo Go app on your mobile device or run in an emulator/simulator.

## Project Structure

- `server.js` - Express server for MySQL backend
- `database.sql` - SQL schema for database setup
- `src/screens` - React Native screens
- `src/context` - React Context for state management
- `src/services` - API service for backend communication
- `.env` - Environment variables for database connection

## License

MIT
# Fitness_app
