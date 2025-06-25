# Known Issues & Fixes

**Purpose:** Critical AI implementation problems identified and their solutions for future debugging.

---

## 🚨 Critical AI Implementation Issues

### **Issue 1: Title Extraction Problems** (PRIORITY 1)

**Problem**: AI copies full prompts as titles instead of extracting meaningful titles

- **Input**: `"Create a task called Testing AI"`
- **Expected**: Task titled "Testing AI"
- **Reality**: Task titled "Create a task called Testing AI" or similar full prompt

**Root Cause**: `extractTaskDataWithContext()` in `src/lib/aiToolExecutor.ts` line ~721

- Uses full message as title without extraction logic
- No conversational prefix removal ("I need to", "Create a task for")

**Solution Applied**:

```typescript
private extractTitleFromMessage(message: string): string {
  // Remove conversational prefixes
  let title = message
    .replace(/^(i need to|i want to|create a task for|add a task to|make a task for)/i, '')
    .replace(/^(please|can you|could you)/i, '')
    .trim();

  // Capitalize first letter and limit length
  title = title.charAt(0).toUpperCase() + title.slice(1);
  return title.length > 50 ? title.substring(0, 50) + '...' : title;
}
```

---

### **Issue 2: Status Update Verification** (PRIORITY 2)

**Problem**: Operations claim success but don't actually update database

- **AI Claims**: "marked as done"
- **Reality**: Task still shows "todo" status
- **Evidence**: Database queries show no status change

**Root Cause**: Missing verification in status update operations

- `changeTaskStatus()` and `markTaskComplete()` don't verify updates
- Operations return success based on API call, not actual database state

**Solution Applied**:

```typescript
async changeTaskStatus(taskId: string, status: Task["status"]): Promise<AITaskToolResult> {
  const result = await updateTask(taskId, { status });

  // ADD: Verify the update actually worked
  if (result.success) {
    const verification = await getTasks();
    const updatedTask = verification.data?.find(t => t.id === taskId);
    if (updatedTask?.status !== status) {
      return { success: false, error: "Update failed verification" };
    }
  }
  return result;
}
```

---

### **Issue 3: Context Tracking Failures** (PRIORITY 3)

**Problem**: "Make that high priority" doesn't know what "that" refers to

- **User Says**: Creates task, then "Make that high priority"
- **AI Result**: Creates new task instead of updating previous one
- **Root Cause**: No conversation context tracking

**Solution Applied**:

```typescript
// In ChatInterface.svelte - add conversation tracking
let lastCreatedTaskId = null;
let conversationContext = {
  recentTasks: [],
  currentFocus: null,
};

// After successful task creation:
if (taskResults.length > 0) {
  lastCreatedTaskId = taskResults[0].taskId;
  conversationContext.recentTasks.unshift({
    id: taskResults[0].taskId,
    title: taskResults[0].data?.title,
    timestamp: Date.now(),
  });
}
```

---

### **Issue 4: Tool Result Accuracy** (PRIORITY 4)

**Problem**: AI generates responses claiming success even when operations fail

- **AI Response**: "✅ Task created successfully"
- **Reality**: Database operation failed
- **Root Cause**: Response generation doesn't check tool results

**Solution Applied**:

- Check tool results for actual success/failure before generating responses
- Add "operation failed" response templates
- Modify `databricksService.ts` to be truthful about failures

---

## 🔧 PostCSS/Tailwind Configuration Issues

### **Issue: Tailwind v4 Compatibility** (RESOLVED)

**Problem**: PostCSS preprocessing errors with Tailwind CSS v4.1.10

- Error: "PostCSS plugin has moved to a separate package"
- Additional issue: SASS import path resolution in Vite

**Solution Applied**:

1. **Downgraded Tailwind CSS**: v4.1.10 → v3.4.0 for stability
2. **Simplified PostCSS config**: Direct `tailwindcss` import
3. **Removed problematic SASS imports**: Eliminated global import causing path issues
4. **Cleaned dependencies**: Removed unused `@tailwindcss/postcss`

**Working Configuration**:

```javascript
// postcss.config.js
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwindcss, autoprefixer],
};
```

