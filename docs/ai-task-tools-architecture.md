# AI Task Tools Architecture

**Project:** Carole AI Personal Assistant  
**Created:** 2025-01-13  
**Status:** Phase 2 Design - Ready for Implementation

---

## 🎯 **Overview**

This document defines the core AI Task Tools architecture that enables Carole to have full awareness and control over task management. This system transforms the AI from a passive chat interface into an active task management partner with comprehensive capabilities.

## 🏗️ **Architecture Components**

### **1. AI Task Tools Interface**

The core set of functions that the AI can call to manage tasks:

```typescript
// src/lib/aiTaskTools.ts
interface AITaskTools {
  // === CORE TASK OPERATIONS ===
  searchTasks(query: string): Promise<Task[]>;
  createTask(taskData: Partial<Task>): Promise<Task>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<boolean>;
  addTaskNote(taskId: string, note: string): Promise<Task>;

  // === STATUS & PRIORITY MANAGEMENT ===
  changeTaskStatus(taskId: string, status: TaskStatus): Promise<Task>;
  changeTaskPriority(taskId: string, priority: number): Promise<Task>;
  markTaskComplete(taskId: string): Promise<Task>;

  // === TASK INTELLIGENCE ===
  analyzeTasks(): Promise<TaskAnalysis>;
  findSimilarTasks(taskId: string): Promise<Task[]>;
  suggestDependencies(taskId: string): Promise<Dependency[]>;
  clusterTasks(): Promise<TaskCluster[]>;
  optimizePriorities(): Promise<PriorityOptimization>;

  // === CONTEXT RETRIEVAL ===
  getTasksByStatus(status: TaskStatus): Promise<Task[]>;
  getTasksByPriority(minPriority: number): Promise<Task[]>;
  getBlockedTasks(): Promise<Task[]>;
  getHighPriorityTasks(): Promise<Task[]>;
}
```

### **2. AI Context System**

Rich context awareness that keeps the AI informed about task state:

```typescript
// src/lib/aiContext.ts
interface AIContext {
  // Current task state
  allTasks: Task[];
  topPriorityTasks: Task[];
  recentlyUpdatedTasks: Task[];

  // Task analytics
  totalTasks: number;
  blockedTasks: Task[];
  completedToday: Task[];
  overdueTasks: Task[];

  // User patterns (for future learning)
  userPreferences: UserPreferences;
  workingHours: TimeRange;
  priorityPatterns: PriorityPattern[];

  // Conversation context
  recentMessages: Message[];
  currentTaskFocus?: string; // Task ID if discussing specific task
}

async function buildAIContext(): Promise<AIContext> {
  const allTasks = await getTasks();
  const topPriorityTasks = await getTopPriorityTasks();

  return {
    allTasks: allTasks.data || [],
    topPriorityTasks: topPriorityTasks.data || [],
    recentlyUpdatedTasks: getRecentlyUpdated(allTasks.data || []),
    totalTasks: allTasks.data?.length || 0,
    blockedTasks: allTasks.data?.filter((t) => t.status === "blocked") || [],
    completedToday: getCompletedToday(allTasks.data || []),
    overdueTasks: getOverdueTasks(allTasks.data || []),
    // ... other context
  };
}
```

### **3. Tool Execution Engine**

Orchestrates AI tool calls and provides user feedback:

