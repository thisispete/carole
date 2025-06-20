# Development Setup Guide

**Project:** Carole AI Personal Assistant  
**Created:** 2025-06-17  
**Status:** Phase 1 - Foundation Setup

---

## Prerequisites

### Required Software

- **Node.js 18+** - JavaScript runtime
- **npm or pnpm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Code editor with Svelte extensions

### External Services

- **Supabase Account** - Database and authentication
- **Company LLM Access** - Bedrock/Databricks credentials
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
# Should start on http://localhost:5173
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
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Service Configuration
DATABRICKS_HOST=your_databricks_host
DATABRICKS_MODEL=your_preferred_model
BEDROCK_ACCESS_KEY=your_bedrock_key

# Development Settings
NODE_ENV=development
VITE_DEV_MODE=true
```

### 3. Database Setup (Phase 1)

```bash
# Install Supabase CLI (optional)
npm install -g supabase

# Initialize Supabase locally (when ready)
supabase init
supabase start

# Run migrations (when created)
supabase db push
```

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
├── lib/
│   ├── components/      # Reusable components
│   ├── stores/         # Svelte stores for state
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript definitions
└── app.css             # Global styles
```

---

## Phase-by-Phase Setup

### Phase 1: Foundation (Current)

- ✅ SvelteKit project initialized
- ✅ Basic routing and UI structure
- 🔄 **Next:** Supabase integration
- 🔄 **Next:** shadcn-svelte component setup

### Phase 2: AI Integration (Upcoming)

- Database schema implementation
- AI chat functionality
- Vector database setup

---

## Troubleshooting

### Common Issues

**SvelteKit won't start:**

```bash
# Clear SvelteKit cache
rm -rf .svelte-kit
npm run dev
```

**TypeScript errors:**

```bash
# Sync SvelteKit types
npm run check
```

**Environment variables not loading:**

- Ensure `.env.local` exists and is properly formatted
- Restart development server after changes
- Check variable names match expected format

### Getting Help

- Check SvelteKit docs: https://kit.svelte.dev/
- Supabase docs: https://supabase.com/docs
- Project requirements: `docs/requirements.md`

---

## Next Steps

1. **Complete Phase 1:** Supabase setup and database connection
2. **Install shadcn-svelte:** UI component library integration
3. **AI Integration:** Connect to company LLM infrastructure
4. **Testing Setup:** Unit tests for core functionality

---

_This guide will be updated as each development phase progresses._
