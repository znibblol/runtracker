# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Runtracker is a full-stack web application for tracking treadmill runs and walks at home. Users can log their distance (in km), upload an image, and view a chronological list of all their activities. The app features a clean Nordic minimalist design with a focus on simplicity and elegance.

## Tech Stack

- **Frontend**: React 19 with Vite
- **Backend**: Express.js (Node.js)
- **Database**: SQLite with better-sqlite3
- **File Uploads**: Multer
- **Styling**: CSS with CSS variables for theming

## Architecture

### Backend (server/)

- `server/index.js`: Express server with API endpoints
  - `GET /api/runs`: Retrieve all runs
  - `POST /api/runs`: Create new run with image upload
  - `DELETE /api/runs/:id`: Delete a run
  - `GET /uploads/*`: Serve uploaded images
- `server/database.js`: SQLite database initialization and configuration
- Database schema:
  - `runs` table: id, distance (REAL), image_path (TEXT), date (TEXT), created_at (DATETIME)

### Frontend (client/src/)

- `App.jsx`: Main application component with state management
- `components/UploadForm.jsx`: Form for adding new runs with distance input and image upload
- `components/RunsList.jsx`: Grid display of all runs with delete functionality
- CSS files use CSS variables for consistent Nordic minimalist theming
- Vite proxy configured to forward `/api` and `/uploads` requests to backend (port 3001)

### File Structure

- `/uploads/`: Image storage (gitignored)
- `runtracker.db`: SQLite database file (gitignored)

## Key Commands

### Installation

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev

# Run backend only (port 3001)
npm run server

# Run frontend only (port 3000)
npm run client
```

### Build

```bash
# Build frontend for production
npm run build
```

### Production

```bash
# Start production server (serves API, requires built frontend)
npm start
```

## Development Notes

- Frontend runs on port 3000, backend on port 3001
- Vite dev server proxies API calls to avoid CORS issues
- Images are stored in `/uploads/` directory with unique filenames
- Dates are stored in ISO format and formatted for display
- The design uses a light color scheme with subtle shadows and clean typography