```typescript
// src/lib/aiToolExecutor.ts
interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  reasoning?: string;
  confidence?: number;
}

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  userMessage: string; // Human-readable description
  taskId?: string; // For task-specific operations
  requiresConfirmation?: boolean;
}

class AIToolExecutor {
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    console.log(`🔧 Executing tool: ${toolCall.tool}`, toolCall.parameters);

    switch (toolCall.tool) {
      case "createTask":
        return await this.executeCreateTask(toolCall.parameters);

      case "updateTask":
        return await this.executeUpdateTask(toolCall.parameters);

      case "changeTaskStatus":
        return await this.executeStatusChange(toolCall.parameters);

      case "analyzeTasks":
        return await this.executeTaskAnalysis(toolCall.parameters);

      // ... other tools
    }
  }

  private async executeCreateTask(params: any): Promise<ToolResult> {
    const taskData = {
      title: params.title,
      description: params.description,
      priority: params.priority || 5,
      status: params.status || "todo",
      context_tags: params.tags || [],
      difficulty_level: params.difficulty,
      due_date: params.dueDate,
      // ... other fields
    };

    const result = await createTask(taskData);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        taskId: result.data.id,
        userMessage: `✅ Created task: "${result.data.title}" (Priority: ${result.data.priority})`,
      };
    } else {
      return {
        success: false,
        error: result.error,
        userMessage: `❌ Failed to create task: ${result.error}`,
      };
    }
  }

  private async executeStatusChange(params: any): Promise<ToolResult> {
    const { taskId, status } = params;
    const result = await updateTask(taskId, { status });

    if (result.success) {
      const statusEmoji = this.getStatusEmoji(status);
      return {
        success: true,
        data: result.data,
        taskId: taskId,
        userMessage: `${statusEmoji} Changed "${
          result.data.title
        }" to ${status.replace("_", " ")}`,
      };
    } else {
      return {
        success: false,
        error: result.error,
        userMessage: `❌ Failed to update task status: ${result.error}`,
      };
    }
  }

  private getStatusEmoji(status: string): string {
    const emojis = {
      todo: "📋",
      in_progress: "🔄",
      blocked: "🚫",
      done: "✅",
      backlog: "💭",
    };
    return emojis[status] || "📝";
  }
}
```

### **4. Natural Language Intent Recognition**

Maps user natural language to specific tool operations:

```typescript
// src/lib/intentRecognizer.ts
interface UserIntent {
  type:
    | "create"
    | "update"
    | "status_change"
    | "priority_change"
    | "question"
    | "analysis";
  confidence: number;
  targetTask?: Task;
  parameters?: Record<string, any>;
  reasoning: string;
}

class IntentRecognizer {
  analyzeIntent(message: string, context: AIContext): UserIntent[] {
    const intents: UserIntent[] = [];

    // Task completion detection
    if (this.detectCompletion(message)) {
      const targetTask = this.findTaskFromMessage(message, context.allTasks);
      intents.push({
        type: "status_change",
        confidence: 0.8,
        targetTask,
        parameters: { status: "done" },
        reasoning: "User mentioned completion words",
      });
    }

    // Work start detection
    if (this.detectWorkStart(message)) {
      const targetTask = this.findTaskFromMessage(message, context.allTasks);
      intents.push({
        type: "status_change",
        confidence: 0.7,
        targetTask,
        parameters: { status: "in_progress" },
        reasoning: "User mentioned starting work",
      });
    }

    // Priority change detection
    const priorityMatch = message.match(/priority.*(\d+)|(\d+).*priority/i);
    if (priorityMatch) {
      const priority = parseInt(priorityMatch[1] || priorityMatch[2]);
      intents.push({
        type: "priority_change",
        confidence: 0.8,
        parameters: { priority },
        reasoning: "User mentioned specific priority number",
      });
    }

    // Task creation detection
    if (this.detectTaskCreation(message)) {
      intents.push({
        type: "create",
        confidence: 0.6,
        parameters: this.extractTaskData(message),
        reasoning: "User described a new task or goal",
      });
    }

    return intents;
  }

  private detectCompletion(message: string): boolean {
    const completionWords = [
      "done",
      "finished",
      "completed",
      "complete",
      "did",
      "finished",
    ];
    return completionWords.some((word) => message.toLowerCase().includes(word));
  }

  private detectWorkStart(message: string): boolean {
    const startWords = [
      "working on",
      "started",
      "starting",
      "beginning",
      "tackling",
    ];
    return startWords.some((phrase) => message.toLowerCase().includes(phrase));
  }

  private findTaskFromMessage(
    message: string,
    tasks: Task[]
  ): Task | undefined {
    // Simple similarity matching - could be enhanced with vector search later
    const words = message.toLowerCase().split(/\s+/);

    for (const task of tasks) {
      const taskWords = task.title.toLowerCase().split(/\s+/);
      const similarity = this.calculateSimilarity(words, taskWords);

      if (similarity > 0.3) {
        // Threshold for task matching
        return task;
      }
    }

    return undefined;
  }

