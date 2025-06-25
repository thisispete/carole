# User Experience Patterns & Interaction Design

**Purpose:** Detailed UX patterns and interaction design decisions for consistent user experience.

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

**Design Principle:** **Immediate Value** - Users should get actionable information within 2 seconds of opening the app.

---

## Page-Specific Interaction Patterns

### Page 1: Landing/Priority Dashboard

#### **First Visit Experience**

```
User Opens App → No tasks yet → AI says "Hi! Tell me about something you need to do"
→ User types task → AI asks clarifying questions → Task appears in Top 3
```

#### **Daily Usage Pattern**

```
Open App → See Top 3 priorities → Quick actions (✅ Mark done, 💬 Chat, 📝 Update)
```

#### **Task Completion Celebration Flow**

- ✅ **Celebrate completion first** - Show positive feedback/animation before adding more work
- Brief success message, then intelligently surface next priority (not just #4)
- AI reassesses all priorities after celebration

#### **Priority Display Behavior**

- **Click to complete** OR **dropdown for status changes**
- Status options: Not Started → In Progress → Blocked → Completed
- No kanban/drag-and-drop style

### Page 2: Task Browser

#### **Project Discovery Flow**

```
User has many tasks → AI groups similar tasks → Dynamic project buttons appear
→ User clicks "Website Project" → See filtered tasks → Manage/organize
```

#### **Task Management Flow**

```
See all tasks → Filter by project/context → Edit task → Update status → Return to dashboard
```

---

## AI Interaction Patterns

### Proactive AI Behavior Timing

**✅ ALWAYS PROACTIVE** - AI continuously manages priorities:

- **On app open** - reassess and suggest changes
- **When user adds new task** - immediate priority assessment
- **Time-based** - morning/evening priority reviews
- **When completing tasks** - reassess remaining priorities
- **Based on deadlines, user patterns, quiz responses**

**✅ INTELLIGENT PROACTIVITY** - AI initiates but not intrusive:

- Subtle chat messages for suggestions
- Integrated quiz interface on landing page
- Learn from user responses to calibrate frequency
- Proactive but respectful of user focus

### Chat Interface Layout

#### **Central Column Design**

- **Modal or dockable visor style** - flexible UI that can expand/collapse
- Chat history placement in central area
- Context-aware conversation threading

#### **Chat Interaction Flow**

```
User types message → AI responds → [Context: Task creation, Status update, or General chat]
```

#### **AI Verification Approach**

- **AI asks "Should I create a task for this?"**
- Tunable sensitivity - can dial up/down confirmation requirements
- AI should proactively track based on user inputs

### Goal Coaching Conversations

#### **Goal Discovery Flow**

```
AI notices task patterns → "I see lots of house tasks - creating a home improvement goal?"
→ User responds → AI helps formalize goal → Goal influences future priorities
```

#### **✅ INTEGRATED GOAL COACHING** - Subtle but strategic:

- Proactive chat messages about goal opportunities
- Visual indicators in task list (minimal, not overwhelming)
- Weekly goal review integrated with priority quiz
- AI suggests new tasks that advance goals

---

## Rapid-Fire Quiz Interface

### Quiz Trigger Moments & Integration

**✅ LANDING PAGE UI COMPONENT** - Separate pane from chat/priorities:

- Always available as part of main UI (not modal/popup)
- Triggered when AI confidence is low on priorities
- User can initiate anytime for priority clarification
- Weekly priority review sessions
- Integrated into natural workflow

### Quiz Flow Pattern

```
AI: "Quick priority check - 3 questions:"
→ "Task A vs Task B - which is more important?" [A] [B]
→ "These 3 tasks need research - group them?" [Yes] [No]
→ "Task X blocks Task Y - boost X priority?" [Yes] [No]
→ "Thanks! Updated your priorities."
```

### Quiz Types

- **Priority Comparisons**: "Which is higher priority: A or B?"
- **Optimization Suggestions**: "These 3 tasks need the same research - group them?"
- **Confidence Learning**: Yes/no responses to calibrate AI suggestion thresholds
- **Mixed Quiz Types**: Priority ranking + task grouping + dependency suggestions

---

## Error States & Edge Cases

### AI Unavailable Scenario

```
Show cached priorities → Basic task management → "AI will return soon" message
```

### No Tasks Scenario

```
Empty app → Friendly AI introduction → Task creation guidance
```

### Conflicting Dependencies

```
Circular dependency detected → Show warning dialog → AI suggests resolution → User chooses approach
Options: Block creation with warning, Auto-resolve, or Manual resolution
```

### Task Reference Ambiguity

```
User: "Make that high priority"
AI: "I see several recent tasks. Which one: [Task A] [Task B] [Task C]?"
Context tracking maintains conversation state for resolution
```

---

## Status Update & Task Management Patterns

### Status Change Methods

- **Click status indicator** to open dropdown with all status options
- **Status Workflow**: backlog → todo → in_progress → done (with blocked from any active state)
- **Auto-save behavior** - changes save immediately without manual save

### Task Creation via Chat

- **AI verification required** - AI asks "Should I create a task for this?"
- **Context extraction** - AI extracts title, priority, due date from natural language
- **Confirmation feedback** - Clear success message with task details

### Priority Updates

- **Click priority pill** → popover with priority selector (0-10 with visual labels)
- **Visual priority mapping**:
  - 0=none (gray), 1-3=low (green), 4-6=medium (orange), 7-8=high (red), 9-10=critical (dark red)

---

## Accessibility & Usability Patterns

### Keyboard Navigation

- **Tab order**: Top priorities → Chat input → Action buttons
- **Keyboard shortcuts**:
  - `Space` to mark task complete
  - `Enter` in chat to send message
  - `Esc` to close modals

### Mobile Responsiveness

- **Touch-friendly targets**: Minimum 44px touch targets
- **Swipe gestures**: Swipe task card for quick actions
- **Collapsed navigation**: Hamburger menu for secondary pages

### Visual Feedback

- **Loading states**: Skeleton loaders for task lists
- **Success animations**: Checkmark animation for completed tasks
- **Error indicators**: Red border for failed operations with retry option

---

## Design Consistency Rules

### Color Usage

- **Priority colors**: Consistent across all components
- **Status colors**: Consistent visual language for task states
- **AI indicators**: Blue color family for AI-generated content

### Typography Hierarchy

- **Task titles**: Medium weight, readable size
- **AI messages**: Slightly smaller, italic for AI responses
- **Priority numbers**: Bold, color-coded

### Spacing & Layout

- **Consistent margins**: 16px standard spacing unit
- **Card padding**: 24px for comfortable touch targets
- **Text line height**: 1.5 for readability
