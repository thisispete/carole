# User Experience Flow

**Project:** Carole AI Personal Assistant  
**Created:** 2025-06-17  
**Status:** Planning - UX Design Phase

---

## Core User Journey

### The "Daily Carole" Experience

**Primary Goal:** Open app → See priorities → Take action → Close app feeling productive

```
1. 🌅 Open App
   ↓
2. 🎯 See Top 3 Priorities (Immediate value)
   ↓
3. 💬 Chat with AI (Optional - context & updates)
   ↓
4. ✅ Take Action (Mark complete, update, or defer)
   ↓
5. 🔄 Repeat throughout day
```

---

## Page-by-Page User Flows

### Page 1: Landing/Priority Dashboard

**First Visit Experience:**

```
User Opens App → No tasks yet → AI says "Hi! Tell me about something you need to do"
→ User types task → AI asks clarifying questions → Task appears in Top 3
```

**Daily Usage Pattern:**

```
Open App → See Top 3 priorities → Quick actions (✅ Mark done, 💬 Chat, 📝 Update)
```

**Chat Interaction Flow:**

```
User types message → AI responds → [Context: Task creation, Status update, or General chat]
```

### Page 2: Task Browser

**Project Discovery Flow:**

```
User has many tasks → AI groups similar tasks → Dynamic project buttons appear
→ User clicks "Website Project" → See filtered tasks → Manage/organize
```

**Task Management Flow:**

```
See all tasks → Filter by project/context → Edit task → Update status → Return to dashboard
```

---

## AI Interaction Patterns

### Proactive AI Behavior

**Priority Suggestion Timing:**

```
✅ ALWAYS PROACTIVE - AI continuously manages priorities:
- On app open - reassess and suggest changes
- When user adds new task - immediate priority assessment
- Time-based - morning/evening priority reviews
- When completing tasks - reassess remaining priorities
- Based on deadlines, user patterns, quiz responses
```

**AI Interaction Style:**

```
✅ INTELLIGENT PROACTIVITY - AI initiates but not intrusive:
- Subtle chat messages for suggestions
- Integrated quiz interface on landing page
- Learn from user responses to calibrate frequency
- Proactive but respectful of user focus
```

### Goal Coaching Conversations

**Goal Discovery Flow:**

```
AI notices task patterns → "I see lots of house tasks - creating a home improvement goal?"
→ User responds → AI helps formalize goal → Goal influences future priorities
```

**Goal-Aware Suggestions:**

```
✅ INTEGRATED GOAL COACHING - Subtle but strategic:
- Proactive chat messages about goal opportunities
- Visual indicators in task list (minimal, not overwhelming)
- Weekly goal review integrated with priority quiz
- AI suggests new tasks that advance goals
```

---

## Rapid-Fire Quiz Interface

### Quiz Trigger Moments

**Quiz Integration:**

```
✅ LANDING PAGE UI COMPONENT - Separate pane from chat/priorities:
- Always available as part of main UI (not modal/popup)
- Triggered when AI confidence is low on priorities
- User can initiate anytime for priority clarification
- Weekly priority review sessions
- Integrated into natural workflow
```

**Quiz Flow:**

```
AI: "Quick priority check - 3 questions:"
→ "Task A vs Task B - which is more important?" [A] [B]
→ "These 3 tasks need research - group them?" [Yes] [No]
→ "Task X blocks Task Y - boost X priority?" [Yes] [No]
→ "Thanks! Updated your priorities."
```

---

## Error States & Edge Cases

### No Tasks Scenario

```
Empty app → Friendly AI introduction → Task creation guidance
```

### AI Unavailable

```
Show cached priorities → Basic task management → "AI will return soon" message
```

### Conflicting Dependencies

```
[QUESTION: How to handle circular dependencies?]
- Show warning dialog?
- AI suggests resolution?
- Block creation?
- Allow with warning?
```

---

## UX Design Decisions ✅

### 🎯 **Priority Display Behavior**