**Critical Learning**: Bleeding-edge dependencies can break development workflow. Prioritize stability over latest features.

---

## 🔄 Service Reliability Issues

### **Issue: Intermittent Databricks Service Failures** (RESOLVED)

**Problem**: Inconsistent "Databricks service temporarily unavailable" errors

- Random 503 service unavailable responses
- Environment configuration switching between dev/production randomly
- Network timeouts causing user frustration

**Solution Applied**:

1. **Retry Logic**: 3-attempt retry system with exponential backoff
2. **Error Categorization**: 503, 429, 5xx, and network errors handled distinctly
3. **Connection Monitoring**: Real-time response time tracking
4. **Environment Stability**: Consistent production mode configuration validation

**Monitoring Tools Added**:

- `test-connection-monitor.js` for service health testing
- Configurable testing with custom iteration counts and timing
- Success rate analytics and error pattern detection

---

## 🧠 AI Intent Recognition Issues

### **Issue: Creation vs Completion Conflicts** (RESOLVED)

**Problem**: "I finished my training" creates new task instead of marking existing task complete

- **Root Cause**: Simple pattern matching conflicted with semantic intent
- **Old Approach**: Hardcoded keyword detection
- **Solution**: AI-powered semantic intent analysis

**Implementation**:

```typescript
// Enhanced semantic intent recognition
private async analyzeIntentWithAI(
  message: string,
  context: EnhancedAIContext,
  conversationHistory: ChatMessage[]
): Promise<Intent[]> {
  // Use contextual understanding instead of pattern matching
  // Prevents "I finished X" from creating new tasks
}
```

**Key Learning**: AI-only approach prevents false positives from keyword matching

---

## 🐛 Development Environment Issues

### **Issue: SASS Import Path Resolution** (RESOLVED)

**Problem**: Vite preprocessor path resolution issues causing build failures

- Global SASS imports in Vite config caused conflicts
- SSR errors preventing proper development workflow

**Solution Applied**:

- Removed problematic global SASS imports from Vite configuration
- Simplified build process to eliminate preprocessing errors
- Updated import patterns to be more explicit

---

## 📊 Testing Evidence & Debugging Patterns

### **Database Evidence Patterns**

**Working Operations** (for comparison):

```bash
# Direct API test works perfectly:
curl -X POST http://localhost:5173/api/tasks \
  -d '{"title":"API Test Task","priority":7}'
# Result: Perfect task creation with proper title
```

**Problematic Operations**:

```bash
# AI-created tasks show title problems:
{
  "title": "i should do something about that project",     # Should be: "Project Work"
  "title": "i need to finish the quarterly report",       # Should be: "Quarterly Report"
}
```

### **Console Debugging Patterns**

**Successful Operations Show**:

```
✅ Task created successfully: { ... }  # Database operations work
✅ Tasks fetched successfully: 9 tasks  # Fetching works
```

**Failed Operations Show**:

```
❌ AI claimed success but database unchanged
❌ Status update failed verification
```

### **Testing Commands for Verification**

```bash
# Test title extraction:
# Input: "I need to finish the quarterly report"
# Expected: {title: "Quarterly Report", description: "..."}

# Test status updates:
curl http://localhost:5173/api/tasks | jq '.data[] | select(.title | contains("test")) | {title, status}'

# Test connection reliability:
node test-connection-monitor.js 10 2000  # 10 tests, 2s apart
```

---

## 🔍 Debugging Tools & Monitoring

### **Connection Monitor Script**

**Usage**: `node test-connection-monitor.js [iterations] [delay_ms]`

- **Default**: 10 tests with 2s intervals
- **Extended**: `node test-connection-monitor.js 50 1000` for 50 tests, 1s apart
- **Quick**: `node test-connection-monitor.js 5 5000` for 5 tests, 5s apart

**Output**:

- Success/failure rates
- Response time statistics
- Error categorization (503, 429, 5xx, network)
- Timing patterns and reliability metrics

### **Enhanced Logging Patterns**

**Production Logging Includes**:

- Environment configuration verification on startup
- Response time tracking for all service calls
- Detailed error categorization with HTTP status codes
- Retry attempt tracking with backoff timing

**Log Levels**:

