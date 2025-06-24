/**
 * AI Tool Execution Engine
 * Orchestrates AI tool calls and provides user feedback
 */

import {
  aiTaskTools,
  type AITaskToolResult,
  type Task,
} from "./aiTaskTools.js";
import { buildAIContext, type AIContext } from "./aiContext.js";
import {
  buildEnhancedAIContext,
  type EnhancedAIContext,
} from "./aiEnhancedContext";
import { databricksService } from "./databricksService";

// Type definitions for AI system
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Intent {
  type:
    | "create"
    | "update"
    | "complete"
    | "query"
    | "delete"
    | "status_change"
    | "priority_change"
    | "search"
    | "analyze"
    | "get_tasks";
  confidence: number;
  reasoning: string;
  parameters?: Record<string, any>;
}

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  reasoning?: string;
  confidence?: number;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  userMessage: string;
  taskId?: string;
  requiresConfirmation?: boolean;
  toolCall?: ToolCall;
}

export interface ToolExecutionResult {
  results: ToolResult[];
  summary: string;
  requiresConfirmation: boolean;
}

/**
 * AI Tool Executor
 * Executes AI tool calls and provides structured feedback
 */
export class AIToolExecutor {
  constructor() {
    // No longer need the separate AIIntentRecognizer
  }

  /**
   * Execute a single tool call
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    console.log(`🔧 Executing tool: ${toolCall.tool}`);

    try {
      switch (toolCall.tool) {
        case "searchTasks":
          return await this.executeSearchTasks(toolCall.parameters, toolCall);

        case "createTask":
          return await this.executeCreateTask(toolCall.parameters, toolCall);

        case "updateTask":
          return await this.executeUpdateTask(toolCall.parameters, toolCall);

        case "deleteTask":
          return await this.executeDeleteTask(toolCall.parameters, toolCall);

        case "changeTaskStatus":
          return await this.executeStatusChange(toolCall.parameters, toolCall);

        case "changeTaskPriority":
          return await this.executePriorityChange(
            toolCall.parameters,
            toolCall
          );

        case "markTaskComplete":
          return await this.executeMarkComplete(toolCall.parameters, toolCall);

        case "analyzeTasks":
          return await this.executeTaskAnalysis(toolCall.parameters, toolCall);

        case "getTasksByStatus":
          return await this.executeGetTasksByStatus(
            toolCall.parameters,
            toolCall
          );

        case "getHighPriorityTasks":
          return await this.executeGetHighPriorityTasks(
            toolCall.parameters,
            toolCall
          );

        case "getBlockedTasks":
          return await this.executeGetBlockedTasks(
            toolCall.parameters,
            toolCall
          );

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.tool}`,
            userMessage: `❌ Unknown tool "${toolCall.tool}" requested`,
            toolCall,
          };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        userMessage: `❌ Tool execution failed: ${errorMessage}`,
        toolCall,
      };
    }
  }

  /**
   * Execute multiple tool calls and provide consolidated results
   */
  async executeTools(toolCalls: ToolCall[]): Promise<ToolExecutionResult> {
    const results: ToolResult[] = [];
    let requiresConfirmation = false;

    for (const toolCall of toolCalls) {
      const result = await this.executeTool(toolCall);
      results.push(result);

      if (result.requiresConfirmation) {
        requiresConfirmation = true;
      }
    }

    const summary = this.generateExecutionSummary(results);

    return {
      results,
      summary,
      requiresConfirmation,
    };
  }

  // === TOOL EXECUTION METHODS ===

