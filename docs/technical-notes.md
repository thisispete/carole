# Technical Notes & Configuration

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

## AI Task Tools Architecture (Phase 2 - Upcoming)

### Overview

The next major implementation phase focuses on giving the AI comprehensive task management capabilities through a robust tool system.

**Key Components:**

- **AI Task Tools Interface**: Functions the AI can call to manage tasks
- **Tool Execution Engine**: Orchestrates AI tool calls with user feedback
- **Intent Recognition**: Maps natural language to specific task operations
- **Task Intelligence**: Advanced analysis and optimization capabilities
- **AI Context System**: Rich awareness of all task data and patterns

**Implementation Files** (Phase 2):

```
src/lib/
├── aiTaskTools.ts         # Core AI tool functions
├── aiToolExecutor.ts      # Tool execution engine
├── intentRecognizer.ts    # Natural language intent parsing
├── taskIntelligence.ts    # Task analysis and optimization
├── aiContext.ts           # Rich AI context system
└── databricksService.ts   # Enhanced with tool calling
```

**Expected Capabilities:**

- "Mark the website task as done" → AI finds task and updates status
- "What should I work on?" → AI analyzes all tasks and suggests priorities
- "I'm working on the database" → AI updates task status to in_progress
- AI proactively suggests task optimizations and patterns

**Technical Documentation**: See `docs/ai-task-tools-architecture.md` for complete specifications.

## Build System

### Dependencies (Current)

- **SvelteKit**: v2.21.5
- **Tailwind CSS**: v3.4.0 (stable)
- **Vite**: v6.3.5
- **TypeScript**: v5.8.3
- **Supabase**: v2.50.0

### Development Environment

- **Node.js**: 18+ required
- **Package Manager**: npm
- **Development Server**: `http://localhost:5173`
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`

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

### Supabase Setup

- **Connection**: Environment variables in `.env.local`
- **Security**: Row Level Security enabled
- **Schema**: Defined in `src/lib/database.sql`
- **Client**: `@supabase/supabase-js` v2.50.0

### Required Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Known Issues & Solutions

### Issue: PostCSS/Tailwind v4 Compatibility

- **Status**: ✅ Resolved
- **Solution**: Downgrade to v3.4.0

### Issue: SASS Import Path Resolution

- **Status**: ✅ Resolved
- **Solution**: Removed global import from Vite config

### Issue: Development Server Stability

- **Status**: ✅ Resolved
- **Solution**: Simplified configuration stack

## Future Considerations

### Tailwind CSS v4 Migration

When Tailwind v4 becomes stable:

1. Update to latest v4 stable release
2. Install `@tailwindcss/postcss` plugin
3. Update PostCSS configuration
4. Test all utility classes
5. Update documentation

### Performance Optimizations

- Consider PurgeCSS for production builds
- Optimize bundle size with tree-shaking
- Implement CSS-in-JS for component styles if needed

## Troubleshooting

### Common Issues

1. **"Can't find stylesheet to import"**: Check SASS import paths
2. **"Unknown at rule @tailwind"**: Ensure PostCSS is configured
3. **"Utility class not found"**: Verify Tailwind content paths
4. **Server won't start**: Check for syntax errors in config files

### Debug Commands

```bash
# Check PostCSS configuration
npx postcss --version

# Verify Tailwind config
npx tailwindcss --help

# Test development server
npm run dev -- --debug
```
