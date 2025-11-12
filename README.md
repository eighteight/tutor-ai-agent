# TutorAgent

An intelligent tutoring system that evaluates student answers and provides personalized lessons using AI. The system uses Angular for the frontend and n8n with Ollama for AI-powered backend processing.

## Prerequisites (macOS/Linux)

- Node.js 16+ and npm
- Angular CLI: `npm install -g @angular/cli`
- n8n: `npm install -g n8n`
- Ollama with models: `Qwen2.5:7B` and `deepseek-r1:14b`

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with n8n credentials:
   ```
   N8N_USER=your-email
   N8N_PASSWORD=your-password
   ```
4. Import the n8n workflow:
   ```bash
   npm run n8n:import
   ```

## Running the Application

### Start Backend (n8n)
```bash
npm run n8n
```
Access n8n at `http://localhost:5678`

**Note:** n8n uses SQLite by default for data storage.

### Start Frontend (Angular)
```bash
npm start
```
Access the app at `http://localhost:4200`

## Usage

1. Navigate to the Interactive Chat
2. Answer the presented questions
3. The AI evaluates your responses and provides:
   - Personalized feedback
   - Advanced lessons (if performing well)
   - Review lessons (if struggling)
   - New questions based on your progress

## API Keys

API keys are stored in `api-keys.txt` (not tracked in git for security).
