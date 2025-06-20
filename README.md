# Carole - AI Personal Assistant & Project Manager

A proactive AI assistant designed to learn vector databases, AI personalization, and advanced task management patterns.

## Project Overview

Carole is an AI-powered personal assistant that goes beyond reactive chat interfaces to actively manage tasks, priorities, and project workflows. The system learns user patterns and provides intelligent, contextual assistance for both personal and professional task management.

### Key Learning Goals

- **Vector Database Implementation**: Practical applications using Supabase pgvector
- **AI Agent Personalization**: Building AI that adapts to user preferences
- **Proactive AI Design**: AI that initiates conversations and provides value
- **Hybrid Data Architecture**: Combining structured and unstructured data patterns

## Tech Stack

- **Frontend**: SvelteKit + shadcn-svelte
- **Backend**: Supabase (PostgreSQL + pgvector)
- **AI**: Company LLM infrastructure (Bedrock)
- **Deployment**: Supabase hosting

## Key Features

### 🎯 Proactive Priority Management

- AI presents top 3 priorities immediately on app open
- Learns user priority patterns over time
- Handles both simple todos and complex hierarchical projects

### 🧠 Intelligent Task Management

- Natural language task creation through chat
- Automatic task breakdown and subtask suggestion
- Dependency tracking with conflict detection
- Mixed context support (work + personal)

### 💬 Conversational Interface

- Full conversation memory using vector storage
- Semantic search across all past interactions
- Rapid-fire quiz interface for quick priority setting
- Context-aware AI responses

### 🔗 Smart Dependencies

- Visual dependency relationship tracking
- Automatic priority propagation for blocking tasks
- Circular dependency detection and prevention
- Conflict resolution suggestions

## Project Structure

```
/docs/
  ├── requirements.md     # Comprehensive feature and technical requirements
  ├── project-plan.md     # Development phases and task breakdown
  └── architecture.md     # Technical architecture decisions (TBD)

/src/                     # SvelteKit application code (TBD)
/supabase/               # Database schemas and migrations (TBD)
```

## Development Phases

### Phase 1: Foundation & MVP (Weeks 1-2)

Basic task management with simple AI chat integration

### Phase 2: AI Intelligence & Vector Storage (Weeks 3-4)

Proactive AI behavior and conversation memory using pgvector

### Phase 3: Advanced Features & Dependencies (Weeks 5-6)

Complex task relationships and rapid-fire quiz interface

### Phase 4: Polish & Advanced Learning (Weeks 7-8)

Performance optimization and advanced vector database features

## Getting Started

_Development setup instructions will be added as the project progresses._

## Documentation

- **[Requirements Document](./docs/requirements.md)**: Comprehensive feature and technical requirements
- **[Project Plan](./docs/project-plan.md)**: Development phases, tasks, and timeline
- **[Development Setup](./docs/development-setup.md)**: Local development environment setup
- **[Database Schema](./docs/database-schema.md)**: Complete database design and structure
- **[User Experience Flow](./docs/user-experience-flow.md)**: User journeys and interaction patterns
- **[Decisions Summary](./docs/decisions-summary.md)**: Key architectural and design decisions
- **[Codebase Analysis](./docs/codebase-analysis.md)**: Implementation guidance from existing projects

## Learning Outcomes

This project is designed to provide hands-on experience with:

- Vector database practical applications and optimization
- AI agent personalization and behavioral learning
- Proactive AI system design patterns
- Hybrid structured/unstructured data architectures
- Real-world AI application development

## Status

**Current Phase**: Phase 1 - Foundation & MVP (In Progress)  
**Completed**:

- ✅ SvelteKit project setup with TypeScript
- ✅ 3-page application structure (Landing, Tasks, Analytics)
- ✅ Basic UI components and routing
- ✅ Priority dashboard UI with sample data
- ✅ Task browser with filtering and sample tasks
- ✅ Chat interface UI ready for AI integration

**Next Steps**:

- 🔄 Supabase setup and database schema
- 🔄 shadcn-svelte component library integration
- 🔄 AI chat functionality with LLM integration

---

_This project serves as both a practical learning exercise and a genuinely useful personal productivity tool. All development decisions reference back to the requirements document as the north star._
