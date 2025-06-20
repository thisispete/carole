# Carole AI Assistant - Key Decisions Summary

**Created:** 2025-06-17  
**Status:** Post-Review Documentation Update

---

## Major Decisions from Review Session

### 🎯 Priority Management Refinements

**Due Date Philosophy**:

- ✅ AI won't force due dates on tasks that don't naturally need them
- ✅ When due dates exist, proximity automatically boosts priority
- ✅ AI learns which task types typically need due dates vs. flexible timing

**Smart Priority Boosts**:

- ✅ Tasks affecting other people get automatic priority boost (AI detects from content)
- ✅ Healthcare appointments get high priority, "pick up meds" stays flexible
- ✅ Time-of-day context: work tasks during work hours, personal after (with exceptions)
- ✅ User sets explicit work hours for predictable context switching

### 🤖 AI Personality & Tone

**Perfect Example**: _"You've been mentioning feeling overwhelmed - want to focus on just one small win today?"_

**Core Approach**: Proactive thinking partner with friendly, optimistic energy

**Tone Guidelines**:

- Observational, not diagnostic: "I noticed..." not "You have a problem with..."
- Helpful, not prescriptive: "Want to try..." not "You should..."
- Supportive, not clinical: "Rough week?" not "You seem to be experiencing stress"

**Personalization Depth**: Super personal awareness is welcome, but maintain friendly assistant tone (not manager or therapist)

### 🎨 UI Simplification

**3-Page Desktop Web App**:

1. **Landing Page**: Top 3 priorities + chat interface
2. **Task Browser**: Dynamic project buttons + filtering + "show me all X tasks"
3. **Analytics**: Later phase or conversational through AI

**Key Features**:

- Dynamic project buttons auto-generated from task patterns
- Natural language filtering: "show me all website tasks"
- Focus on desktop-first, simple and functional

### 💾 Advanced Vector Database Features

**Pattern Recognition & Optimization**:

- ✅ Automatic project clustering from task similarity
- ✅ Dependency graph discovery and optimization suggestions
- ✅ Task sequencing optimization for time/cost savings
- ✅ Batch operation suggestions: "These 3 tasks need same research - group them?"

**Goal Coaching Integration**:

- ✅ Goal-task connection discovery using semantic similarity
- ✅ Goal pattern recognition from task clusters
- ✅ Strategic priority suggestions based on goal advancement
- ✅ Cross-goal balancing and optimization

**Learning Integration**:

- ✅ Quiz interface includes optimization suggestions with yes/no learning
- ✅ AI confidence thresholds calibrated based on user feedback
- ✅ Pattern storage for task grouping, sequencing, and efficiency improvements

### 🎯 Goal Coaching System (NEW)

**Goal Discovery**:

- ✅ Conversational goal setting: "I want to advance to senior engineer"
- ✅ Pattern recognition: "I notice lots of house tasks - create curb appeal goal?"
- ✅ Organic goal emergence from task patterns

**Goal Priority & Integration**:

- ✅ Goals have their own priority levels (High/Medium/Low)
- ✅ Goal priority influences task priority automatically
- ✅ AI factors goal advancement into daily priority suggestions

**Goal-Aware AI Behavior**:

- ✅ "You mentioned career advancement - this system design task could be valuable"
- ✅ "Three tasks this week connect to your curb appeal goal - batch them?"
- ✅ "Haven't worked on Python lately, but that's important for your goal"

**Progress Philosophy**:

- ✅ Under-the-hood progress tracking, no visual completion bars
- ✅ Conversational insights: "Great progress on curb appeal this month"
- ✅ Natural, supportive approach rather than gamified

### 🧠 Deep Personalization Boundaries

**What AI Can Learn & Mention**:

- Work patterns, energy cycles, procrastination triggers
- Emotional context and stress patterns (supportively)
- Seasonal behaviors and life context
- Communication preferences and decision patterns

**Tone Examples**:

- ✅ "You seem to do your best creative work Tuesday mornings"
- ✅ "I noticed you tend to put off phone calls - want me to group them?"
- ✅ "You usually abandon projects at the paperwork phase - break it down differently?"

---

## Development Philosophy & Approach

