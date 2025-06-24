# Technical Notes & Configuration

**Last Updated:** 2025-01-13  
**Current Status:** Phase 2 Implementation Complete

## Configuration History & Fixes

### Tailwind CSS Configuration (v1.1.0 - December 2024)

**Issue**: PostCSS preprocessing errors with Tailwind CSS v4.1.10

- Error: "PostCSS plugin has moved to a separate package"
- Problem: Tailwind v4 requires `@tailwindcss/postcss` plugin
- Additional issue: SASS import path resolution in Vite

**Solution Applied**:

1. **Downgraded Tailwind CSS**: v4.1.10 → v3.4.0 for stability
2. **Simplified PostCSS config**: Direct `tailwindcss` import
3. **Removed problematic SASS imports**: Eliminated global import causing path issues
4. **Cleaned dependencies**: Removed unused `@tailwindcss/postcss`

**Current Working Configuration**:

```javascript
// postcss.config.js
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwindcss, autoprefixer],
};
```

```javascript
// tailwind.config.js
export default {
  content: ["./src/**/*.{html,js,svelte,ts}", "./src/app.html"],
  theme: {
    extend: {
      colors: {
        boss: {
          /* BOSS UI colors */
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
```

```javascript
// vite.config.js (simplified)
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
});
```

## AI Task Tools Architecture (Phase 2 - ✅ COMPLETE)

### Overview

The AI Task Tools system has been fully implemented, giving the AI comprehensive task management capabilities through a robust tool system with enhanced intent recognition.

**Key Components Implemented:**

- ✅ **AI Task Tools Interface**: Complete set of functions the AI can call to manage tasks
- ✅ **Tool Execution Engine**: Robust orchestration of AI tool calls with user feedback
- ✅ **Enhanced Intent Recognition**: Semantic analysis preventing creation/completion conflicts
- ✅ **Task Intelligence**: Analysis and optimization capabilities with context awareness
- ✅ **AI Context System**: Rich awareness of all task data, patterns, and recent activity

**Implementation Files** (Phase 2 Complete):

```
src/lib/
├── aiTaskTools.ts         # ✅ Core AI tool functions
├── aiToolExecutor.ts      # ✅ Tool execution engine with enhanced intent analysis
├── aiContext.ts           # ✅ Basic AI context system
├── aiEnhancedContext.ts   # ✅ Advanced organizational and temporal context
├── databricksService.ts   # ✅ Enhanced with tool calling capabilities
├── taskService.js         # ✅ Database operations (cleaned of debug functions)
└── supabase.js           # ✅ Database connection (production ready)
```

**Current Capabilities:**

- ✅ "I finished my AML training" → AI correctly identifies completion intent and offers to mark done
- ✅ "What should I work on?" → AI analyzes all tasks and suggests priorities
- ✅ "I need to update the website by Friday" → AI creates task with appropriate priority and due date
- ✅ "Change the priority to 8" → AI updates task priority with confirmation
- ✅ Context-aware task suggestions based on current state and patterns

**Recent Quality Improvements (2025-01-13):**

- ✅ **Production Code Quality**: Removed all debug functions, test files, and development utilities
- ✅ **Enhanced Intent Analysis**: Semantic recognition prevents "I finished X" creating new tasks
- ✅ **Robust Error Handling**: Comprehensive error handling and user feedback
- ✅ **Clean Logging**: Reduced excessive debug output, professional logging levels

**Stability & Reliability Improvements (2025-01-13):**

- ✅ **Retry Logic**: 3-attempt retry system with exponential backoff for service calls
- ✅ **Connection Monitoring**: Response time tracking and detailed error categorization
- ✅ **Smart Error Handling**: Automatic retries on 5xx errors and rate limiting (429)
- ✅ **Enhanced Status Reporting**: Detailed connection diagnostics with timing metrics
- ✅ **Environment Stability**: Consistent production mode configuration validation

**Technical Documentation**: See `docs/ai-task-tools-architecture.md` for complete specifications.

### Next Phase: Vector Integration

Phase 3 will focus on:

- Vector database (pgvector) for semantic search
- Enhanced conversation memory with embeddings
- Advanced task clustering using semantic similarity
- Project detection through vector analysis

## Build System

### Dependencies (Current)

- **SvelteKit**: v2.x (latest stable)
- **Tailwind CSS**: v3.4.0 (stable)
- **Vite**: v6.x
- **TypeScript**: v5.x
- **Supabase**: v2.x

### Development Environment

