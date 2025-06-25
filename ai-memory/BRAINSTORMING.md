# Brainstorming Sessions & Feature Planning

**Purpose:** Document successful brainstorming methodologies and capture feature planning decisions for future reference.

---

## Brainstorming Methodology

### Single Question Approach ✅ **PROVEN EFFECTIVE**

**Problem Solved:** Traditional approach of asking 20+ questions overwhelms users and leads to incomplete responses.

**Solution:** Ask ONE focused question at a time, build on responses iteratively.

### Core Process

1. **Start with Big Picture:** Identify the main goal/challenge first
2. **Single Question Focus:** Ask one specific, actionable question
3. **Wait for Full Response:** Let user completely answer before next question
4. **Build Iteratively:** Use their answer to inform the next logical question
5. **Acknowledge Uncertainty:** When user says "I'm not sure," offer perspective/options
6. **Document Decisions:** Capture both process and content decisions
7. **Mandatory Pre-Phase:** Always brainstorm before major development phases

### Why This Works

- **Reduces Cognitive Load:** User can focus on one decision at a time
- **Builds Context:** Each answer informs better follow-up questions
- **Prevents Overwhelm:** No intimidating walls of text with dozens of questions
- **Encourages Engagement:** Users more likely to answer single questions thoroughly
- **Creates Flow:** Natural conversation rhythm vs interrogation feeling

---

# Phase 3: Vector Integration & Advanced Memory - Brainstorming Session

**Date:** 2025-01-13  
**Focus:** Originally focused on proactive AI behavior - **PHASE REORDERED**  
**Status:** Vector database foundation now prioritized as Phase 3, smart features moved to Phase 4

## Session Goal

Transform Carole from reactive AI assistant to proactive, intelligent helper that notices patterns, asks smart questions, and helps users manage the hard problems of task management: details, dependencies, and prioritization.

## Key Decisions Made

### 1. **Proactive AI Behavior Strategy**

**Core Principle:** AI prioritizes logic over hardcoded business rules for semantic understanding

**Trigger Approach:**

- AI waits for user to "open the conversation door" (typing anything, completing tasks)
- Then AI can naturally weave in proactive questions within that conversation
- Never interrupts unprompted - respects user's focus

**Question Locations:**

- **Main Chat:** Single most important question across all tasks (general workflow, multi-task issues)
- **Task Detail Chat:** Task-specific questions appear immediately when opening low-confidence tasks

### 2. **Confidence-Based Intervention System**

**Confidence Levels & Actions:**

- **Low Confidence** (e.g., "website stuff"): Immediate clarification required
- **Medium Confidence**: Allow task creation, but add to proactive question queue
- **High Confidence** (e.g., "fix header on block.xyz landing page"): Accept as-is

**Smart Analysis:** AI holistically evaluates "is this actionable as written?" using full context rather than business rules

### 3. **Priority Scoring & Learning System**

**Weighted Scoring Formula:**
`urgency_score = (priority * status_multiplier * days_stuck) + due_date_penalty`

**Status Multipliers:**

- Backlog: 0.5x
- Todo: 2x
- In-Progress: 3x

**Learning Approach:**

- Track which proactive questions users engage with vs ignore
- Accept noisy/inconsistent user behavior (context varies)
- Manual weight variables for tuning
- Keep learning simple for now (advanced analytics in later phase)

### 4. **User Control & Engagement**

**Proactivity Settings:**

- User-controlled "proactivity level" setting
- Dynamic hot/cool adjustment based on user responses
- One question at a time (never batch multiple questions)

**Engagement Tracking:**

- Response vs ignore patterns teach AI user preferences
- Back off when user seems overwhelmed
- Re-engage based on natural conversation triggers

### 5. **Dependency & Context Detection**

**Example Scenarios:**

- "I can't update the header until we refactor the CMS" → Auto-create blocker relationship + new task
- Tasks stuck in "in-progress" for extended periods → Proactive check-in
- Approaching deadlines → Priority reassessment questions

**AI Analysis Focus:**

- Semantic understanding of task relationships
- Pattern recognition across user's workflow
- Context-aware suggestions without being pushy

## Implementation Implications

### Immediate Phase 3 Features

1. **Proactive Question System:** Main chat + task detail contexts
2. **Confidence Analysis:** AI semantic evaluation of task actionability
3. **Priority Scoring:** Weighted formula with learning capability
4. **Engagement Tracking:** Response patterns for AI calibration

### Phase Ordering Decision: ✅ **RESOLVED**

**Decision:** Vector database implementation moved to Phase 3, smart assistant features moved to Phase 4

**Rationale:**

- Vector foundation enables much smarter semantic analysis for proactive features
- Historical conversation memory essential for intelligent coaching and suggestions
- Phase 4 smart features will be significantly more sophisticated with vector foundation
- Better architectural approach: foundation first, then advanced features

**Updated Roadmap:**

- **Phase 3:** Vector Integration & Advanced Memory (foundation)
- **Phase 4:** Smart Assistant Features & Gamification (leveraging vector capabilities)

## Next Brainstorming Sessions Needed

1. **Vector Database Architecture:** Embedding strategy, conversation threading, search optimization
2. **Historical Pattern Recognition:** What patterns to detect and how to influence current AI behavior
3. **Cross-Session Continuity:** How to maintain context and learning across app sessions
4. **Phase 4 Smart Features:** Goal coaching, project discovery, quiz interface (leveraging vector foundation)

## Reference for Future Sessions

- **This approach works:** Single questions, iterative building, decision capture
- **User preference:** Prioritize AI logic over business rules throughout
- **Architecture goal:** Semantic understanding > hardcoded patterns
- **Balance needed:** Helpful proactivity without being annoying

---

## Brainstorming Session Template

For future major feature planning sessions:

### Session Setup

1. **Read Memory Bank:** Understand current project state
2. **Identify Core Goal:** What's the main problem/opportunity?
3. **Start with Big Picture:** User's vision and priorities

### Question Flow

1. **Core Vision:** "What excites you most about [Feature]?"
2. **Implementation Details:** One specific aspect at a time
3. **User Experience:** How should it feel to use?
4. **Technical Approach:** Architecture and integration points
5. **Success Metrics:** How will we know it's working?

### Session Wrap-up

1. **Document Decisions:** Clear choices made
2. **Identify Gaps:** What still needs brainstorming?
3. **Next Steps:** Implementation order and priorities
4. **Update Memory Bank:** Ensure continuity for future sessions