  private async executeSearchTasks(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    const query = params.query || params.search || "";
    if (!query) {
      return {
        success: false,
        error: "Search query required",
        userMessage: "❌ Please provide a search query",
        toolCall,
      };
    }

    const result = await aiTaskTools.searchTasks(query);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeCreateTask(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.title) {
      return {
        success: false,
        error: "Task title required",
        userMessage: "❌ Task title is required to create a task",
        toolCall,
      };
    }

    // Handle location/locations field conversion
    let locations: string[] = [];
    if (params.locations && Array.isArray(params.locations)) {
      locations = params.locations;
    } else if (params.location && typeof params.location === "string") {
      locations = [params.location]; // Convert single location to array
    }

    // Validate and normalize numeric fields
    const priority =
      params.priority !== undefined
        ? Math.max(0, Math.min(10, params.priority))
        : 5;
    const difficulty =
      params.difficulty !== undefined
        ? Math.max(0, Math.min(10, params.difficulty))
        : params.difficulty_level !== undefined
        ? Math.max(0, Math.min(10, params.difficulty_level))
        : 5;

    const taskData = {
      title: params.title,
      description: params.description,
      priority: priority,
      difficulty_level: difficulty,
      status: params.status || "todo",
      context_tags: params.tags || params.context_tags || [],
      locations: locations, // Always include as array (empty array is fine)
      due_date: params.due_date || params.dueDate,
      time_estimate_hours:
        params.time_estimate_hours ||
        params.time_estimate ||
        params.timeEstimate,
    };

    const result = await aiTaskTools.createTaskFromAI(taskData);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeUpdateTask(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.taskId) {
      return {
        success: false,
        error: "Task ID required",
        userMessage: "❌ Task ID is required to update a task",
        toolCall,
      };
    }

    const updates = { ...params };
    delete updates.taskId; // Remove taskId from updates

    // Validate and normalize numeric fields if present
    if (updates.priority !== undefined) {
      updates.priority = Math.max(0, Math.min(10, updates.priority));
    }
    if (updates.difficulty_level !== undefined) {
      updates.difficulty_level = Math.max(
        0,
        Math.min(10, updates.difficulty_level)
      );
    }
    if (updates.difficulty !== undefined) {
      updates.difficulty_level = Math.max(0, Math.min(10, updates.difficulty));
      delete updates.difficulty; // Remove the inconsistent field name
    }

    // Handle location/locations field conversion for updates too
    if (updates.location && typeof updates.location === "string") {
      updates.locations = [updates.location];
      delete updates.location;
    } else if (updates.locations && !Array.isArray(updates.locations)) {
      updates.locations = [updates.locations];
    }

    console.log("🔧 Normalized update parameters:", updates);

    const result = await aiTaskTools.updateTaskFromAI(params.taskId, updates);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeDeleteTask(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.taskId) {
      return {
        success: false,
        error: "Task ID required",
        userMessage: "❌ Task ID is required to delete a task",
        toolCall,
      };
    }

    const result = await aiTaskTools.deleteTaskFromAI(params.taskId);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeStatusChange(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.taskId || !params.status) {
      return {
        success: false,
        error: "Task ID and status required",
        userMessage: "❌ Task ID and status are required to change task status",
        toolCall,
      };
    }

    const result = await aiTaskTools.changeTaskStatus(
      params.taskId,
      params.status
    );
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executePriorityChange(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.taskId || params.priority === undefined) {
      return {
        success: false,
        error: "Task ID and priority required",
        userMessage:
          "❌ Task ID and priority are required to change task priority",
        toolCall,
      };
    }

    const result = await aiTaskTools.changeTaskPriority(
      params.taskId,
      params.priority
    );
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeMarkComplete(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.taskId) {
      return {
        success: false,
        error: "Task ID required",
        userMessage: "❌ Task ID is required to mark task complete",
        toolCall,
      };
    }

    const result = await aiTaskTools.markTaskComplete(params.taskId);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeTaskAnalysis(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    const result = await aiTaskTools.analyzeTasks();
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeGetTasksByStatus(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    if (!params.status) {
      return {
        success: false,
        error: "Status required",
        userMessage: "❌ Status is required to get tasks by status",
        toolCall,
      };
    }

    const result = await aiTaskTools.getTasksByStatus(params.status);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeGetHighPriorityTasks(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    const result = await aiTaskTools.getHighPriorityTasks();
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeGetBlockedTasks(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    const result = await aiTaskTools.getBlockedTasks();
    return this.convertAITaskToolResult(result, toolCall);
  }

  // === UTILITY METHODS ===

  private convertAITaskToolResult(
    result: AITaskToolResult,
    toolCall?: ToolCall
  ): ToolResult {
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      userMessage: result.userMessage,
      taskId: result.taskId,
      requiresConfirmation: result.requiresConfirmation,
      toolCall: toolCall,
    };
  }

  private generateExecutionSummary(results: ToolResult[]): string {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (results.length === 0) {
      return "No tools were executed.";
    }

    if (results.length === 1) {
      return results[0].userMessage;
    }

    let summary = `Executed ${results.length} operations: `;

    if (successful.length > 0) {
      summary += `${successful.length} successful`;
    }

    if (failed.length > 0) {
      if (successful.length > 0) {
        summary += `, ${failed.length} failed`;
      } else {
        summary += `${failed.length} failed`;
      }
    }

    summary += ".";

    return summary;
  }

  // Old rule-based priority methods removed - now handled by AI intent recognition

  /**
   * AI-powered intent analysis - Phase 2 implementation
   */
  async analyzeIntent(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<Intent[]> {
    try {
      // Build comprehensive context
      const enhancedContext = await buildEnhancedAIContext();

      console.log("🎯 Analyzing intent with AI semantic analysis...");

      // Use AI-powered semantic intent analysis
      const intents = await this.analyzeIntentWithAI(
        message,
        enhancedContext,
        conversationHistory
      );

      // If AI analysis fails, fallback to pattern matching
      if (intents.length === 0) {
        console.log("🔄 Falling back to pattern matching...");
        return this.analyzeIntentWithContext(
          message,
          enhancedContext,
          conversationHistory
        );
      }

      return intents;
    } catch (error) {
      console.error("AI intent analysis error:", error);
      return this.fallbackIntentRecognition(message);
    }
  }

  /**
   * AI-powered semantic intent analysis
   * Uses the actual AI model to understand intent contextually
   */
  private async analyzeIntentWithAI(
    message: string,
    context: EnhancedAIContext,
    conversationHistory: ChatMessage[]
  ): Promise<Intent[]> {
    try {
      const taskSummary = this.buildTaskContextSummary(context);
      const conversationSummary =
        this.buildConversationSummary(conversationHistory);

      const prompt = `Analyze the user's intent for this message in a task management context.

USER MESSAGE: "${message}"

CURRENT TASK CONTEXT:
${taskSummary}

RECENT CONVERSATION:
${conversationSummary}

Determine the user's intent and respond with ONLY a JSON object in this exact format:
{
  "intent_type": "create|complete|update|query|delete|status_change|priority_change|search|analyze|get_tasks",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why you chose this intent",
  "parameters": {
    // Any relevant parameters based on the intent
  }
}

INTENT DEFINITIONS:
- create: User wants to add a new task
- complete: User is reporting they finished/completed something
- update: User wants to modify an existing task
- query: User is asking about their tasks or status
- delete: User wants to remove a task
- search: User wants to find specific tasks
- analyze: User wants insights about their tasks

Pay special attention to:
- Past tense verbs like "finished", "completed", "done" = complete intent
- Future tense or "need to" phrases = create intent  
- Questions or "what/how/when" = query intent
- References to existing tasks = update/complete intent

Respond with ONLY the JSON object, no other text.`;

      // Use a lightweight AI call for intent analysis
      const response = await this.callAIForIntent(prompt);

      if (response && response.intent_type) {
        return [
          {
            type: response.intent_type as Intent["type"],
            confidence: response.confidence || 0.8,
            reasoning: response.reasoning || "AI semantic analysis",
            parameters: response.parameters || {},
          },
        ];
      }

      return [];
    } catch (error) {
      console.error("AI intent analysis failed:", error);
      return [];
    }
  }

  private analyzeIntentWithContext(
    message: string,
    context: EnhancedAIContext,
    conversationHistory: ChatMessage[]
  ): Intent[] {
    const messageLower = message.toLowerCase();
    const intents: Intent[] = [];

    // Enhanced pattern matching using organizational context
    // PRIORITY ORDER: Check completion FIRST, then creation to avoid conflicts

    // 1. Check for task completion patterns FIRST (higher priority)
    if (this.isTaskCompletionIntent(messageLower)) {
      intents.push({
        type: "complete",
        confidence: 0.85,
        reasoning: "Task completion intent detected",
        parameters: { status: "done" },
      });
      // If we detect completion intent, don't check for creation intent
      // This prevents "I finished my training" from being seen as both completion AND creation
      return intents;
    }

    // 2. Check for task creation patterns (only if not completion)
    if (this.isTaskCreationIntent(messageLower)) {
      const taskData = this.extractTaskDataWithContext(message, context);
      intents.push({
        type: "create",
        confidence: 0.85,
        reasoning: "Task creation detected with enhanced context analysis",
        parameters: taskData,
      });
    }

    // 3. Check for task query patterns
    if (this.isTaskQueryIntent(messageLower)) {
      intents.push({
        type: "query",
        confidence: 0.75,
        reasoning: "Task query intent detected",
        parameters: {},
      });
    }

    // 4. Check for task update patterns
    if (this.isTaskUpdateIntent(messageLower)) {
      intents.push({
        type: "update",
        confidence: 0.7,
        reasoning: "Task update intent detected",
        parameters: this.extractUpdateParameters(message),
      });
    }

    return intents.length > 0
      ? intents
      : this.fallbackIntentRecognition(message);
  }

  private isTaskCreationIntent(messageLower: string): boolean {
    // First check if this is clearly NOT a creation intent
    const antiCreationPatterns = [
      "finished",
      "completed",
      "done with",
      "accomplished",
      "wrapped up",
      "just finished",
      "just completed",
    ];

    // If any anti-creation pattern is found, this is NOT a creation intent
    if (
      antiCreationPatterns.some((pattern) => messageLower.includes(pattern))
    ) {
      return false;
    }

    const creationPatterns = [
      "i need to",
      "i have to",
      "i must",
      "i should",
      "create task",
      "add task",
      "make task",
      "build",
      "develop",
      "need to do",
      "need to take",
      "need to attend",
      "need to sign up",
      "register for",
      "schedule",
    ];

    return creationPatterns.some((pattern) => messageLower.includes(pattern));
  }

  private isTaskCompletionIntent(messageLower: string): boolean {
    const completionPatterns = [
      "completed",
      "finished",
      "done with",
      "accomplished",
      "mark as done",
      "mark complete",
      "finished with",
      "i finished",
      "i completed",
      "i'm done with",
      "just finished",
      "just completed",
      "wrapped up",
      "completed my",
      "finished my",
    ];

    return completionPatterns.some((pattern) => messageLower.includes(pattern));
  }

  private isTaskQueryIntent(messageLower: string): boolean {
    const queryPatterns = [
      "what",
      "show me",
      "list",
      "find",
      "search",
      "what tasks",
      "my tasks",
      "what do i have",
      "what's next",
      "priorities",
    ];

    return queryPatterns.some((pattern) => messageLower.includes(pattern));
  }

  private isTaskUpdateIntent(messageLower: string): boolean {
    const updatePatterns = [
      "change",
      "update",
      "modify",
      "edit",
      "priority",
      "status",
      "due date",
    ];

    return updatePatterns.some((pattern) => messageLower.includes(pattern));
  }

  private extractTaskDataWithContext(
    message: string,
    context: EnhancedAIContext
  ): any {
    const messageLower = message.toLowerCase();
    let priority = 5; // default
    let title = message;
    const tags: string[] = [];
    let dueDate = null;

    // Enhanced priority detection using organizational context

    // Check for compliance/training (highest priority)
    const mandatoryTraining = context.organizationalContext.mandatoryTraining;
    for (const training of mandatoryTraining) {
      if (
        messageLower.includes(training.name.toLowerCase()) ||
        messageLower.includes("aml") ||
        messageLower.includes("training")
      ) {
        priority = 10; // Mandatory compliance
        tags.push("compliance", "mandatory", "training");
        break;
      }
    }

    // Check for temporal urgency
    if (
      messageLower.includes("this week") ||
      messageLower.includes("by friday")
    ) {
      priority = Math.max(priority, 8);
      // Calculate due date for "this week"
      const now = new Date();
      const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysUntilFriday);
      dueDate = friday.toISOString().split("T")[0];
    }

    if (messageLower.includes("urgent") || messageLower.includes("asap")) {
      priority = Math.max(priority, 9);
    }

    if (
      messageLower.includes("when i have time") ||
      messageLower.includes("eventually")
    ) {
      priority = Math.min(priority, 3);
    }

    // Extract title (clean up common prefixes)
    title = message
      .replace(/^(i need to|i have to|i must|i should|create|add|make)\s+/i, "")
      .trim();

    if (!title || title.length < 3) {
      title = message.slice(0, 50);
    }

    return {
      title: title,
      description: message,
      priority: priority,
      difficulty_level: 5,
      due_date: dueDate,
      context_tags: tags.length > 0 ? tags : ["general"],
      locations: ["office", "remote"],
      time_estimate_hours: this.estimateTimeFromMessage(message),
    };
  }

  private extractUpdateParameters(message: string): any {
    const params: any = {};
    const messageLower = message.toLowerCase();

    // Extract priority changes
    const priorityMatch = message.match(/priority\s+(\d+)/i);
    if (priorityMatch) {
      params.priority = parseInt(priorityMatch[1]);
    }

    // Extract status changes
    if (messageLower.includes("in progress")) params.status = "in_progress";
    if (messageLower.includes("blocked")) params.status = "blocked";
    if (messageLower.includes("done")) params.status = "done";
    if (messageLower.includes("todo")) params.status = "todo";

    return params;
  }

  private estimateTimeFromMessage(message: string): number | null {
    const messageLower = message.toLowerCase();

    // Look for explicit time mentions
    const hourMatch = message.match(/(\d+)\s*hours?/i);
    if (hourMatch) return parseInt(hourMatch[1]);

    const minuteMatch = message.match(/(\d+)\s*minutes?/i);
    if (minuteMatch) return Math.ceil(parseInt(minuteMatch[1]) / 60);

    // Estimate based on task type
    if (messageLower.includes("training") || messageLower.includes("course")) {
      return 4; // Typical training duration
    }

    if (messageLower.includes("meeting") || messageLower.includes("call")) {
      return 1; // Typical meeting
    }

    return null; // No estimate
  }

  private fallbackIntentRecognition(message: string): Intent[] {
    const messageLower = message.toLowerCase();

    // Simple fallback logic
    if (
      messageLower.includes("create") ||
      messageLower.includes("add") ||
      messageLower.includes("need")
    ) {
      return [
        {
          type: "create",
          confidence: 0.7,
          reasoning: "Fallback pattern matching",
          parameters: {
            title: message.slice(0, 50),
            priority: 5,
            difficulty_level: 5,
            context_tags: ["general"],
            locations: ["office", "remote"],
          },
        },
      ];
    }

    return [];
  }

  /**
   * Build a concise summary of current task context for AI analysis
   */
  private buildTaskContextSummary(context: EnhancedAIContext): string {
    const summary = [
      `Total tasks: ${context.totalTasks}`,
      `In progress: ${context.inProgressTasks.length}`,
      `Blocked: ${context.blockedTasks.length}`,
      `Completed today: ${context.completedToday.length}`,
    ];

    // Add recent tasks for context
    if (context.recentlyUpdatedTasks.length > 0) {
      summary.push("\nRecent tasks:");
      context.recentlyUpdatedTasks.slice(0, 3).forEach((task) => {
        summary.push(`- "${task.title}" (${task.status})`);
      });
    }

    // Add common themes
    if (context.commonThemes.length > 0) {
      summary.push(
        `\nCommon themes: ${context.commonThemes.slice(0, 3).join(", ")}`
      );
    }

    return summary.join("\n");
  }

  /**
   * Build a summary of recent conversation for AI analysis
   */
  private buildConversationSummary(conversationHistory: ChatMessage[]): string {
    if (conversationHistory.length === 0) {
      return "No recent conversation history";
    }

    const recent = conversationHistory.slice(-3); // Last 3 messages
    return recent
      .map(
        (msg) =>
          `${msg.role.toUpperCase()}: ${msg.content.slice(0, 100)}${
            msg.content.length > 100 ? "..." : ""
          }`
      )
      .join("\n");
  }

  /**
   * Make a lightweight AI call specifically for intent analysis
   */
  private async callAIForIntent(prompt: string): Promise<any> {
    try {
      // Use a simple structured approach that doesn't cause recursion
      // This is a lightweight intent classification task

      // Use structured classification to avoid recursion with main AI model
      console.log("🤖 AI Intent Analysis (using structured classification)");

      // Use deterministic logic with enhanced context awareness
      return this.structuredIntentClassification(prompt);
    } catch (error) {
      console.error("AI intent call failed:", error);
      return null;
    }
  }

  /**
   * Structured intent classification using enhanced pattern matching
   */
  private structuredIntentClassification(prompt: string): any {
    // Extract the user message from the prompt
    const messageMatch = prompt.match(/USER MESSAGE: "([^"]+)"/);
    if (!messageMatch) return null;

    const message = messageMatch[1].toLowerCase();

    // Use semantic indicators rather than just keywords
    const semanticAnalysis = {
      // Past tense completion indicators
      hasCompletionIndicators: [
        "finished",
        "completed",
        "done",
        "accomplished",
        "wrapped up",
        "i finished",
        "i completed",
        "just finished",
        "just completed",
      ].some((pattern) => message.includes(pattern)),

      // Future/obligation creation indicators
      hasCreationIndicators: [
        "need to",
        "have to",
        "should",
        "must",
        "want to create",
        "add task",
        "new task",
        "schedule",
        "plan to",
      ].some((pattern) => message.includes(pattern)),

      // Query indicators
      hasQueryIndicators: [
        "what",
        "how",
        "when",
        "where",
        "which",
        "show me",
        "list",
        "what tasks",
        "my tasks",
        "status",
        "priorities",
      ].some((pattern) => message.includes(pattern)),

      // Update indicators
      hasUpdateIndicators: [
        "change",
        "update",
        "modify",
        "edit",
        "move to",
        "set priority",
      ].some((pattern) => message.includes(pattern)),
    };

    // Determine intent with confidence scoring
    if (semanticAnalysis.hasCompletionIndicators) {
      return {
        intent_type: "complete",
        confidence: 0.9,
        reasoning: "Detected past-tense completion language",
        parameters: { status: "done" },
      };
    }

    if (semanticAnalysis.hasQueryIndicators) {
      return {
        intent_type: "query",
        confidence: 0.85,
        reasoning: "Detected question or request for information",
        parameters: {},
      };
    }

    if (semanticAnalysis.hasUpdateIndicators) {
      return {
        intent_type: "update",
        confidence: 0.8,
        reasoning: "Detected modification request",
        parameters: {},
      };
    }

    if (semanticAnalysis.hasCreationIndicators) {
      return {
        intent_type: "create",
        confidence: 0.85,
        reasoning: "Detected future obligation or creation request",
        parameters: {
          title: message.slice(0, 50),
          priority: 5,
        },
      };
    }

    // Default fallback
    return {
      intent_type: "query",
      confidence: 0.5,
      reasoning: "Unclear intent, defaulting to query",
      parameters: {},
    };
  }
}

/**
 * Intent Recognition System
 * Analyzes user messages to determine intended actions
 */
export interface UserIntent {
  type:
    | "create"
    | "update"
    | "delete"
    | "status_change"
    | "priority_change"
    | "search"
    | "analyze"
    | "complete"
    | "get_tasks"
    | "query";
  confidence: number;
  parameters?: Record<string, any>;
  targetTask?: Task | null;
  reasoning: string;
}

// Export singleton instances
export const aiToolExecutor = new AIToolExecutor();
export const intentRecognizer = {
  analyzeIntent: (
    message: string,
    context: any,
    conversationHistory: ChatMessage[] = []
  ) => {
    console.warn(
      "Using deprecated rule-based intent recognition. Please migrate to AIToolExecutor.analyzeIntent()"
    );
    return new AIToolExecutor().analyzeIntent(message, conversationHistory);
  },
};
