# Quick Setup Instructions

## ✅ Configuration Fixed! Ready for Development

**Latest Update (v1.1.0)**: All PostCSS and Tailwind CSS configuration issues have been resolved. The development environment is now stable and ready to use.

## 🚨 Connection Failed? You need to set up your environment variables!

The connection is failing because you haven't set up your Supabase credentials yet.

### Step 1: Create your `.env.local` file

Create a file named `.env.local` in the root directory with this content:

```env
# Supabase Configuration (Required for basic connection)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Advanced: Service Role Key (only needed for admin operations later)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Settings
NODE_ENV=development
VITE_DEV_MODE=true
```

### Step 2: Get your Supabase credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project or select an existing one
4. Go to **Settings** → **API**
5. Copy your:
   - **Project URL** (replace `https://your-project-id.supabase.co`)
   - **anon public key** (replace `your_anon_key_here`) - this is the main one you need!

**Note:** The service role key is in the same section but labeled as `service_role` `secret`. You don't need it for basic connection - only for admin operations later.

### Step 3: Restart your dev server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Set up your database (ready to deploy!)

The database schema is finalized and ready to deploy. Here's how:

**Option 1: Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `src/lib/database.sql`
4. Paste and run the SQL to create your tables

**Option 2: Quick Overview of What Gets Created**

- ✅ **Tasks table** with 0-10 priority/difficulty scales
- ✅ **Status workflow**: backlog → todo → in_progress → blocked → done
- ✅ **Array fields**: context_tags, locations (multiple location support)
- ✅ **Row Level Security** (users only see their own tasks)
- ✅ **Full-text search** and performance indexes
- ✅ **Auto-updating timestamps**

**Database Features Ready:**

- Task hierarchy (parent/child relationships)
- Flexible tagging and location arrays
- Cost estimates and time tracking
- Search optimization
- User isolation and security

---

**Current Status:** The app will show better error messages now to help you debug the connection.

Check your browser console (F12 → Console) for detailed connection information.

## ✅ Connection Working?

If you see both:

```
🔧 Supabase Config Check:
URL: ✅ Set
Key: ✅ Set
```

Then your basic connection is ready! The service role key can be added later when needed.
