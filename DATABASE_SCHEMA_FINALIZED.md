# Database Schema - FINALIZED ✅

**Date:** 2025-06-17  
**Status:** Ready for Implementation

---

## 🎯 **Final Design Decisions**

### **Priority & Difficulty: 0-10 Integer Scales**

- **Priority**: 0=none, 1-3=low, 4-6=medium, 7-8=high, 9-10=critical
- **Difficulty**: 0=trivial, 1-3=easy, 4-6=moderate, 7-8=hard, 9-10=extremely hard
- **Benefits**: Granular AI ranking, consistent scales, easy sorting

### **Status: 5-State Workflow**

```sql
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'blocked', 'done');
```

- **backlog** → Ideas/future tasks (not cluttering active todo)
- **todo** → Ready to work on (active queue)
- **in_progress** → Currently working
- **blocked** → Waiting on dependency/issue
- **done** → Completed

### **Field Names & Types**

- ✅ `details` (not `notes`) - More descriptive
- ✅ `locations TEXT[]` (not `location TEXT`) - Multiple location support
- ✅ `context_tags TEXT[]` - Flexible tagging
- ✅ `external_links JSONB` - Structured link data

### **Array Syntax (PostgreSQL)**

- ✅ `TEXT[] DEFAULT '{}'` - PostgreSQL arrays
- ✅ `JSONB DEFAULT '[]'` - JSON arrays
- ✅ Consistent with PostgreSQL conventions

---

## 🚀 **Ready to Deploy**

**File:** `src/lib/database.sql` contains the complete, finalized schema

**Features Included:**

- Complete tasks table with all agreed fields
- Row Level Security (RLS) policies
- Performance indexes
- Full-text search
- Auto-updating timestamps
- Sample data (commented)

**Next Steps:**

1. Copy `src/lib/database.sql` to Supabase SQL Editor
2. Run the migration
3. Start building CRUD operations

---

## 📋 **Schema Summary**

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core Properties
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER CHECK (priority >= 0 AND priority <= 10) DEFAULT 5,
  status task_status DEFAULT 'todo',

  -- Hierarchy & Organization
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  context_tags TEXT[] DEFAULT '{}',

  -- AI-Enhanced Properties
  due_date TIMESTAMPTZ,
  cost_estimate DECIMAL(10,2),
  difficulty_level INTEGER CHECK (difficulty_level >= 0 AND difficulty_level <= 10) DEFAULT 5,
  time_estimate_hours DECIMAL(5,2),
  locations TEXT[] DEFAULT '{}',
  external_links JSONB DEFAULT '[]',
  details TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(details, ''))
  ) STORED
);
```

**All documentation updated to reflect these final decisions.**
