import express from 'express';
import cors from 'cors';
import multer from 'multer';
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

// Get all runs
app.get('/api/runs', (req, res) => {
  try {
    const runs = db.prepare('SELECT * FROM runs ORDER BY date DESC').all();
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new run
app.post('/api/runs', upload.single('image'), (req, res) => {
  try {
    const { distance } = req.body;
    const imagePath = req.file.filename;
    const date = new Date().toISOString();

    const stmt = db.prepare('INSERT INTO runs (distance, image_path, date) VALUES (?, ?, ?)');
    const result = stmt.run(parseFloat(distance), imagePath, date);

    const newRun = db.prepare('SELECT * FROM runs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newRun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a run
app.delete('/api/runs/:id', (req, res) => {
  try {
    const { id } = req.params;
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
