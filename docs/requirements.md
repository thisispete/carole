# AI Personal Assistant/Project Manager - Requirements Document

**Project Name:** Carole (AI Personal Assistant)  
**Created:** 2025-06-17  
**Last Updated:** 2025-06-17 (Post-Review)  
**Status:** Planning Phase

---

## 1. Project Overview & Goals

### Vision Statement
Create a proactive AI personal assistant that goes beyond reactive chat interfaces to actively manage tasks, priorities, and project workflows. The system should learn user patterns and provide intelligent, contextual assistance for both personal and professional task management.

### Primary Learning Objectives
- **Vector Database Implementation**: Learn practical applications of vector databases for conversation memory and context retrieval
- **AI Agent Personalization**: Develop AI behavior that adapts to user preferences and work patterns
- **Proactive AI Design**: Build AI that initiates conversations and provides value without explicit prompts
- **Hybrid Data Architecture**: Implement both structured and unstructured data storage patterns

### Success Criteria
- [ ] AI proactively presents top 3 priorities immediately on app open
- [ ] System handles both simple tasks ("buy dog food") and complex hierarchical projects
- [ ] Full conversation history preserved and searchable via vector database
- [ ] AI learns and adapts to user's priority preferences over time
- [ ] Dependency tracking works correctly (high priority task A depends on low priority task X)
- [ ] Personal use case: User finds it genuinely useful for daily task management

---

## 2. User Stories & Use Cases

### Core User Workflows

#### Daily Priority Management
**As a user, I want to:**
- Open the app and immediately see my top 3 most important tasks
- Have the AI understand time sensitivity vs. importance
- Get prompted with clarifying questions when priorities are unclear
- See different views: "top priorities" vs. "all tasks"

#### Task Creation & Management
**As a user, I want to:**
- Tell the AI about new tasks through natural conversation
- Create both simple todos and complex multi-step projects
- Have the AI break down large projects into manageable subtasks
- Update task status by mentioning completion in conversation

#### Proactive AI Assistance
**As a user, I want the AI to:**
- Ask me clarifying questions about vague or incomplete tasks
- Remind me about dependencies ("Task A can't start until Task X is done")
- Suggest priority adjustments based on deadlines and dependencies
- Learn my work patterns and adapt its questioning style

#### Context & Memory
**As a user, I want:**
- The AI to remember every conversation and task detail
- Semantic search across all past projects and tasks
- The AI to reference similar past projects when planning new ones
- Full context preservation across sessions

### Edge Cases & Error Handling
- What happens when dependencies create circular loops?
- How to handle conflicting priority signals?
- What if the AI can't determine priority from available information?
- How to handle tasks that change scope significantly?

---

## 3. Functional Requirements

### 3.1 Task Management System

#### Task Hierarchy
- **Atomic Tasks**: Simple, single-action items ("buy dog food", "book flight")
- **Project Tasks**: Multi-step items with subtasks ("build website" → "create landing page" → "localize to 3 regions")
- **Unlimited Nesting**: Tasks can have subtasks at any depth
- **Mixed Context Support**: Work and personal tasks in same system

#### Task Properties
- **Title & Description**: Natural language task definition
- **Priority Level**: High/Medium/Low with AI-suggested adjustments
- **Status**: Not Started, In Progress, Blocked, Completed
- **Parent Task**: Reference to parent task (for subtasks)
- **Dependencies**: Task A depends on Task B completion
- **Context Tags**: Work, Personal, Shopping, etc.
- **Due Dates**: Optional - AI won't force due dates on tasks that don't need them

#### Optional Enhanced Properties (AI-driven)
- **Links**: JSON array of any external links (GitHub, Asana, Jira, docs, etc.)
- **Cost Estimate**: Decimal value for budget planning
- **Difficulty Level**: 1-5 scale for complexity assessment
- **Time Estimate**: Hours for effort planning
- **Location**: Physical location context ("kitchen", "SF office", "home")
- **Notes**: Rich text for requirements, details, context, resources