### 📋 **Document-Driven Development**

- **Philosophy**: Use comprehensive documentation as "north star" for all decisions
- **Approach**: Plan thoroughly, document decisions, refer back consistently
- **Benefit**: Prevents scope creep and maintains project focus

### 🎯 **MVP-First Feature Discipline**

**Explicitly Rejected Features** (to prevent future scope creep):

- Calendar integration
- Weather awareness and context
- Location-based task awareness
- Energy pattern recognition
- Over-engineering with unnecessary complexity

**Philosophy**: "Focus on core learning goals, not every possible feature. Keep it simple and focused."

### 🛠️ **Infrastructure Decision Process**

**Considered Options**:

- **Databricks**: Company infrastructure, more complex setup
- **Supabase**: Free tier, beginner-friendly, PostgreSQL + pgvector

**Decision**: Supabase chosen for learning-focused approach and ease of setup

### 🎯 **Goal Coaching Feature Evolution**

**Note**: Goal coaching system was added during planning phase as a major feature enhancement. Originally focused on task management, expanded to include proactive goal advancement coaching based on user context and aspirations.

---

## Database Design Decisions (2025-06-17)

### 🗄️ **Schema Naming & Structure**

**Priority & Difficulty Scales**:

- ✅ **Both use 0-10 integer scale** for granular AI ranking
- ✅ **Priority**: 0=none, 1-3=low, 4-6=medium, 7-8=high, 9-10=critical
- ✅ **Difficulty**: 0=trivial, 1-3=easy, 4-6=moderate, 7-8=hard, 9-10=extremely hard
- ✅ **Rationale**: Consistent scales, AI can make fine-grained distinctions, easy sorting

**Status Workflow**:

- ✅ **5-state workflow**: `'backlog', 'todo', 'in_progress', 'blocked', 'done'`
- ✅ **Rationale**: Clear separation between ideas (backlog) and actionable tasks (todo)
- ✅ **Workflow**: backlog → todo → in_progress → done (with blocked from any active state)

**Field Naming Decisions**:

- ✅ **Plural table names**: `tasks` (not `task`)
- ✅ **snake_case**: All database fields use consistent snake_case
- ✅ **`notes` → `details`**: More descriptive field name
- ✅ **`location` → `locations`**: Array for multiple location support

**Array vs Single Fields**:

- ✅ **`context_tags TEXT[]`**: Flexible tagging, defined on-the-fly
- ✅ **`locations TEXT[]`**: Multiple location support (alternatives, sequences)
- ✅ **`external_links JSONB`**: Structured link data with metadata
- ✅ **Rationale**: Maximum flexibility for AI and user input patterns

**PostgreSQL Syntax**:

- ✅ **Arrays**: `DEFAULT '{}'` (PostgreSQL array syntax)
- ✅ **JSON**: `DEFAULT '[]'` (JSON array syntax)
- ✅ **Consistent with PostgreSQL conventions**

---

## Technical Stack Confirmed

- **Frontend**: SvelteKit + shadcn-svelte
- **Backend**: Supabase (PostgreSQL + pgvector)
- **AI**: Company LLM infrastructure (Bedrock)
- **Focus**: Desktop web app, learning-driven development

---

## Documentation Status

- ✅ **requirements.md** - Updated with all refined decisions
- ✅ **project-plan.md** - Updated phases to reflect simplified UI and advanced vector features
- ✅ **README.md** - Current and accurate
- ✅ **decisions-summary.md** - This document for quick reference

**Phase 1 Progress (Updated 2025-06-17)**:

- ✅ **SvelteKit Setup Complete**: TypeScript configuration, basic project structure
- ✅ **3-Page Layout Complete**: Landing/Priority dashboard, Task browser, Analytics placeholder
- ✅ **UI Framework**: Basic responsive design, routing, sample data integration
- 🔄 **Next Steps**: Supabase integration, shadcn-svelte components, AI chat functionality

**Originally Planned Next Step**: Begin Phase 1 implementation with Supabase setup, basic task management, and simple goal pattern recognition.

---

_This summary captures the key decisions from our review session. All details are fully documented in the requirements and project plan documents._
