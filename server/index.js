import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '..', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// API Routes

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_runtracker_dev';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const result = stmt.run(username, hashedPassword);

    const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Run Routes ---

// Get all runs (for logged-in user)
app.get('/api/runs', authenticateToken, (req, res) => {
  try {
    const runs = db.prepare('SELECT * FROM runs WHERE user_id = ? ORDER BY date DESC').all(req.user.id);
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new run
app.post('/api/runs', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { distance } = req.body;
    const imagePath = req.file.filename;
    const date = new Date().toISOString();
    const userId = req.user.id;

    const stmt = db.prepare('INSERT INTO runs (distance, image_path, date, user_id) VALUES (?, ?, ?, ?)');
    const result = stmt.run(parseFloat(distance), imagePath, date, userId);

    const newRun = db.prepare('SELECT * FROM runs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newRun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a run
app.delete('/api/runs/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the run belongs to the logged-in user
    const run = db.prepare('SELECT * FROM runs WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!run) return res.status(404).json({ error: 'Run not found or unauthorized' });

    const stmt = db.prepare('DELETE FROM runs WHERE id = ?');
    stmt.run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes in production (SPA support)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