#### AI-Driven Field Population
- AI suggests adding enhanced properties when they help with priority refinement, dependency creation, or task optimization
- Fields remain optional unless they provide strategic value
- Example: "This seems expensive - what's the cost estimate so I can factor that in?"

#### Smart Priority Logic
- **Due Date Philosophy**: Some tasks naturally have due dates, others don't - AI shouldn't force due dates
- **Time-based Adjustments**: When due dates exist, proximity automatically boosts priority
- **Time-of-Day Context**: Work tasks prioritized during work hours, personal after hours
- **External Dependencies**: Tasks affecting other people get automatic priority boost
- **Healthcare Priority**: Doctor appointments get high priority boost, "pick up meds" remains flexible
- **People Detection**: AI analyzes task content to determine if others are involved (no manual tagging)
- **Work Hours**: User sets explicit work hours for context-aware suggestions

### 3.1.1 Goal Coaching System

#### Goal Types & Structure
- **Career Goals**: Professional advancement, skill development, networking objectives
- **Life Goals**: Home improvement, health, relationships, personal development
- **Learning Goals**: Skill acquisition, education, knowledge building
- **Abstract Goals**: High-level aspirations that connect to multiple concrete tasks

#### Goal Discovery & Creation
- **Conversational Goal Setting**: Natural language goal creation through chat
- **Pattern Recognition**: AI identifies task clusters and suggests goal formalization
- **Example**: "I notice you have a lot of tasks relating to sprucing up the house - should we create a 'curb appeal' goal?"
- **Organic Emergence**: Goals can emerge from task patterns rather than explicit planning

#### Goal Priority System
- **Independent Goal Priorities**: Goals have their own High/Medium/Low priority levels
- **Goal-Task Priority Influence**: High-priority goal tasks receive automatic priority boosts
- **Strategic Task Prioritization**: AI factors goal advancement into daily priority suggestions
- **Cross-Goal Balancing**: AI helps balance competing goals based on their relative priorities

#### Goal Progress & Analytics
- **Under-the-Hood Tracking**: AI monitors goal progress through task completion patterns
- **Conversational Insights**: "You've made great progress on your curb appeal goal this month"
- **No Visual Completion Bars**: Keep progress tracking natural, not gamified
- **Pattern Recognition**: AI identifies which tasks most effectively advance specific goals
- **Future Analytics Option**: Visual progress tracking available later if desired

#### Goal-Aware AI Behavior
- **Proactive Goal Coaching**: "You mentioned wanting to advance your career - this system design task could be really valuable"
- **Opportunity Identification**: AI suggests new tasks that advance existing goals
- **Goal Connection**: "Three tasks this week connect to your curb appeal goal - want to batch them?"
- **Goal Maintenance**: "You haven't worked on Python learning lately, but that's important for your senior engineer goal"
- **Strategic Guidance**: AI prioritizes goal-advancing work over routine tasks when appropriate

#### Dependency Management
- **Dependency Tracking**: Visual representation of task relationships
- **Conflict Detection**: Alert when high-priority task depends on low-priority blocker
- **Automatic Priority Propagation**: Suggest priority increases for blocking tasks
- **Circular Dependency Detection**: Prevent and alert on circular dependencies

### 3.2 AI Behavior System

#### AI Personality & Tone
- **Core Approach**: Proactive thinking partner with friendly, optimistic energy
- **Tone Guidelines**:
  - Observational, not diagnostic: "I noticed..." not "You have a problem with..."
  - Helpful, not prescriptive: "Want to try..." not "You should..."
  - Supportive, not clinical: "Rough week?" not "You seem to be experiencing stress"
- **Perfect Example**: "You've been mentioning feeling overwhelmed - want to focus on just one small win today?"
- **Avoid**: Judgmental, pushy, antagonistic, or manager-like language

#### Proactive Questioning
- **Priority Clarification**: "Which is more important: Task A or Task B?"
- **Detail Gathering**: "What are the specific steps needed for this project?"
- **Dependency Discovery**: "Does this task depend on anything else being completed first?"
- **Context Clarification**: "Is this work-related or personal?"
- **Optimization Suggestions**: "These 3 tasks all need the same research - group them together?"

