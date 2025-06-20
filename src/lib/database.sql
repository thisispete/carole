-- Carole Database Schema - Phase 1 Core Tables
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'blocked', 'done');

-- Core tasks table
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
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(details, ''))
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_priority_status ON tasks(priority, status);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_search ON tasks USING gin(search_vector);

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tasks
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO tasks (user_id, title, description, priority, status) VALUES
-- (auth.uid(), 'Set up database schema', 'Create the core tasks table with all necessary fields', 8, 'done'),
-- (auth.uid(), 'Build task CRUD interface', 'Create, read, update, delete operations for tasks', 9, 'in_progress'),
-- (auth.uid(), 'Integrate AI chat functionality', 'Connect the chat interface to LLM service', 6, 'todo'); 