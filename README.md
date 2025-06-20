# Carole AI Personal Assistant

**Status:** Phase 1 Complete ✅ | Phase 2 Ready to Start 🚀

A proactive AI assistant designed to learn vector databases, AI personalization, and advanced task management patterns. This is a learning project focused on building sophisticated AI-human interaction patterns.

## 🎯 **Current Status (Phase 1 Complete)**

### ✅ **Working Features**

- **Real Task Management**: Complete CRUD operations with Supabase database
- **Priority Dashboard**: Top 3 tasks with intelligent sorting (0-10 scale)
- **5-State Workflow**: backlog → todo → in_progress → blocked → done
- **Rich Task Data**: Tags, locations, priority, difficulty, time estimates
- **Beautiful UI**: Status colors, priority badges, responsive design
- **Database Integration**: Row Level Security, full-text search, performance indexes

### 🏗️ **Architecture**

- **Frontend**: SvelteKit + TypeScript
- **Database**: Supabase (PostgreSQL + pgvector ready)
- **Deployment**: Ready for Vercel/Netlify
- **Version Control**: Private repository with proper licensing

## 🚀 **Next Phase: AI Integration**

Ready to implement:

- AI chat interface with task context
- Natural language task creation
- Smart priority recommendations
- Vector database for conversation memory
- Company LLM integration (Bedrock/Databricks)

## 📋 **Quick Start**

### Prerequisites

- Node.js 18+
- Supabase account

### Setup

```bash
git clone https://github.com/thisispete/carole.git
cd carole
npm install

# Configure environment variables
cp .env.example .env.local
# Add your Supabase URL and keys

npm run dev
```

### Database Setup

1. Create Supabase project
2. Run the SQL migration from `src/lib/database.sql`
3. Temporarily disable RLS for development: `ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;`

## 📚 **Documentation**

- **[Requirements](docs/requirements.md)** - Complete feature specifications
- **[Database Schema](docs/database-schema.md)** - Finalized table structures
- **[Project Plan](docs/project-plan.md)** - Development phases and progress
- **[UX Flow](docs/user-experience-flow.md)** - Interaction patterns and decisions
- **[Development Setup](docs/development-setup.md)** - Environment configuration

## 🎯 **Learning Goals**

This project explores:

- **Vector Databases**: Semantic search and AI memory
- **AI Personalization**: Learning user patterns and preferences
- **Proactive AI**: Beyond reactive chat to intelligent assistance
- **Task Intelligence**: Context-aware priority and project management

## 📄 **License**

UNLICENSED - Private project for learning purposes.