#### Learning & Adaptation
- **Deep Personal Pattern Recognition**: Work style, decision patterns, procrastination triggers, energy cycles
- **Priority Pattern Learning**: Time-based adjustments, context matching, dependency priorities
- **Questioning Style Adaptation**: Adjust communication style based on user responses
- **Context Awareness**: Remember user's work patterns, seasonal behaviors, stress responses
- **Suggestion Improvement**: Learn from quiz responses to calibrate confidence thresholds

#### Response Modes
- **Chat Mode**: Natural conversation for task updates and questions
- **Priority Mode**: Focus on ranking and organizing tasks
- **Questioning Mode**: Rapid-fire clarification sessions including optimization suggestions
- **Analysis Mode**: Review patterns and suggest improvements

### 3.3 User Interface Requirements

#### Simple 3-Page Desktop Web App
- **Page 1: Landing/Priority Dashboard** - Top 3 priorities + chat interface
- **Page 2: Task Browser** - Dynamic project filtering and task management
- **Page 3: Analytics/Insights** - Later phase, or conversational through AI

#### Priority Dashboard (Page 1)
- **Top 3 Display**: Prominent display of most important current tasks
- **Chat Interface**: Conversational task updates and AI interaction at bottom
- **Quick Actions**: Mark complete, snooze, or get details
- **Context Indicators**: Visual tags for work/personal/etc.
- **Dependency Alerts**: Visual indicators for blocked or blocking tasks

#### Task Browser (Page 2)
- **Dynamic Project Buttons**: Auto-generated buttons for most active projects
- **Smart Filtering**: "Show me all website tasks" / "Show me all house tasks"
- **Prompt-based Search**: Natural language queries like "show me tasks due this week"
- **See All Button**: Comprehensive view of all tasks
- **Filterable Task List**: Standard list view with sorting and filtering

#### Rapid-Fire Quiz Interface (Integrated)
- **Priority Comparisons**: "Which is higher priority: A or B?"
- **Optimization Suggestions**: "These 3 tasks need the same research - group them?"
- **Confidence Learning**: Yes/no responses to calibrate AI suggestion thresholds
- **Mixed Quiz Types**: Priority ranking + task grouping + dependency suggestions
- **Progress Indicators**: Show progress through question sets

---

## 4. Technical Requirements

### 4.1 Data Architecture

#### Structured Data (Supabase PostgreSQL)
- **Tasks Table**: Core task information, status, priorities, dates
- **Goals Table**: Goal definitions, priorities, creation dates, status
- **Task-Goal Relationships**: Many-to-many mapping between tasks and goals
- **Dependencies Table**: Task relationship mapping
- **User Preferences**: Priority patterns, AI behavior settings, work hours
- **Task History**: Status changes, completion tracking
- **Goal Progress**: Historical goal advancement metrics

#### Vector Data (Supabase pgvector)
- **Conversation Embeddings**: All chat interactions for semantic search
- **Task Context Embeddings**: Rich task descriptions and context
- **Goal Context Embeddings**: Goal descriptions, aspirations, and context
- **Project Memory**: Past project patterns and outcomes
- **User Pattern Embeddings**: Behavioral patterns and preferences
- **Optimization Pattern Storage**: Task grouping, sequencing, and efficiency patterns
- **Goal-Task Relationship Embeddings**: Semantic connections between goals and tasks

#### Hybrid Queries
- **Contextual Task Retrieval**: Find similar past tasks using vector search
- **Goal-Task Connection Discovery**: Identify which tasks advance which goals using semantic similarity
- **Priority Decision Support**: Use past patterns and goal priorities to suggest current priorities
- **Dependency Suggestion**: Find similar project structures from history
- **Conversation Context**: Retrieve relevant past conversations for current context
- **Automatic Project Clustering**: Group related tasks into projects using similarity
- **Dependency Graph Discovery**: Infer task dependencies from descriptions
- **Task Sequencing Optimization**: Suggest efficient task ordering for time/cost savings
- **Goal Pattern Recognition**: Identify task patterns that effectively advance specific goals

