require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// Get server info for display purposes
const getServerInfo = () => {
  // For Vercel serverless environment
  if (process.env.VERCEL) {
    return {
      environment: 'Vercel',
      region: process.env.VERCEL_REGION || 'unknown'
    };
  }
  
  // For local development
  const interfaces = os.networkInterfaces();
  let ipAddress = 'localhost';
  
  // Find a non-internal IPv4 address
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((iface) => {
      if (!iface.internal && iface.family === 'IPv4') {
        ipAddress = iface.address;
      }
    });
  });
  
  return {
    environment: 'Local',
    ip: ipAddress
  };
};

// Enhanced CORS configuration
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database for demo purposes (when DB connection fails)
const inMemoryDB = {
  users: [
    { id: 1, email: 'test@example.com', password: 'password123', name: 'Test User', created_at: new Date().toISOString() }
  ],
  workouts: [
    { 
      id: 1, 
      user_id: 1, 
      title: 'Morning Run', 
      description: 'Easy 5k run', 
      workout_date: '2025-03-20', 
      duration: 30, 
      calories: 250,
      created_at: new Date().toISOString()
    },
    { 
      id: 2, 
      user_id: 1, 
      title: 'HIIT Workout', 
      description: 'High intensity interval training', 
      workout_date: '2025-03-22', 
      duration: 20, 
      calories: 300,
      created_at: new Date().toISOString()
    }
  ]
};

// Database utility function (with fallback to in-memory)
const getDbConnection = async () => {
  try {
    // Try to connect to MySQL
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test the connection
    await pool.query('SELECT 1');
    return { type: 'mysql', connection: pool };
  } catch (error) {
    console.warn('MySQL connection failed, using in-memory database:', error.message);
    return { type: 'memory', connection: inMemoryDB };
  }
};

// Test connection
app.get('/', async (req, res) => {
  try {
    const db = await getDbConnection();
    let dbStatus = 'Connected';
    let testResult = { test: 1 };
    
    if (db.type === 'mysql') {
      const [rows] = await db.connection.query('SELECT 1 as test');
      testResult = rows[0];
    } else {
      dbStatus = 'Using in-memory database (MySQL connection failed)';
    }
    
    res.json({ 
      message: `Database ${dbStatus}`, 
      data: testResult,
      server: getServerInfo(),
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      server: getServerInfo() 
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    const db = await getDbConnection();
    let user;
    
    if (db.type === 'mysql') {
      // Query for user in MySQL
      const [rows] = await db.connection.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password] // Note: In production, use password hashing
      );
      
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      user = rows[0];
    } else {
      // Query for user in memory
      user = db.connection.users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }
    
    // Don't send password to client
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    const db = await getDbConnection();
    let userId;
    
    if (db.type === 'mysql') {
      // Check if user already exists in MySQL
      const [existingUsers] = await db.connection.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }
      
      // Insert new user
      const [result] = await db.connection.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, password] // Note: In production, use password hashing
      );
      
      userId = result.insertId;
    } else {
      // Check if user already exists in memory
      const existingUser = db.connection.users.find(u => u.email === email);
      
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }
      
      // Insert new user
      userId = db.connection.users.length + 1;
      db.connection.users.push({
        id: userId,
        email,
        password,
        created_at: new Date().toISOString()
      });
    }
    
    res.status(201).json({ success: true, message: 'User registered successfully', userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Workout CRUD operations
// Create workout
app.post('/api/workouts', async (req, res) => {
  try {
    const { userId, title, description, date, duration, calories } = req.body;
    
    if (!userId || !title || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const db = await getDbConnection();
    let workoutId;
    
    if (db.type === 'mysql') {
      const [result] = await db.connection.query(
        'INSERT INTO workouts (user_id, title, description, workout_date, duration, calories) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, description, date, duration, calories]
      );
      
      workoutId = result.insertId;
    } else {
      workoutId = db.connection.workouts.length + 1;
      db.connection.workouts.push({
        id: workoutId,
        user_id: parseInt(userId),
        title,
        description,
        workout_date: date,
        duration: duration ? parseInt(duration) : null,
        calories: calories ? parseInt(calories) : null,
        created_at: new Date().toISOString()
      });
    }
    
    res.status(201).json({ success: true, message: 'Workout added successfully', workoutId });
  } catch (error) {
    console.error('Error adding workout:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all workouts for a user
app.get('/api/workouts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const db = await getDbConnection();
    let workouts;
    
    if (db.type === 'mysql') {
      const [rows] = await db.connection.query(
        'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC', 
        [userId]
      );
      workouts = rows;
    } else {
      workouts = db.connection.workouts
        .filter(w => w.user_id == userId)
        .sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date));
    }
    
    res.json({ success: true, workouts });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update workout
app.put('/api/workouts/:id', async (req, res) => {
  try {
    const workoutId = req.params.id;
    const { title, description, date, duration, calories } = req.body;
    const db = await getDbConnection();
    
    if (db.type === 'mysql') {
      await db.connection.query(
        'UPDATE workouts SET title = ?, description = ?, workout_date = ?, duration = ?, calories = ? WHERE id = ?',
        [title, description, date, duration, calories, workoutId]
      );
    } else {
      const index = db.connection.workouts.findIndex(w => w.id == workoutId);
      if (index !== -1) {
        db.connection.workouts[index] = {
          ...db.connection.workouts[index],
          title,
          description,
          workout_date: date,
          duration: duration ? parseInt(duration) : null,
          calories: calories ? parseInt(calories) : null
        };
      } else {
        return res.status(404).json({ success: false, message: 'Workout not found' });
      }
    }
    
    res.json({ success: true, message: 'Workout updated successfully' });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete workout
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    const workoutId = req.params.id;
    const db = await getDbConnection();
    
    if (db.type === 'mysql') {
      await db.connection.query('DELETE FROM workouts WHERE id = ?', [workoutId]);
    } else {
      const initialLength = db.connection.workouts.length;
      db.connection.workouts = db.connection.workouts.filter(w => w.id != workoutId);
      
      if (db.connection.workouts.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Workout not found' });
      }
    }
    
    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add debug endpoint for connection testing
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API is running correctly',
    serverTime: new Date().toISOString(),
    remoteAddress: req.ip,
    serverInfo: getServerInfo(),
    usingVercel: !!process.env.VERCEL
  });
});

// For local development
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    const serverInfo = getServerInfo();
    console.log(`Server running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://${serverInfo.ip}:${PORT}`);
    console.log(`For Android emulator: http://10.0.2.2:${PORT}`);
  });
}

// Export for Vercel serverless function
module.exports = app; 
}); 