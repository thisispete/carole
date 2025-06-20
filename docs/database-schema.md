# Database Schema Design

**Project:** Carole AI Personal Assistant  
**Created:** 2025-06-17  
**Updated:** 2025-06-17  
**Status:** Ready for Implementation - Phase 1

---

## Overview

Carole uses a **hybrid data architecture** combining:

- **Structured Data**: PostgreSQL for tasks, goals, dependencies, user preferences
- **Vector Data**: pgvector for conversation memory, semantic search, and AI learning

---

## Core Tables (PostgreSQL)

### `tasks`

Primary table for all task management functionality.

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

  -- AI-Enhanced Properties (Optional)
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

  -- Search & AI
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(details, ''))
  ) STORED
);

-- Custom Types
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'blocked', 'done');
```

**Field Details:**

- **Priority Scale (0-10):**

  - 0: No priority/someday
  - 1-3: Low priority
  - 4-6: Medium priority
  - 7-8: High priority
  - 9-10: Critical/urgent

- **Difficulty Scale (0-10):**

  - 0: Trivial
  - 1-3: Easy
  - 4-6: Moderate
  - 7-8: Hard
  - 9-10: Extremely difficult

- **Status Workflow:**

  - **backlog** → Ideas/future tasks (not cluttering active todo)
  - **todo** → Ready to work on (active queue)
  - **in_progress** → Currently working
  - **blocked** → Waiting on dependency/issue
  - **done** → Completed

- **Array Fields:**
  - **context_tags**: `['work', 'urgent', 'home']`
  - **locations**: `['office', 'coffee shop']` or `['home']`

### `goals`

Goal coaching system for strategic task prioritization.

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core Properties
  title TEXT NOT NULL,
  description TEXT,
  goal_type goal_type_enum DEFAULT 'life',
  priority priority_level DEFAULT 'medium',
  status goal_status DEFAULT 'active',

  -- Goal Context
  target_date TIMESTAMPTZ,
  aspirations TEXT, -- Free-form goal context for AI

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Goal Types
CREATE TYPE goal_type_enum AS ENUM ('career', 'life', 'learning', 'abstract');
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
```

### `task_goals`

Many-to-many relationship between tasks and goals.

```sql
CREATE TABLE task_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,

  -- AI-determined relationship strength (0.0 - 1.0)
  relevance_score DECIMAL(3,2) DEFAULT 0.5,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(task_id, goal_id)
);
```

### `task_dependencies`

Task dependency tracking with conflict detection.

```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  dependent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  dependency_type dependency_type_enum DEFAULT 'blocks',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent circular dependencies
  CHECK (dependent_task_id != dependency_task_id),
  UNIQUE(dependent_task_id, dependency_task_id)
);

CREATE TYPE dependency_type_enum AS ENUM ('blocks', 'enables', 'related');
```

### `user_preferences`

AI learning and personalization data.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Work Pattern Learning
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  work_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday = 1
  timezone TEXT DEFAULT 'UTC',

  -- AI Behavior Settings
  questioning_frequency questioning_freq DEFAULT 'balanced',
  ai_confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  proactive_suggestions BOOLEAN DEFAULT true,

  -- Priority Learning Data
  priority_patterns JSONB DEFAULT '{}', -- AI-learned patterns

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE questioning_freq AS ENUM ('minimal', 'balanced', 'frequent');
```

---

## Vector Storage (pgvector)

### `conversations`

Full conversation memory with semantic search capability.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message Content
  message TEXT NOT NULL,
  message_type message_type_enum DEFAULT 'user',

  -- Context Data
  related_task_ids UUID[] DEFAULT '{}',
  related_goal_ids UUID[] DEFAULT '{}',
  context_data JSONB DEFAULT '{}',

  -- Vector Embedding (1536 dimensions for OpenAI)
  embedding vector(1536),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID, -- Group related conversation turns

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', message)
  ) STORED
);

CREATE TYPE message_type_enum AS ENUM ('user', 'assistant', 'system');
```

### `task_embeddings`

Task context embeddings for similarity search and project clustering.

```sql
CREATE TABLE task_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE UNIQUE,

  -- Combined task context embedding
  context_embedding vector(1536),

  -- Source text for embedding
  source_text TEXT NOT NULL, -- Combined title + description + notes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `goal_embeddings`

Goal context embeddings for semantic goal-task connections.

```sql
CREATE TABLE goal_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE UNIQUE,

  goal_embedding vector(1536),
  source_text TEXT NOT NULL, -- Combined goal context

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes & Performance

### Core Indexes

```sql
-- Task queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_priority_status ON tasks(priority, status);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- Vector search optimization
CREATE INDEX ON conversations USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON task_embeddings USING ivfflat (context_embedding vector_cosine_ops);
CREATE INDEX ON goal_embeddings USING ivfflat (goal_embedding vector_cosine_ops);

-- Full-text search
CREATE INDEX idx_tasks_search ON tasks USING gin(search_vector);
CREATE INDEX idx_conversations_search ON conversations USING gin(search_vector);
```

---

## Row Level Security (RLS)

### Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);
```

---

## Key Relationships

### Task Hierarchy

- Tasks can have subtasks (unlimited nesting)
- Parent-child relationship via `parent_task_id`

### Goal-Task Connections

- Many-to-many via `task_goals` table
- AI-determined relevance scoring
- Semantic similarity via vector embeddings

### Dependencies

- Tasks can depend on other tasks
- Circular dependency prevention
- Priority conflict detection

---

## Migration Strategy

### Phase 1: Core Tables

1. `tasks` - Basic task management
2. `user_preferences` - Essential settings
3. `conversations` - Chat functionality

### Phase 2: Advanced Features

4. `goals` + `task_goals` - Goal coaching
5. `task_dependencies` - Dependency tracking
6. Vector embeddings setup

### Phase 3: Optimization

7. Advanced indexes
8. Query optimization
9. Vector search tuning

---

_This schema will evolve as implementation progresses and requirements are refined._
