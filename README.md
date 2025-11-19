# Quiz Game - Setup Guide

This project consists of a FastAPI backend and a React (Vite) frontend for a real-time quiz game.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Python 3.9 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)

## Quick Setup

### Windows

Run the setup script in PowerShell:

```powershell
.\setup.ps1
```

### Linux/Mac

Run the setup script in terminal:

```bash
chmod +x setup.sh
./setup.sh
```

## Manual Setup

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - **Windows (PowerShell)**: `.\venv\Scripts\Activate.ps1`
   - **Windows (CMD)**: `.\venv\Scripts\activate.bat`
   - **Linux/Mac**: `source venv/bin/activate`

3. Install Poetry:
   ```bash
   pip install poetry
   ```

4. Install backend dependencies:
   ```bash
   poetry install
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start Both Backend and Frontend

- **Windows**: `.\start.ps1`
- **Linux/Mac**: `./start.sh`

### Start Backend Only

1. Activate the virtual environment (see above)
2. Navigate to backend directory: `cd backend`
3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Start Frontend Only

1. Navigate to frontend directory: `cd frontend`
2. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
Quiz-Game/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # Pydantic models
│   │   ├── persistence.py    # State persistence
│   │   ├── quiz_loader.py    # Quiz data loader
│   │   ├── state.py          # Quiz state management
│   │   └── websocket_manager.py  # WebSocket connections
│   ├── quiz_questions.json   # Quiz data
│   └── quiz_state.json       # Persisted state
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── assets/           # Static assets
│   └── package.json          # Frontend dependencies
├── pyproject.toml            # Backend dependencies (Poetry)
├── setup.ps1                 # Windows setup script
├── setup.sh                  # Linux/Mac setup script
├── start.ps1                 # Windows start script
└── start.sh                  # Linux/Mac start script
```

## Dependencies

### Backend Dependencies (Python)

Managed by Poetry in `pyproject.toml`:

- **FastAPI** - Modern web framework for building APIs
- **Uvicorn** - ASGI server for FastAPI
- **Pydantic** - Data validation using Python type annotations
- **WebSockets** - WebSocket support for real-time communication

### Frontend Dependencies (Node.js)

Managed by npm in `frontend/package.json`:

- **React** - UI library
- **Vite** - Build tool and dev server
- **react-qr-code** - QR code generation

## Environment Variables

Create a `.env` file in the root directory to customize settings:

```env
ADMIN_TOKEN=your_admin_token_here
DEFAULT_TIME_LIMIT=0
```

## Troubleshooting

### Python Virtual Environment Issues

- **Windows PowerShell Execution Policy**: If you get an execution policy error, run:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Poetry Installation Issues

- If Poetry installation fails, try installing it globally:
  ```bash
  pip install --user poetry
  ```

### Port Already in Use

- Backend (8000): Change the port with `uvicorn app.main:app --reload --port 8001`
- Frontend (5173): Vite will automatically try the next available port

## Development

### Backend Development

- The backend uses FastAPI with auto-reload enabled during development
- API documentation is available at `http://localhost:8000/docs`

### Frontend Development

- The frontend uses Vite with Hot Module Replacement (HMR)
- Changes to React components will reflect immediately in the browser

## Building for Production

### Backend

```bash
# Activate virtual environment first
poetry build
```

### Frontend

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

