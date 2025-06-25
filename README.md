# Carole AI Personal Assistant

**Status:** Phase 2.8 - Production Ready Core with UI Improvements in Progress

An intelligent AI personal assistant for natural language task management. Chat with your AI assistant to create, update, and organize tasks using conversational language. Built with SvelteKit, Supabase, and Block's internal Databricks AI platform.

## 🎯 **What Carole Does**

**Natural Language Task Management:**

- **"Create a task to review the quarterly budget"** → AI creates task with appropriate priority
- **"Mark the website redesign task as done"** → AI finds and completes the matching task
- **"What should I work on today?"** → AI analyzes your tasks and provides personalized recommendations
- **"Make that high priority"** → AI updates the previously mentioned task

**Smart Features:**

- **Proactive Priority Dashboard**: See your top 3 most important tasks immediately on app open
- **Multi-Model AI**: Choose between Claude 3.5 Sonnet, GPT-4o, and Llama 3.1 405B
- **Real-Time Connectivity**: Visual indicators for database and AI service status
- **Rich Task Data**: Priority levels, difficulty estimates, tags, locations, due dates
- **5-State Workflow**: backlog → todo → in_progress → blocked → done

## 🚀 **Quick Start**

### Prerequisites

- **Node.js 18+** and npm
- **Supabase account** (free tier works)
- **Access to Block's Databricks platform** (internal AI models)

### Installation

```bash
git clone <repository-url>
cd carole
npm install
cp .env.example .env.local
# Configure environment variables (see below)
npm run dev
```

Visit `http://localhost:5173` and start chatting with your AI assistant!

### Environment Configuration

Create `.env.local` with these required variables:

```env
# Supabase Database (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Block Databricks AI (required for AI features)
VITE_DATABRICKS_HOST=https://block-lakehouse-production.cloud.databricks.com
VITE_DATABRICKS_TOKEN=your_databricks_pat_token
VITE_DATABRICKS_ENV=production
VITE_DEFAULT_AI_MODEL=claude-3-5-sonnet

# Development
NODE_ENV=development
```

### Database Setup

1. **Create Supabase Project**: Sign up at [supabase.com](https://supabase.com)
2. **Copy Project Credentials**: Get your Project URL and anon key from Settings → API
3. **Run Database Schema**: Execute the SQL from `src/lib/database.sql` in your Supabase SQL editor
4. **Verify Connection**: The app will show database connectivity status

### Databricks AI Setup (Block Internal)

1. **Access Databricks**: Go to `https://block-lakehouse-production.cloud.databricks.com`
2. **Generate PAT Token**:
   - Click your username → Settings → Developer → Access tokens → Generate new token
   - Comment: "Carole AI Assistant"
   - Copy the token securely
3. **Add to Environment**: Set `VITE_DATABRICKS_TOKEN=dapi-your-token-here`

**Available Models:**

- **Claude 3.5 Sonnet**: Best for complex reasoning and task analysis
- **GPT-4o**: OpenAI's multimodal capabilities
- **Llama 3.1 405B**: Meta's largest open model

## 🏗️ **Architecture Overview**

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: Block Databricks (Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B)
- **Authentication**: PAT tokens for Databricks, Supabase auth for database
- **Build**: Vite with proxy configuration for seamless development

**Key Components:**

- **AI Task Tools**: Natural language task operations with semantic intent recognition
- **Chat Interface**: Real-time conversational UI with typing indicators
- **Task Service**: Complete CRUD operations with database persistence
- **AI Context System**: Rich task state awareness for intelligent responses

## 📊 **Current Status & Roadmap**

### ✅ **What's Working (Production Ready)**

- **✅ Database Integration**: Complete CRUD with Supabase PostgreSQL
- **✅ AI Integration**: Live connection to Block's Databricks with all models
- **✅ Natural Language Processing**: AI understands and executes task commands
- **✅ Task Management**: Full lifecycle from creation to completion
- **✅ Modern UI**: Beautiful chat interface with real-time updates
- **✅ Connection Monitoring**: Real-time status indicators for all services

### 🚧 **Current Development (Phase 2.8)**

- **Enhanced Task UI**: Interactive task detail modals with auto-save
- **Better Task Filtering**: Improved task browsing and organization
- **UI Polish**: Component refinements and user experience improvements

### 🔄 **Next Up (Phase 3)**

- **Vector Integration**: Conversation memory and semantic search with pgvector
- **Advanced Context**: Long-term learning and pattern recognition
- **Proactive Insights**: AI-driven task analysis and optimization suggestions

## 🛠️ **Development**

### Daily Workflow

```bash
# Start development server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Test Databricks connectivity
node test-connection-monitor.js
```

### Project Structure

```
src/
├── routes/                    # SvelteKit pages
│   ├── +layout.svelte        # Main layout with navigation
│   ├── +page.svelte          # Landing page with AI chat
│   ├── tasks/+page.svelte    # Task management interface
│   └── analytics/+page.svelte # Analytics (placeholder)
├── lib/
│   ├── components/           # UI components
│   │   ├── ChatInterface.svelte
│   │   ├── ConnectionStatus.svelte
│   │   ├── task/            # Task-specific components
│   │   ├── ui/              # Reusable UI components
│   │   └── boss-ui/         # BOSS design system
│   ├── aiTaskTools.ts       # Core AI task operations
│   ├── aiToolExecutor.ts    # AI tool execution engine
│   ├── aiContext.ts         # AI context management
│   ├── databricksService.ts # AI model integration
│   ├── taskService.js       # Database operations
│   └── supabase.js          # Database connection
└── styles/                   # Global styling and design system
```

### Database Schema Overview

**Tasks Table** - Core task storage:

- **Identity**: `id`, `user_id`, `title`, `description`
- **Organization**: `priority` (0-10), `status` (5-state workflow), `tags`, `locations`
- **AI Features**: `difficulty` (0-10), `time_estimate`, `due_date`
- **Relationships**: `parent_task_id` for subtasks
- **Search**: Full-text search with `tsvector`

**Status Workflow**: `backlog` → `todo` → `in_progress` → `blocked` → `done`

## 🧪 **Testing & Development**

### Connection Testing

```bash
# Test AI connectivity
node test-connection-monitor.js

# Run with custom parameters
node test-connection-monitor.js --iterations 50 --delay 2000
```

### Common Issues

**"Databricks service temporarily unavailable"**

- Check your PAT token in `.env.local`
- Verify your network connection to Block's internal systems
- Use the connection monitor to test service health

**Database connection errors**

- Verify Supabase credentials in `.env.local`
- Check your Supabase project is active
- Ensure RLS policies are properly configured

## 📚 **Documentation**

- **Setup Guide**: Complete environment setup and troubleshooting
- **Database Schema**: Full PostgreSQL schema with relationships
- **API Documentation**: Databricks integration and task service APIs
- **Development Notes**: Architecture decisions and implementation patterns

## 🎯 **Learning Goals Demonstrated**

This project showcases:

- **Enterprise AI Integration**: Production LLM platform integration with PAT authentication
- **Multi-Model AI**: Real-time switching between Claude, GPT-4o, and Llama models
- **Semantic Intent Recognition**: AI-powered command interpretation and tool execution
- **Full-Stack TypeScript**: SvelteKit frontend with comprehensive type safety
- **Modern Database Patterns**: PostgreSQL with Row Level Security and vector preparation
- **Real-Time UI**: Conversational interface with live status indicators

## 📄 **License**

UNLICENSED - Private project for learning and development purposes.

---

_Built with ❤️ for intelligent task management_
