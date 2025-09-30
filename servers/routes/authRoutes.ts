// server/routes/authRoutes.ts
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
   console.log('📝 Register endpoint hit');
  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user - name can be optional in your schema
    const result = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, current_level, target_level, native_language, created_at`,
      [name || null, email, hashedPassword]
    );

    const user = result.rows[0];
    
    // Create JWT token with user info (excluding password)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        current_level: user.current_level,
        target_level: user.target_level,
        native_language: user.native_language
      }, 
      token 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Check if user registered with Google (no password)
    if (!user.password) {
      return res.status(400).json({ error: 'This account uses Google sign-in. Please use Google to log in.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token (excluding password)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        current_level: user.current_level,
        target_level: user.target_level,
        native_language: user.native_language,
        focus_areas: user.focus_areas
      }, 
      token 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Verify token endpoint (optional but useful)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Fetch fresh user data
    const result = await pool.query(
      'SELECT id, name, email, current_level, target_level, native_language, focus_areas FROM users WHERE id = $1', 
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ valid: true, user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check
router.get('/ping', (_req, res) => {
  res.json({ message: 'Auth route working', timestamp: new Date().toISOString() });
});

// Test endpoint for debugging
router.get('/test', (_req, res) => {
  res.json({ message: 'Auth routes are connected!', timestamp: new Date().toISOString() });
});

router.get('/debug-users', async (_req, res) => {
  const result = await pool.query('SELECT id, name, email FROM users');
  res.json(result.rows);
});

export default router;