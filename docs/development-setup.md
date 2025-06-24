# Development Setup Guide

**Project:** Carole AI Personal Assistant  
**Created:** 2025-06-17  
**Last Updated:** 2025-01-13  
**Status:** Phase 2 - Production Ready

---

## Prerequisites

### Required Software

- **Node.js 18+** - JavaScript runtime
- **npm or pnpm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Code editor with Svelte extensions

### External Services

- **Supabase Account** - Database and authentication
- **Company LLM Access** - Databricks AI model endpoints
- **Supabase CLI** (optional) - Database management

---

## Local Development Setup

### 1. Project Initialization

```bash
# Clone the repository
git clone <repository-url>
cd Carole

# Install dependencies
npm install

# Verify SvelteKit setup
npm run dev
# Should start on http://localhost:5174 (or 5173)
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
```

**Required Environment Variables:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Databricks AI Configuration
VITE_DATABRICKS_HOST=https://databricks.internal.block.xyz
VITE_DATABRICKS_TOKEN=your_databricks_pat_token
VITE_DATABRICKS_ENV=development  # or 'production'
VITE_DEFAULT_AI_MODEL=claude-3-5-sonnet

# Development Settings
NODE_ENV=development
```

### 3. Database Setup (Completed)

The database is already set up and configured. No additional database setup is required for development.

**Current Database Status:**

- ✅ Tasks table with complete schema
- ✅ RLS policies configured
- ✅ Indexes for performance
- ✅ Sample data available for testing

---

## Development Workflow

### Daily Development

```bash
# Start development server
npm run dev

# Run type checking
npm run check

# Run type checking in watch mode
npm run check:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Organization

```
src/
├── routes/              # SvelteKit pages
│   ├── +layout.svelte  # Main layout
│   ├── +page.svelte    # Landing page with AI chat
│   ├── tasks/          # Task management pages
│   └── analytics/      # Analytics pages
├── lib/
│   ├── components/     # Reusable UI components
│   │   ├── ChatInterface.svelte
│   │   ├── ConnectionStatus.svelte
│   │   └── boss-ui/    # BOSS UI components
│   ├── aiTaskTools.ts  # Core AI task operations
│   ├── aiToolExecutor.ts # Tool execution & intent analysis
│   ├── aiContext.ts    # AI context management
│   ├── aiEnhancedContext.ts # Advanced context features
│   ├── databricksService.ts # AI model integration
│   ├── taskService.js  # Database operations
│   ├── supabase.js     # Database connection
│   └── stores/         # Svelte stores
└── app.css             # Global styles
```

---

## Phase Status & Features

### Phase 1: Foundation ✅ **COMPLETE**

- ✅ **SvelteKit Setup**: TypeScript, routing, responsive design
- ✅ **Supabase Integration**: Database connection, CRUD operations
- ✅ **Database Schema**: Complete tasks table with relationships
- ✅ **Basic UI**: Landing page, task browser, analytics placeholder
- ✅ **Task Management**: Core task operations (create, read, update, delete)

### Phase 2: AI Task Tools ✅ **COMPLETE**

- ✅ **AI Task Tools Core**: Complete natural language task management
- ✅ **Enhanced Intent Analysis**: Semantic recognition with context awareness
- ✅ **Tool Execution System**: Robust tool orchestration with user feedback
- ✅ **AI Context System**: Rich task state awareness for intelligent decisions
- ✅ **Chat Interface**: Natural language conversations with task operations
- ✅ **Production Quality**: Cleaned debug code, proper error handling

### Phase 3: Vector Integration & Advanced Chat 🔄 **NEXT**

- Enhanced conversation memory and context
- Vector database integration for semantic search
- Advanced task clustering and similarity detection
- Improved natural language understanding

---

## Current Features

### **Natural Language Task Management**

- Create tasks: "I need to update the website by Friday"
- Update tasks: "Change the priority of the website task to 8"
- Complete tasks: "I finished my AML training"
- Query tasks: "What are my high priority tasks?"

### **Intelligent Intent Recognition**

- Context-aware semantic analysis
- Conflict prevention (completion vs creation)
- Confidence scoring and reasoning
- Multiple fallback layers

### **Rich AI Context**

- Full task state awareness
- Priority analysis and suggestions
- Blocked task detection
- Progress tracking and insights

---

## Troubleshooting

### Common Issues

**Development server won't start:**

```bash
# Clear SvelteKit cache
rm -rf .svelte-kit
npm run dev
```

**AI features not working:**

- Check Databricks token is valid and has proper permissions
- Verify VITE_DATABRICKS_HOST points to correct endpoint
- Ensure network access to Databricks (VPN if required)

**Database connection errors:**

- Verify Supabase URL and anon key are correct
- Check database is accessible and RLS policies allow access
- Confirm tasks table exists with correct schema

**TypeScript errors:**

```bash
# Sync SvelteKit types
npm run check
```

### Getting Help

- Check SvelteKit docs: https://kit.svelte.dev/
- Supabase docs: https://supabase.com/docs
- Project requirements: `docs/requirements.md`
- AI architecture: `docs/ai-task-tools-architecture.md`

---

## Next Steps

1. **Begin Phase 3:** Vector database integration and enhanced conversation memory
2. **Advanced Features:** Task clustering, dependency detection, goal coaching
3. **Performance Optimization:** Real-world usage testing and improvements

---

_This guide reflects the current production-ready state of Carole with comprehensive AI task management capabilities._
