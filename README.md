# Carole AI Personal Assistant

**Status:** Phase 2.5 - Critical AI Fixes Needed 🚨 | Database Working ✅ | AI Integration Issues ⚠️

An AI personal assistant for intelligent task management with natural language processing. Currently has a solid foundation with working database operations, but needs critical fixes to AI execution quality before being production-ready.

## 🎯 **Current Status (Phase 2.5 - Critical AI Fixes Needed)**

### ✅ **What's Actually Working**

**🗄️ Real Database Integration:**

- **Supabase Database**: Complete CRUD operations with real persistence
- **Task Management**: Full lifecycle from creation to completion
- **5-State Workflow**: backlog → todo → in_progress → blocked → done
- **Rich Task Data**: Tags, locations, priority (0-10), difficulty, time estimates
- **Row Level Security**: User isolation and secure data access

**🛠️ AI Task Tools System (WITH CRITICAL ISSUES):**

- **Basic Task Operations**: AI can create tasks, but titles are broken (copies full prompts)
- **Intent Recognition**: AI understands commands but execution often fails
- **Status Updates**: AI claims success but database updates don't actually happen
- **Context Issues**: "Make that high priority" doesn't work - no conversation memory
- **Tool Pipeline**: Framework exists but needs quality fixes

**🤖 AI Integration (WORKING):**

- **Block Databricks**: Live integration with Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B ✅
- **Multi-Model Support**: Switch between AI models in real-time ✅
- **Natural Language Processing**: AI interprets intent well, but execution is broken ⚠️
- **Conversational Quality**: AI responses are natural and helpful ✅
- **Connection Status**: Real-time connectivity indicators ✅

**🎨 Modern UI:**

- **Beautiful Chat Interface**: Real-time messaging with typing indicators
- **Model Selection**: Dropdown to choose between AI models
- **Connection Status**: Visual indicators for database and AI connectivity
- **Priority Dashboard**: Top 3 tasks with intelligent sorting
- **Responsive Design**: BOSS UI design system with Tailwind CSS

### 🚨 **IMMEDIATE PRIORITY: Critical AI Fixes**

**Phase 2.5: Fix AI Execution Quality** - Must complete before Phase 3:

- **🔧 Title Extraction**: Fix AI copying full prompts as task titles
- **✅ Status Updates**: Make AI status changes actually update the database
- **🧠 Context Tracking**: Enable "Make that high priority" to work within conversations
- **🎯 Truthful Responses**: Stop AI from claiming success when operations fail

**Evidence**: Database operations work perfectly when called directly, but AI integration has quality issues.

**Ready for Implementation**: Complete action plan available in `docs/ai-fixes-implementation-plan.md`

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

## 🤖 **Current AI Behavior (Issues Identified)**

**What You'll Experience:**

- **"Create a task to review the quarterly budget"** → Creates task titled "create a task to review the quarterly budget" ❌
- **"Mark the website redesign task as done"** → AI says "marked as done!" but task stays "todo" ❌
- **"What should I work on today?"** → AI gives great advice based on real task data ✅
- **"Make that high priority"** → AI creates new task instead of updating previous one ❌

**Good Conversational AI:**

- **Natural Responses**: AI provides helpful, contextual responses ✅
- **Intent Recognition**: AI understands what you want to do ✅
- **Task Awareness**: AI can see and analyze your actual tasks ✅
- **Multi-Model Support**: Switch between Claude, GPT-4o, Llama ✅

**Critical Issues:**

- **Title Extraction Broken**: Copies full prompts instead of meaningful titles
- **Status Updates Fake**: Claims success but database unchanged
- **No Context Memory**: Doesn't remember "that task" from previous message
- **Truthfulness Issues**: Says operations succeeded when they failed

**Ready to Fix**: All issues identified with technical solutions in docs.

## 📚 **Documentation**

**🚨 IMMEDIATE PRIORITY:**

- **[AI Fixes Implementation Plan](docs/ai-fixes-implementation-plan.md)** - Complete action plan to fix critical issues

**Setup & Development:**

- **[Development Setup](docs/development-setup.md)** - Environment configuration with Databricks setup
- **[Database Schema](docs/database-schema.md)** - Complete database design
- **[Requirements](docs/requirements.md)** - Full feature specifications

**Complete Documentation:**

- **[Documentation Index](docs/docs-index.md)** - Full navigation of all docs

## 🎯 **Learning Goals Achieved**

This project successfully demonstrates:

- **Real AI Integration**: Live connection to enterprise LLM platform
- **Multi-Model AI**: Claude, GPT-4o, and Llama in production
- **Context-Aware AI**: AI assistant with access to user's actual data
- **Enterprise Authentication**: PAT tokens and secure API access
- **Full-Stack Integration**: Database + AI + Modern Frontend

## 📄 **License**

UNLICENSED - Private project for learning purposes.
