# Carole AI Personal Assistant

**Status:** Phase 2 Complete ✅ | AI Integration Active 🤖 | Full Production Ready 🚀

A proactive AI assistant with real-time AI chat capabilities and intelligent task management. Successfully integrated with Block's internal Databricks platform and Supabase database.

## 🎯 **Current Status (Phase 2 Complete)**

### ✅ **Working Features**

**🗄️ Real Database Integration:**

- **Supabase Database**: Complete CRUD operations with real persistence
- **Task Management**: Full lifecycle from creation to completion
- **5-State Workflow**: backlog → todo → in_progress → blocked → done
- **Rich Task Data**: Tags, locations, priority (0-10), difficulty, time estimates
- **Row Level Security**: User isolation and secure data access

**🤖 Real AI Integration:**

- **Block Databricks**: Live integration with Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B
- **PAT Authentication**: Secure Personal Access Token authentication
- **Multi-Model Support**: Switch between AI models in real-time
- **Context-Aware Chat**: AI has access to your actual task data
- **Natural Language Task Creation**: "Create a task to review budget" → automatic task creation
- **Smart Suggestions**: AI-powered priority recommendations based on your tasks

**🎨 Modern UI:**

- **Beautiful Chat Interface**: Real-time messaging with typing indicators
- **Model Selection**: Dropdown to choose between AI models
- **Connection Status**: Visual indicators for database and AI connectivity
- **Priority Dashboard**: Top 3 tasks with intelligent sorting
- **Responsive Design**: BOSS UI design system with Tailwind CSS

### 🏗️ **Architecture**

- **Frontend**: SvelteKit + TypeScript
- **AI**: Block Databricks (Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: PAT tokens for Databricks, Supabase auth for database
- **Styling**: Tailwind CSS v3.4.0 + BOSS UI design system
- **Build System**: Vite + PostCSS with proxy configuration
- **Deployment**: Ready for production deployment

## 🚀 **Setup Instructions**

### Prerequisites

- Node.js 18+
- Supabase account
- Access to Block's internal Databricks platform

### Installation

```bash
git clone https://github.com/thisispete/carole.git
cd carole
npm install
```

### Configuration

1. **Supabase Setup:**

   - Create a new Supabase project
   - Copy Project URL and anon key
   - Run the SQL schema from `src/lib/database.sql`

2. **Databricks Setup:**

   - Access Block's Databricks at `https://block-lakehouse-production.cloud.databricks.com`
   - Generate a Personal Access Token (Settings → Developer → Access tokens)
   - Copy the token securely

3. **Environment Variables:**

   ```bash
   # Create .env.local with:
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_DATABRICKS_TOKEN=your-databricks-pat-token
   VITE_DATABRICKS_ENV=production
   VITE_DATABRICKS_HOST=https://block-lakehouse-production.cloud.databricks.com
   ```

4. **Start Development:**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` and start chatting with your AI assistant!

## 🤖 **Features in Action**

**Chat with AI:**

- "What should I work on today?" → Get AI-powered task prioritization
- "Create a task to review the quarterly budget" → Automatic task creation
- Switch between Claude, GPT-4o, and Llama models

**Task Management:**

- Create, edit, and complete tasks with full database persistence
- Organize with tags, priorities, and status tracking
- AI can read your tasks and provide contextual advice

## 📚 **Documentation**

- **[Databricks Setup Guide](DATABRICKS_SETUP_GUIDE.md)** - Complete AI integration setup
- **[Database Schema](DATABASE_SCHEMA_FINALIZED.md)** - Finalized table structures
- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Detailed environment setup
- **[Changelog](CHANGELOG.md)** - Development progress and changes

## 🎯 **Learning Goals Achieved**

This project successfully demonstrates:

- **Real AI Integration**: Live connection to enterprise LLM platform
- **Multi-Model AI**: Claude, GPT-4o, and Llama in production
- **Context-Aware AI**: AI assistant with access to user's actual data
- **Enterprise Authentication**: PAT tokens and secure API access
- **Full-Stack Integration**: Database + AI + Modern Frontend

## 📄 **License**

UNLICENSED - Private project for learning purposes.