  private calculateSimilarity(words1: string[], words2: string[]): number {
    const intersection = words1.filter((word) => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }
}
```

### **5. Task Intelligence System**

Advanced analysis and optimization capabilities:

```typescript
// src/lib/taskIntelligence.ts
interface TaskAnalysis {
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  themes: string[];
  blockers: Task[];
  highPriorityItems: Task[];
  projectClusters: TaskCluster[];
  optimizationSuggestions: OptimizationSuggestion[];
}

interface TaskCluster {
  theme: string;
  tasks: Task[];
  suggestedActions: string[];
}

interface OptimizationSuggestion {
  type: "grouping" | "priority" | "dependency" | "scheduling";
  description: string;
  affectedTasks: string[];
  confidence: number;
}

class TaskIntelligence {
  async analyzeTasks(tasks: Task[]): Promise<TaskAnalysis> {
    // Generate summary statistics
    const summary = this.generateSummary(tasks);

    // Extract themes from task content
    const themes = this.extractThemes(tasks);

    // Identify blocking tasks
    const blockers = this.findBlockers(tasks);

    // Cluster related tasks
    const clusters = this.clusterSimilarTasks(tasks);

    // Generate optimization suggestions
    const suggestions = this.generateOptimizationSuggestions(tasks, clusters);

    return {
      summary,
      themes,
      blockers,
      highPriorityItems: tasks.filter((t) => t.priority >= 8),
      projectClusters: clusters,
      optimizationSuggestions: suggestions,
    };
  }

  private extractThemes(tasks: Task[]): string[] {
    // Analyze task titles and descriptions for common themes
    const words = tasks.flatMap((task) =>
      `${task.title} ${task.description || ""}`.toLowerCase().split(/\s+/)
    );

    // Filter out common words and find meaningful themes
    const meaningfulWords = words.filter(
      (word) => word.length > 3 && !this.isCommonWord(word)
    );

    // Count word frequency
    const wordCounts = this.countWords(meaningfulWords);

    return Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private clusterSimilarTasks(tasks: Task[]): TaskCluster[] {
    const clusters: TaskCluster[] = [];
    const themes = this.extractThemes(tasks);

    for (const theme of themes) {
      const relatedTasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(theme) ||
          task.description?.toLowerCase().includes(theme)
      );

      if (relatedTasks.length >= 2) {
        clusters.push({
          theme: theme,
          tasks: relatedTasks,
          suggestedActions: this.generateClusterActions(relatedTasks),
        });
      }
    }

    return clusters;
  }

  private generateOptimizationSuggestions(
    tasks: Task[],
    clusters: TaskCluster[]
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Suggest grouping related tasks
    for (const cluster of clusters) {
      if (cluster.tasks.length >= 3) {
        suggestions.push({
          type: "grouping",
          description: `Consider grouping these ${cluster.theme} tasks for batch processing`,
          affectedTasks: cluster.tasks.map((t) => t.id),
          confidence: 0.7,
        });
      }
    }

    // Suggest priority adjustments
    const lowPriorityBlocking = tasks.filter(
      (task) => task.priority < 5 && this.isBlocking(task, tasks)
    );

    for (const blockingTask of lowPriorityBlocking) {
      suggestions.push({
        type: "priority",
        description: `"${blockingTask.title}" is blocking other tasks but has low priority`,
        affectedTasks: [blockingTask.id],
        confidence: 0.8,
      });
    }

    return suggestions;
  }

  private isBlocking(task: Task, allTasks: Task[]): boolean {
    // Simple heuristic - could be enhanced with dependency tracking
    return allTasks.some(
      (t) =>
        t.status === "blocked" &&
        (t.description?.includes(task.title) || t.title.includes(task.title))
    );
  }
}
```

### **6. Enhanced Databricks Service**

Integration of tools with the AI service:

```typescript
// src/lib/databricksService.ts (enhanced)
class DatabricksService {
  private toolExecutor = new AIToolExecutor();
  private intentRecognizer = new IntentRecognizer();