- `INFO`: Normal operations and configuration
- `WARN`: Retry attempts and recoverable issues
- `ERROR`: Failed operations requiring attention
- `DEBUG`: Detailed troubleshooting information (development only)

---

## 💡 Prevention Strategies

### **Code Quality Patterns**

1. **Always verify database operations** - Don't trust API success responses
2. **Use semantic AI analysis** instead of pattern matching for intent recognition
3. **Implement retry logic** for external service dependencies
4. **Test with real data** in development environment
5. **Monitor and log** all critical operations with timing metrics

### **Testing Strategies**

1. **End-to-end testing** of AI conversations with database verification
2. **Service reliability testing** with connection monitor tools
3. **Intent recognition testing** with edge cases and ambiguous inputs
4. **Database state verification** after all operations
5. **Error scenario testing** with service unavailability simulation

---

## 🧪 Testing Patterns & Verification Methods

### **Comprehensive AI Testing Framework** (from test files)

**Performance Testing Pattern:**

```bash
# Quick verification of efficient operations
curl -s http://localhost:5173/api/tasks | jq '.data[] | {id, title, status, priority, context_tags}' | head -5

# Check console logs for efficiency:
# ✅ Should see: "Using efficient task lookup with getTaskById()"
# ❌ Should NOT see: "Fetching all tasks to find one"
```

**AI Title Extraction Quality Tests:**

```bash
# Test conversational input → clean title extraction
"I need to call the dentist" → Expected: "Call Dentist"
"I should finish the quarterly report" → Expected: "Quarterly Report"
"Create a task for testing the new feature" → Expected: "Test New Feature"
"I need to review the budget for next month" → Expected: "Budget Review"
```

**Context Resolution Testing:**

```bash
# Multi-turn conversation verification
1. "Call dentist for checkup" (create task)
2. "make the dentist task high priority" (keyword resolution)
3. "that should be urgent too" (conversation context)

# Expected: Each step should resolve to the same task correctly
```

**Database Verification Pattern:**

```bash
# Test operation integrity (critical for truthfulness)
1. Perform AI operation (e.g., "mark task complete")
2. Immediately verify in database
3. AI should only claim success if database actually changed
4. False positives indicate verification failure
```

**Array Operations Testing:**

```bash
# Smart tag/location management
Task: tags=["health", "call"] → "add teeth tag" → ["health", "call", "teeth"]
Task: tags=["health", "call", "urgent"] → "remove urgent" → ["health", "call"]
Task: locations=["home"] → "add office location" → ["home", "office"]
```

**Relative Date Parsing Verification:**

```bash
# Test from current date context
Current: 2025-01-13 (Monday)
"due Friday" → Expected: 2025-01-17
"due next Monday" → Expected: 2025-01-20
"due tomorrow" → Expected: 2025-01-14
```

### **Critical Testing Principles**

**AI-First Verification:**

- ✅ LLM handles intent recognition (not pattern matching)
- ✅ Task titles extracted intelligently (not copied verbatim)
- ✅ Context resolution uses AI understanding
- ✅ Natural language variations work correctly

**Operation Integrity:**

- ✅ Only reports success when operations actually succeed
- ✅ Database verification confirms all changes
- ✅ Clear error messages for failures
- ✅ No false positive confirmations

**Performance Standards:**

- ✅ Uses `getTaskById()` for single task operations
- ✅ Avoids bulk task fetching for individual lookups
- ✅ Efficient array operations (smart add/remove/replace)
- ✅ Optimized database queries

### **Testing Workflow for Development**

```bash
# 1. Start development environment
npm run dev

# 2. Test core AI functionality
"I need to prepare the presentation for Monday" # Check title quality
"Make that high priority"                      # Check context resolution
"I finished the training modules"              # Check completion detection

# 3. Verify database state
curl -s http://localhost:5173/api/tasks | jq '.data[] | {title, status, priority}'

# 4. Test edge cases
"Mark my presentation task as done"            # Test with missing context
"Update the urgent task"                       # Test with multiple matches
```

**Debugging Red Flags:**

- AI claiming success but database unchanged
- Task titles copying full user input
- "Fetching all tasks" logs for single operations
- Context resolution failures ("that task" not working)
- False positive success messages