1. **Task completion flow:**

   - ✅ **Celebrate completion first** - Show positive feedback/animation before adding more work
   - Brief success message, then intelligently surface next priority (not just #4)
   - AI reassesses all priorities after celebration

2. **Task interaction patterns:**
   - ✅ **Click to complete** OR **dropdown for status changes**
   - Status options: Not Started → In Progress → Blocked → Completed
   - No kanban/drag-and-drop style

### 💬 **Chat Interface Layout**

3. **Chat history placement:**

   - ✅ **Central column design** - modal or dockable visor style
   - Flexible UI that can expand/collapse as needed
   - _(Implementation details to be refined during development)_

4. **Task creation via chat:**
   - ✅ **AI verification approach** - AI asks "Should I create a task for this?"
   - Tunable sensitivity - can dial up/down confirmation requirements
   - AI should proactively track based on user inputs

### 🔄 **Task Updates & Status Management**

5. **Status update methods:**

   - ✅ **Click status indicator** to open dropdown with all status options
   - Chat messages also trigger status updates ("I finished X")
   - Both methods supported

6. **Task editing experience:**
   - ✅ **Quick detail view** for editing - modal/popup style
   - Easy access from title click or dedicated edit button

### 🎨 **Visual Hierarchy & Information Design**

7. **Information density:**

   - ✅ **Title only on dashboard**
   - Quick, easy way to see/edit/add details (hover, click, or dedicated icon)
   - Full details in expanded view

8. **AI confidence indicators:**
   - ✅ **Minimal approach** - track confidence but don't overwhelm UI
   - Show in detail view or on hover only
   - Focus on user experience over data visibility

### 🚀 **Onboarding & AI Integration**

9. **Feature discovery:**

   - ✅ **AI-guided setup conversation** - natural, progressive disclosure
   - Let AI introduce features contextually rather than formal tour

10. **First task creation:**
    - ✅ **AI suggests sample task** during onboarding conversation
    - Natural conversation that establishes initial tasks and patterns

---

## Interaction Patterns to Define

### Task Actions

- [ ] **Complete task** - Click action, confirmation needed?
- [ ] **Edit task** - Inline vs modal vs dedicated page?
- [ ] **Delete task** - Confirmation flow?
- [ ] **Create subtask** - From task view or chat?

### Priority Management

- [ ] **Manual priority setting** - Dropdown, buttons, or drag?
- [ ] **AI priority suggestions** - Accept/reject interface?
- [ ] **Priority conflicts** - How to resolve?

### Chat Interactions

- [ ] **Task creation** - Natural language parsing?
- [ ] **Status updates** - Structured vs freeform?
- [ ] **Context switching** - How to change topics?

---

## Landing Page UI Layout ✅

Based on decisions above, the landing page will have **3 main sections:**

### **Central Layout Design**

```
┌─────────────────────────────────────────────────────────┐
│                    🎯 TOP 3 PRIORITIES                    │
│  [Task 1 - Title only]     [Status ▼] [Details →]       │
│  [Task 2 - Title only]     [Status ▼] [Details →]       │
│  [Task 3 - Title only]     [Status ▼] [Details →]       │
├─────────────────────────────────────────────────────────┤
│                💬 CHAT INTERFACE                        │
│  [Central column - modal/visor style]                   │
│  "Tell me about a task..." [Send]                       │
├─────────────────────────────────────────────────────────┤
│                ⚡ PRIORITY QUIZ PANE                    │
│  "Quick priority check:" [Task A vs B] [Group tasks?]   │
└─────────────────────────────────────────────────────────┘
```

### **Interaction Patterns**

- **Task completion:** Click → Celebrate → Reassess priorities
- **Status changes:** Click status dropdown → Select new status
- **Task details:** Click title or details icon → Modal/popup editor **with contextual AI chat**
- **Global chat:** Natural language → AI verification for task creation, goal discussions
- **Task-specific chat:** Inline AI assistance for field updates, research, dependency detection
- **Quiz:** Always available, AI-triggered when confidence low

---

## Contextual AI Assistance ✨

### **Task-Specific AI Chat Interface**

**Concept:** Each task detail view includes its own AI chat interface for contextual assistance and smart field updates.

### **Natural Language Field Updates**

```
User: "this one is done"
→ AI: Updates status to "Completed" + celebration

User: "I got a quote for this and it was 3000"
→ AI: Updates cost_estimate to $3000.00

User: "this is blocked by updating the UI"
→ AI: Searches existing tasks, creates dependency link if "UI update" task exists

User: "due next Friday"
→ AI: Sets due_date to appropriate Friday date

User: "this is harder than I thought, maybe a 4"
→ AI: Updates difficulty_level to 4
```

### **Contextual Research Assistance**

```
User: "I need help researching this"
→ AI: "What specific aspect should I help you research?"
→ User: "best practices for database indexing"
→ AI: Web search + summarized findings + option to save as notes

User: "what are similar projects to this?"
→ AI: Vector search through task history for similar patterns
→ AI: "I found 3 similar projects you worked on..."
```

### **Smart Context Switching**

- **Global Chat:** Goal discussions, general priority questions, new task creation
- **Task Chat:** Field updates, research help, dependency detection, task-specific questions
- **AI Context Awareness:** Knows which task is being discussed, maintains context

### **Dependency Intelligence**

```
User: "this is blocked by the server setup"
→ AI: Searches for "server setup" task
→ AI: "Found task 'Configure production server' - should I link this as a dependency?"
→ User: "yes"
→ AI: Creates dependency + suggests priority boost for blocking task
```

### **Proactive Task Assistance**

```
AI: "I notice this task mentions needing approval - should I add a dependency or reminder?"

AI: "This seems like it might be expensive - want me to research typical costs?"

AI: "You've had similar tasks before - here's what worked well last time..."
```

---

## Next Steps for Implementation

1. ✅ **UX patterns finalized** - Ready for development
2. **Create wireframes** for detailed layouts
3. **Implement basic UI structure** following decisions above
4. **Build task interaction components** (status dropdown, detail modal)
5. **Integrate AI chat with verification flow**
6. **Add celebration animations** for task completion

---

_UX design decisions are now finalized and ready to guide implementation._
