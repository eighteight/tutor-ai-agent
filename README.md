# TutorAgent

An intelligent tutoring system that provides personalized AI-powered education using LightRAG knowledge graphs. The system evaluates student answers, provides contextual feedback, and generates adaptive lessons based on performance.

## Architecture

### Components
- **Angular Frontend**: Course selection, content upload, and interactive chat interface
- **LightRAG Server**: Knowledge graph-based content retrieval and course management
- **n8n Workflow**: AI orchestration for evaluation and lesson generation
- **Ollama**: Local LLM inference for answer evaluation and content generation

### LightRAG Integration
LightRAG serves as the intelligent knowledge base that:
- Stores course content in a knowledge graph structure
- Retrieves contextually relevant information based on topics
- Enables semantic search and relationship mapping between concepts
- Supports dynamic course creation and content management

## Features

### Web Frontend
- **Course Browser**: View all available courses from LightRAG knowledge base
- **Content Upload**: Add new courses with structured content (Course/Topic/Content format)
- **Interactive Tutoring**: Course-specific chat with AI evaluation and adaptive lessons
- **Personalized Learning**: Retention scoring and performance-based lesson progression

### AI-Powered Tutoring
- **Answer Evaluation**: AI analyzes student responses and provides retention scores (0-1)
- **Adaptive Content**: Generates advanced lessons for high performers, review lessons for struggling students
- **Contextual Feedback**: Uses course-specific knowledge for relevant guidance
- **Dynamic Questions**: Creates follow-up questions based on student progress

## Prerequisites (macOS/Linux)

- Node.js 16+ and npm
- Python 3.8+ with pip
- Angular CLI: `npm install -g @angular/cli`
- n8n: `npm install -g n8n`
- Ollama with models: `Qwen2.5:7B` and `deepseek-r1:14b`

## Installation

### 1. Clone and Setup
```bash
git clone <repository-url>
cd tutor-agent
npm install
```

### 2. Install LightRAG Dependencies
```bash
pip3 install flask flask-cors lightrag
```

### 3. Setup n8n
Create `.env` file:
```
N8N_USER=your-email
N8N_PASSWORD=your-password
```

Import workflow:
```bash
npm run n8n:import
```

### 4. Install Ollama Models
```bash
ollama pull Qwen2.5:7B
ollama pull deepseek-r1:14b
```

## Running the Application

### 1. Start LightRAG Server
```bash
npm run lightrag
# Or restart: npm run lightrag:restart
```
Server runs on `http://127.0.0.1:8000`

### 2. Start n8n Backend
```bash
npm run n8n
```
Access n8n at `http://localhost:5678`
**Important**: Activate the "Tutoring Agent Workflow" in n8n UI

### 3. Start Angular Frontend
```bash
npm start
```
Access the app at `http://localhost:4200`

## Usage

### Adding Course Content
1. Navigate to "Upload Content" page
2. Fill in the form with structured content:
   ```
   Course: JavaScript Basics
   Topic: Variables
   
   JavaScript has three ways to declare variables: let, const, and var.
   let is block-scoped and can be reassigned...
   ```
3. Click "Upload Content" - course will appear in courses list

### Learning Experience
1. **Browse Courses**: View all available courses on the home page
2. **Select Course**: Click "Start Learning" on any course
3. **Interactive Chat**: Answer course-specific questions
4. **AI Evaluation**: Receive feedback and retention scores
5. **Adaptive Lessons**: Get advanced or review content based on performance
6. **Progress Tracking**: Continue with new questions tailored to your level

## API Endpoints

### LightRAG Server (Port 8000)
- `GET /courses` - List all available courses
- `POST /insert` - Upload new course content
- `POST /query` - Query course content for tutoring

### n8n Workflow (Port 5678)
- `POST /webhook/lesson` - Process student answers and generate lessons

## Troubleshooting

- **CORS Errors**: Ensure LightRAG server is running with flask-cors installed
- **Workflow Not Responding**: Check that n8n workflow is activated
- **Missing Models**: Verify Ollama models are installed and running
- **Database Issues**: Restart n8n if SQLite permissions cause problems

## Development

- **LightRAG Server**: `lightrag-server.py` - Flask API for knowledge management
- **n8n Workflow**: `workflow.json` - AI orchestration and evaluation logic
- **Angular App**: `src/app/` - Frontend components and services