### 4.2 AI Integration

#### LLM Configuration
- **Single Model Approach**: One LLM with different prompt strategies
- **Mode Switching**: Different prompts for chat/priority/questioning modes
- **Context Management**: Efficient context window usage with relevant history
- **Response Formatting**: Structured outputs for UI integration

#### Vector Search Integration
- **Semantic Task Search**: Find related tasks across all history
- **Conversation Retrieval**: Pull relevant past conversations for context
- **Pattern Matching**: Identify similar project structures and outcomes
- **Learning Data**: Use vector search to improve AI suggestions

### 4.3 Performance Requirements

#### Response Times
- **Priority Display**: Fast display of top 3 tasks on app open
- **Chat Responses**: Responsive AI responses
- **Vector Search**: Efficient semantic search queries
- **Task Updates**: Immediate status changes

#### Scalability
- **Task Volume**: Support large numbers of tasks without performance degradation
- **Conversation History**: Maintain full history with efficient retrieval
- **Vector Storage**: Efficient embedding storage and search
- **Concurrent Usage**: Single-user focus, but responsive under load

### 4.4 Integration Requirements

#### Supabase Integration
- **Authentication**: User session management
- **Real-time Updates**: Live task status synchronization
- **File Storage**: Optional attachment support for tasks
- **Edge Functions**: Server-side AI processing

#### External AI Services
- **Bedrock/Company LLMs**: Integration with company AI infrastructure
- **Embedding Generation**: Efficient text-to-vector conversion
- **Model Switching**: Ability to test different models
- **API Rate Limiting**: Graceful handling of API limits

---

## 5. Non-Functional Requirements

### 5.1 Usability
- **Intuitive Interface**: Minimal learning curve for basic features
- **Mobile Responsive**: Works well on desktop and mobile
- **Accessibility**: Basic accessibility compliance
- **Performance Feedback**: Clear indicators when AI is processing

### 5.2 Reliability
- **Data Persistence**: No data loss during system updates
- **Graceful Degradation**: Core features work even if AI is unavailable
- **Error Recovery**: Clear error messages and recovery paths
- **Backup Strategy**: Regular data backups

### 5.3 Maintainability
- **Code Documentation**: Well-documented codebase for learning
- **Modular Architecture**: Easy to modify and extend features
- **Testing Strategy**: Unit tests for core functionality
- **Development Workflow**: Easy local development setup

### 5.4 Security
- **Data Privacy**: Personal task data remains private
- **API Security**: Secure integration with external AI services
- **Authentication**: Secure user authentication via Supabase
- **Data Encryption**: Sensitive data encrypted at rest

---

## 6. Development Phases

### Phase 1: Foundation (MVP)
- [ ] Basic task CRUD operations
- [ ] Simple priority display
- [ ] Basic chat interface
- [ ] Supabase setup and schema

### Phase 2: AI Integration
- [ ] LLM integration for chat
- [ ] Basic priority suggestions
- [ ] Simple proactive questioning
- [ ] Vector database setup

### Phase 3: Advanced Features
- [ ] Complex dependency tracking
- [ ] Rapid-fire quiz interface
- [ ] Advanced AI learning
- [ ] Full conversation memory

### Phase 4: Polish & Learning
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Advanced vector search
- [ ] Personal usage and iteration

---

## 7. Open Questions & Decisions Needed

### Technical Decisions
- [ ] Specific LLM model selection from company options
- [ ] Vector embedding model choice
- [ ] Real-time vs. batch processing for AI features
- [ ] Deployment strategy (Supabase hosting vs. Blockcell)

### Product Decisions
- [ ] Default priority levels and criteria
- [ ] Frequency of proactive AI questioning
- [ ] Task archival and cleanup strategy
- [ ] Mobile app vs. web-only approach

### Learning Priorities
- [ ] Which vector database features to explore first
- [ ] AI personalization techniques to implement
- [ ] Performance optimization areas to focus on
- [ ] Integration patterns to learn

---

*This document serves as the north star for the Carole AI Assistant project. All development decisions should reference back to these requirements, and the document should be updated as the project evolves.*