- **Node.js**: 18+ required
- **Package Manager**: npm
- **Development Server**: `http://localhost:5174` (or 5173)
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`

### Environment Variables (Updated)

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

## Styling Architecture

### BOSS UI Integration

- **Design System**: Custom CSS variables for consistent theming
- **Components**: Reusable component classes (`.boss-button`, `.boss-card`, etc.)
- **Color Tokens**: Defined in `src/app.css` and `tailwind.config.js`
- **Typography**: Inter font with system fallbacks

### CSS Structure

```
src/
├── app.css          # Main CSS with Tailwind imports + BOSS UI
├── app.scss         # SCSS utilities (optional)
└── styles/          # Modular SCSS files
    ├── utilities.scss
    ├── components.scss
    ├── layout.scss
    └── boss-ui-bridge.scss
```

## Database Configuration

### Supabase Setup (Production Ready)

- **Connection**: Environment variables in `.env.local`
- **Security**: Row Level Security enabled
- **Schema**: Complete tasks table with all fields
- **Client**: `@supabase/supabase-js` v2.x
- **Status**: ✅ Production ready with real data

### Database Schema Status

- ✅ **Tasks Table**: Complete with priority, difficulty, status, tags, locations
- ✅ **Indexes**: Performance indexes on priority, status, created_at
- ✅ **RLS Policies**: Row Level Security properly configured
- ✅ **Real Data**: Working with actual task data (no more mock/test data)

## Debugging & Monitoring Tools

### Connection Monitor Script

A diagnostic tool for testing Databricks service reliability:

```bash
# Test 10 times with 2s intervals (default)
node test-connection-monitor.js

# Custom parameters: iterations and delay
node test-connection-monitor.js 20 1000  # 20 tests, 1s apart
node test-connection-monitor.js 5 5000   # 5 tests, 5s apart
```

**Features:**

- Response time tracking
- Success rate calculation
- Error categorization (503, 429, 5xx, network)
- Detailed timing metrics

**Use Cases:**

- Debugging intermittent connection issues
- Monitoring service health during development
- Identifying optimal retry timing
- Baseline performance measurement

### Enhanced Logging

Production logging now includes:

- Environment configuration verification on startup
- Response time tracking for all service calls
- Detailed error categorization with HTTP status codes
- Retry attempt tracking with backoff timing

## Known Issues & Solutions

### Issue: PostCSS/Tailwind v4 Compatibility

- **Status**: ✅ Resolved
- **Solution**: Downgrade to v3.4.0

### Issue: SASS Import Path Resolution

- **Status**: ✅ Resolved
- **Solution**: Removed global import from Vite config

### Issue: Intermittent Databricks Service Unavailability

- **Status**: ✅ Resolved
- **Solution**: Implemented retry logic with exponential backoff
- **Details**: 3-attempt retries for 5xx errors, smart rate limit handling
- **Monitoring**: Connection monitor script for ongoing health checks

### Issue: Development Server Stability

- **Status**: ✅ Resolved
- **Solution**: Simplified configuration stack

### Issue: AI Intent Recognition Conflicts

- **Status**: ✅ Resolved (2025-01-13)
- **Solution**: Enhanced semantic intent analysis with priority-based processing

## Production Readiness Status

### Code Quality ✅

- ✅ **Clean Codebase**: Removed all debug functions and test files
- ✅ **Error Handling**: Comprehensive error handling throughout
- ✅ **Logging**: Production-appropriate logging levels
- ✅ **Type Safety**: Full TypeScript implementation

### Security ✅

- ✅ **Environment Variables**: Proper VITE\_ prefixing for client-side variables
- ✅ **Database Security**: RLS policies implemented
- ✅ **API Security**: Databricks token properly secured

### Performance ✅

- ✅ **Database Queries**: Optimized with proper indexes
- ✅ **Bundle Size**: Clean dependencies, no unused packages
- ✅ **Load Times**: Fast task loading and AI responses

## Future Considerations

### Phase 3: Vector Database Integration

Next major upgrade will include:

- pgvector extension setup in Supabase
- Embedding generation for tasks and conversations
- Semantic search capabilities
- Advanced conversation memory

### Performance Optimizations

- Consider lazy loading for large task lists
- Implement caching for frequent AI context queries
- Optimize embedding generation and storage

## Troubleshooting

### Common Issues

1. **AI features not working**: Check Databricks token and host configuration
2. **Database connection errors**: Verify Supabase URL and anon key
3. **"Unknown at rule @tailwind"**: Ensure PostCSS is configured
4. **TypeScript errors**: Run `npm run check` to verify types

### Debug Commands

```bash
# Check environment variables
npm run dev  # Should show any missing variables

# Type checking
npm run check

# Build verification
npm run build
```