  async sendMessageWithTools(
    message: string,
    context: Message[] = [],
    model: string = "claude-3-5-sonnet"
  ): Promise<AIResponse> {
    try {
      // 1. Build rich context
      const aiContext = await buildAIContext();

      // 2. Analyze user intent
      const intents = this.intentRecognizer.analyzeIntent(message, aiContext);

      // 3. Enhanced system prompt with tools and context
      const systemPrompt = this.buildSystemPromptWithTools(aiContext);

      // 4. Send to AI with tool definitions and context
      const messages = [
        { role: "system", content: systemPrompt },
        ...context,
        { role: "user", content: message },
      ];

      // 5. Get AI response (potentially with tool calls)
      const aiResponse = await this.callAI(messages, model);

      // 6. Execute any tools the AI wants to use
      const toolResults = await this.executeAITools(aiResponse, intents);

      // 7. Generate final response incorporating tool results
      return await this.generateFinalResponse(aiResponse, toolResults);
    } catch (error) {
      console.error("❌ AI message with tools failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private buildSystemPromptWithTools(context: AIContext): string {
    return `You are Carole, a proactive AI task management assistant with comprehensive task tools.

CURRENT TASK CONTEXT:
- Total tasks: ${context.totalTasks}
- Top priorities: ${context.topPriorityTasks
      .map((t) => `"${t.title}" (P${t.priority})`)
      .join(", ")}
- Blocked tasks: ${context.blockedTasks.length}
- Completed today: ${context.completedToday.length}

AVAILABLE TOOLS:
You can call these functions to help the user:
- createTask(title, description, priority, tags, etc.) - Create new tasks
- updateTask(taskId, updates) - Update any task field
- changeTaskStatus(taskId, status) - Change task status (todo, in_progress, blocked, done)
- changeTaskPriority(taskId, priority) - Update priority (0-10)
- searchTasks(query) - Find tasks by content
- analyzeTasks() - Analyze patterns, themes, blockers, optimization opportunities
- markTaskComplete(taskId) - Mark task as done with celebration

TASK MATCHING:
When users mention tasks, try to identify which existing task they mean by:
1. Searching for similar titles or descriptions
2. Using context from recent conversations
3. Asking for clarification if ambiguous

BEHAVIORAL GUIDELINES:
- Always provide rich context about what you're doing and why
- Confirm significant changes before executing them
- Be proactive in suggesting improvements and optimizations
- Use natural, friendly language
- Celebrate task completions enthusiastically
- Explain your reasoning for tool calls

Current focus: ${
      context.currentTaskFocus
        ? `Discussing task "${
            context.allTasks.find((t) => t.id === context.currentTaskFocus)
              ?.title
          }"`
        : "General task management"
    }

Remember: You have full access to manage tasks, analyze patterns, and provide intelligent suggestions. Use your tools proactively to help the user stay organized and productive.`;
  }

  private async executeAITools(
    aiResponse: any,
    userIntents: UserIntent[]
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    // Execute tools requested by AI
    if (aiResponse.toolCalls) {
      for (const toolCall of aiResponse.toolCalls) {
        const result = await this.toolExecutor.executeTool(toolCall);
        results.push(result);
      }
    }

    // Execute tools based on user intent recognition
    for (const intent of userIntents) {
      if (intent.confidence > 0.7) {
        const toolCall = this.intentToToolCall(intent);
        if (toolCall) {
          const result = await this.toolExecutor.executeTool(toolCall);
          results.push(result);
        }
      }
    }

    return results;
  }

  private intentToToolCall(intent: UserIntent): ToolCall | null {
    switch (intent.type) {
      case "status_change":
        if (intent.targetTask && intent.parameters?.status) {
          return {
            tool: "changeTaskStatus",
            parameters: {
              taskId: intent.targetTask.id,
              status: intent.parameters.status,
            },
            reasoning: intent.reasoning,
          };
        }
        break;

      case "create":
        return {
          tool: "createTask",
          parameters: intent.parameters || {},
          reasoning: intent.reasoning,
        };

      // ... other intent types
    }

    return null;
  }
}
```

---

## 🎯 **Implementation Strategy**

### **Phase 2A: Core Tool System**

1. **Build AI Task Tools interface** (`aiTaskTools.ts`)
2. **Create Tool Execution Engine** (`aiToolExecutor.ts`)
3. **Implement basic intent recognition** (`intentRecognizer.ts`)
4. **Enhance Databricks Service** with tool calling

### **Phase 2B: Intelligence Features**

1. **Add Task Intelligence system** (`taskIntelligence.ts`)
2. **Implement AI Context system** (`aiContext.ts`)
3. **Build confirmation and feedback UI**
4. **Add comprehensive task analysis tools**

### **Phase 2C: Integration & Polish**

1. **Update Chat Interface** to display tool results
2. **Add user confirmation flows**
3. **Implement celebration animations** for completions
4. **Test and debug tool interactions**

---

## 🏆 **Expected Outcomes**

After Phase 2 completion, users will be able to:

- **Natural Task Management**: "Mark the website task as done" → AI finds and completes it
- **Intelligent Analysis**: "What should I work on?" → AI analyzes all tasks and suggests priorities
- **Proactive Assistance**: AI notices patterns and suggests optimizations
- **Context Awareness**: AI knows about all tasks and their relationships
- **Confirmation & Feedback**: Clear communication about what actions were taken

This architecture transforms Carole from a passive chat interface into an active, intelligent task management partner with comprehensive capabilities and awareness.

---

_This document serves as the technical specification for Phase 2 implementation._
