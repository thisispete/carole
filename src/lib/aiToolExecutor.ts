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
  private isInIntentAnalysis = false; // Prevent circular calls

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

    // First, get the current task to handle array operations efficiently
    const currentTask = await aiTaskTools.getTaskById(params.taskId);

    if (!currentTask) {
      return {
        success: false,
        error: "Task not found",
        userMessage: "❌ Task not found for update",
        toolCall,
      };
    }

    const updates = { ...params };
    delete updates.taskId; // Remove taskId from updates

    // Handle smart array operations for context_tags
    if (params.context_tags_operation && params.context_tags) {
      const currentTags = currentTask.context_tags || [];
      const newTags = params.context_tags;

      switch (params.context_tags_operation) {
        case "add":
          // Add new tags to existing ones (avoid duplicates)
          updates.context_tags = [
            ...currentTags,
            ...newTags.filter((tag: string) => !currentTags.includes(tag)),
          ];
          break;
        case "remove":
          // Remove specified tags from existing ones
          updates.context_tags = currentTags.filter(
            (tag: string) => !newTags.includes(tag)
          );
          break;
        case "replace":
          // Replace entire array
          updates.context_tags = newTags;
          break;
        default:
          // Default to replace if operation is unclear
          updates.context_tags = newTags;
      }

      // Clean up operation parameter
      delete updates.context_tags_operation;
    }

    // Handle smart array operations for locations
    if (params.locations_operation && params.locations) {
      const currentLocations = currentTask.locations || [];
      const newLocations = params.locations;

      switch (params.locations_operation) {
        case "add":
          // Add new locations to existing ones (avoid duplicates)
          updates.locations = [
            ...currentLocations,
            ...newLocations.filter(
              (location: string) => !currentLocations.includes(location)
            ),
          ];
          break;
        case "remove":
          // Remove specified locations from existing ones
          updates.locations = currentLocations.filter(
            (location: string) => !newLocations.includes(location)
          );
          break;
        case "replace":
          // Replace entire array
          updates.locations = newLocations;
          break;
        default:
          // Default to replace if operation is unclear
          updates.locations = newLocations;
      }

      // Clean up operation parameter
      delete updates.locations_operation;
    }

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

    // Handle location/locations field conversion for backward compatibility
    if (updates.location && typeof updates.location === "string") {
      updates.locations = [updates.location];
      delete updates.location;
    } else if (updates.locations && !Array.isArray(updates.locations)) {
      updates.locations = [updates.locations];
    }

    // CRITICAL: Filter out undefined, null, and empty values to prevent overwriting existing data
    const filteredUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      // Only include fields that have actual values
      if (value !== undefined && value !== null && value !== "") {
        // For arrays, only include if they have content or if we explicitly set them
        if (Array.isArray(value)) {
          if (
            value.length > 0 ||
            key === "context_tags" ||
            key === "locations"
          ) {
            filteredUpdates[key] = value;
          }
        } else {
          filteredUpdates[key] = value;
        }
      }
    }

    console.log("🔧 Original update parameters:", updates);
    console.log("🔧 Filtered update parameters:", filteredUpdates);

    const result = await aiTaskTools.updateTaskFromAI(
      params.taskId,
      filteredUpdates
    );
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
    // Support both taskId and target_task_id from AI context resolution
    const taskId = params.taskId || params.target_task_id;

    if (!taskId || !params.status) {
      return {
        success: false,
        error: "Task ID and status required",
        userMessage:
          "❌ Could not identify which task to update. Please be more specific about which task you want to change.",
        toolCall,
      };
    }

    const result = await aiTaskTools.changeTaskStatus(taskId, params.status);
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executePriorityChange(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    // Support both taskId and target_task_id from AI context resolution
    const taskId = params.taskId || params.target_task_id;

    if (!taskId || params.priority === undefined) {
      return {
        success: false,
        error: "Task ID and priority required",
        userMessage:
          "❌ Could not identify which task to update or what priority to set. Please be more specific.",
        toolCall,
      };
    }

    const result = await aiTaskTools.changeTaskPriority(
      taskId,
      params.priority
    );
    return this.convertAITaskToolResult(result, toolCall);
  }

  private async executeMarkComplete(
    params: any,
    toolCall: ToolCall
  ): Promise<ToolResult> {
    // Support both taskId and target_task_id from AI context resolution
    const taskId = params.taskId || params.target_task_id;

    if (!taskId) {
      return {
        success: false,
        error: "Task ID required",
        userMessage:
          "❌ Could not identify which task to mark complete. Please be more specific about which task you finished.",
        toolCall,
      };
    }

    const result = await aiTaskTools.markTaskComplete(taskId);
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
    // Prevent circular calls during intent analysis
    if (this.isInIntentAnalysis) {
      console.warn("🔄 Circular call detected - returning simple query intent");
      return [
        {
          type: "query",
          confidence: 0.1,
          reasoning: "Circular call prevention - defaulting to query",
          parameters: {},
        },
      ];
    }

    try {
      this.isInIntentAnalysis = true;

      // Build comprehensive context (simple version to avoid circular calls)
      console.log("🧠 Building enhanced AI context for intent analysis...");
      const enhancedContext = await buildEnhancedAIContext();

      console.log("🎯 Analyzing intent with AI semantic analysis...");

      // Use AI-powered semantic intent analysis ONLY
      const intents = await this.analyzeIntentWithAI(
        message,
        enhancedContext,
        conversationHistory
      );

      console.log("🔍 AI Intent Analysis Results:");
      console.log("  Detected intents:", intents.length);
      intents.forEach((intent, i) => {
        console.log(`  Intent ${i + 1}:`, {
          type: intent.type,
          confidence: intent.confidence,
          reasoning: intent.reasoning,
          parameters: intent.parameters,
        });
      });

      // If AI analysis fails, return error - NO FALLBACKS
      if (intents.length === 0) {
        console.error("❌ AI intent analysis returned no results");
        throw new Error(
          "I'm having trouble understanding what you want to do. Could you please rephrase your request more clearly?"
        );
      }

      return intents;
    } catch (error) {
      console.error("❌ AI intent analysis failed completely:", error);

      // Re-throw with user-friendly message if it's our error
      if (
        error instanceof Error &&
        error.message.includes("I'm having trouble")
      ) {
        throw error; // Pass through our user-friendly error
      }

      throw new Error(
        "I'm experiencing technical difficulties and can't understand your request right now. Please try again in a moment."
      );
    } finally {
      this.isInIntentAnalysis = false; // Always reset flag
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

      const prompt = `You are an expert at understanding user intentions for task management. Analyze the user's message and provide a precise, structured response.

CURRENT DATE: ${
        new Date().toISOString().split("T")[0]
      } (${new Date().toLocaleDateString("en-US", { weekday: "long" })})

USER MESSAGE: "${message}"

CURRENT TASK CONTEXT:
${taskSummary}

RECENT CONVERSATION:
${conversationSummary}

IMPORTANT INSTRUCTIONS:
1. For task creation, extract a CONCISE, CLEAR title (not the whole message)
2. For references to "that task", "it", "this", resolve to the most relevant recent task
3. Be precise about intent - don't guess if unclear
4. For ambiguous requests, set confidence lower and explain why
5. For date parsing: "Friday" means NEXT Friday from current date, "Monday" means NEXT Monday, etc.
6. Always calculate dates relative to the CURRENT DATE provided above
7. MULTI-OPERATION REQUESTS: When user asks for multiple changes (e.g., "add tag and set priority"), include ALL requested changes in parameters
8. PARTIAL UPDATES: Only include fields that are explicitly mentioned - do not include empty or default values

Respond with ONLY a JSON object in this exact format:
{
  "intent_type": "create|complete|update|query|delete|status_change|priority_change|search|analyze|get_tasks",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why you chose this intent and confidence level",
  "parameters": {
    // For create intent, always include:
    "title": "Concise, actionable task title (e.g., 'Budget Review' not 'I need to review the budget', 'Call Dentist' not 'I should call the dentist', 'Quarterly Report' not 'I need to finish the quarterly report')",
    "description": "Full original message as context",
    "priority": 1-10,
    "difficulty_level": 1-10,
    "due_date": "YYYY-MM-DD or null",
    "time_estimate_hours": number_or_null,
    "context_tags": ["relevant", "tags"],
    "locations": ["office", "remote", "home"],
    
    // For update/complete intents, include:
    "target_task_id": "resolved_task_id_if_reference_found",
    "status": "new_status_if_applicable",
    "priority": "new_priority_if_applicable",
    "due_date": "YYYY-MM-DD format or null",
    "context_tags": ["new", "tags", "to", "add"],
    "description": "updated_description_if_provided",
    "time_estimate_hours": number_or_null,
    "difficulty_level": 1-10,
    "locations": ["location", "updates"]
  }
}

EXAMPLES:
- "I need to review the budget" → intent: "create", title: "Budget Review", priority: 5
- "I should call the dentist" → intent: "create", title: "Call Dentist", priority: 6
- "I need to finish the quarterly report" → intent: "create", title: "Quarterly Report", priority: 7
- "Create a task for testing the new feature" → intent: "create", title: "Test New Feature", priority: 5
- "Mark that task as done" → intent: "complete", target_task_id: "most_recent_task_id"
- "Make it high priority" → intent: "priority_change", target_task_id: "referenced_task_id", priority: 8
- "Change task priority from 6 to 8" → intent: "priority_change", priority: 8
- "Set that to priority 9" → intent: "priority_change", priority: 9
- "Make it urgent" → intent: "priority_change", priority: 9
- "I need to call dentist by Friday" → intent: "update", due_date: "YYYY-MM-DD (calculate next Friday from current date)", target_task_id: "dentist_task_id"
- "Add health tag to that task" → intent: "update", context_tags_operation: "add", context_tags: ["health"], target_task_id: "task_id"
- "Remove work tag from that task" → intent: "update", context_tags_operation: "remove", context_tags: ["work"], target_task_id: "task_id"
- "Set tags to health and urgent" → intent: "update", context_tags_operation: "replace", context_tags: ["health", "urgent"], target_task_id: "task_id"
- "Add teeth as a tag" → intent: "update", context_tags_operation: "add", context_tags: ["teeth"], target_task_id: "task_id"
- "add teeth tag" → intent: "update", context_tags_operation: "add", context_tags: ["teeth"], target_task_id: "task_id"
- "tag it with teeth" → intent: "update", context_tags_operation: "add", context_tags: ["teeth"], target_task_id: "task_id"
- "add 'teeth' as a tag" → intent: "update", context_tags_operation: "add", context_tags: ["teeth"], target_task_id: "task_id"
- "tag that with teeth and set priority to 8" → intent: "update", context_tags_operation: "add", context_tags: ["teeth"], priority: 8, target_task_id: "task_id"
- "add urgent tag and make it due Friday" → intent: "update", context_tags_operation: "add", context_tags: ["urgent"], due_date: "YYYY-MM-DD", target_task_id: "task_id"
- "Change description to new details" → intent: "update", description: "new details", target_task_id: "task_id"
- "This should take 2 hours" → intent: "update", time_estimate_hours: 2, target_task_id: "task_id"
- "Make it difficulty level 8" → intent: "update", difficulty_level: 8, target_task_id: "task_id"
- "Add office location" → intent: "update", locations_operation: "add", locations: ["office"], target_task_id: "task_id"
- "Remove home from locations" → intent: "update", locations_operation: "remove", locations: ["home"], target_task_id: "task_id"
- "Set locations to office and home" → intent: "update", locations_operation: "replace", locations: ["office", "home"], target_task_id: "task_id"
- "Rename task to New Name" → intent: "update", title: "New Name", target_task_id: "task_id"

ARRAY OPERATION RULES:
For context_tags and locations fields, ALWAYS specify the operation:
- "add" → Add new items to existing array (don't replace existing)
- "remove" → Remove specified items from existing array
- "replace" → Replace entire array with new values
- If user says "add X", "include Y", "also Z" → use "add" operation
- If user says "remove X", "delete Y", "take out Z" → use "remove" operation
- If user says "set to X", "change to Y", "make it Z" → use "replace" operation

INTENT DEFINITIONS:
- create: User wants to add a new task (look for "I need to", "I should", "I have to", future tense)
- complete: User reporting completion (look for "finished", "done", "completed", past tense)
- update: User wants to modify existing task details (general changes like title, description, etc.)
- query: User asking questions about tasks
- status_change: User wants to change task status (todo, in_progress, done, blocked, backlog)
- priority_change: User wants to change task priority (look for "priority", "urgent", "important", "high priority", "low priority", numbers like "p6 to p8")
- search: User wants to find specific tasks
- analyze: User wants insights about their tasks

PRIORITY KEYWORDS:
- "priority" (any form), "urgent", "important", "critical", "rush", "asap"
- Numbers like "p6", "p8", "priority 6", "priority 8"
- "high priority", "low priority", "medium priority"
- "make it urgent", "not urgent", "can wait"

CONTEXT RESOLUTION:
- "that task" → Look for most recently mentioned task in conversation
- "it" → Resolve to task being discussed
- "this" → Current task in focus
- "the dentist task" → Find task with "dentist" in title
- "my presentation" → Find task with "presentation" in title
- If multiple matches, choose most recent or ask for clarification
- If no clear match, set confidence < 0.6 and explain in reasoning

Respond with ONLY the JSON object.`;

      // Use the LLM for sophisticated intent analysis
      const response = await this.callAIForIntent(prompt);

      if (response && response.intent_type) {
        // Enhance the response with additional context resolution
        const intent: Intent = {
          type: response.intent_type as Intent["type"],
          confidence: response.confidence || 0.8,
          reasoning: response.reasoning || "AI semantic analysis",
          parameters: response.parameters || {},
        };

        // For context resolution, use additional AI call if needed
        if (
          intent.type === "complete" ||
          intent.type === "update" ||
          intent.type === "priority_change" ||
          intent.type === "status_change"
        ) {
          console.log("🔍 Resolving task context for intent:", intent.type);
          console.log("🔍 Original intent parameters:", intent.parameters);

          const contextualIntent = await this.resolveTaskContext(
            intent,
            message,
            context,
            conversationHistory
          );

          console.log(
            "🔍 Resolved intent parameters:",
            contextualIntent.parameters
          );
          return [contextualIntent];
        }

        return [intent];
      }

      return [];
    } catch (error) {
      console.error("AI intent analysis failed:", error);
      return [];
    }
  }

  /**
   * Use AI to resolve task context for pronouns and references
   */
  private async resolveTaskContext(
    intent: Intent,
    message: string,
    context: EnhancedAIContext,
    conversationHistory: ChatMessage[]
  ): Promise<Intent> {
    try {
      // Get ALL tasks, not just recent ones, for better task name resolution
      const allTasks = context.allTasks || [];
      const recentTasks = context.recentlyUpdatedTasks.slice(0, 5);
      const conversationSummary =
        this.buildConversationSummary(conversationHistory);

      const prompt = `You are resolving task references in a conversation. The user said: "${message}"

ALL AVAILABLE TASKS:
${allTasks
  .map(
    (task) =>
      `- ID: ${task.id}, Title: "${task.title}", Status: ${task.status}, Priority: ${task.priority}`
  )
  .join("\n")}

RECENT TASKS:
${recentTasks
  .map(
    (task) =>
      `- ID: ${task.id}, Title: "${task.title}", Status: ${task.status}, Priority: ${task.priority}`
  )
  .join("\n")}

CONVERSATION CONTEXT:
${conversationSummary}

TASK: Resolve what task the user is referring to. Look for:
1. Specific task names (e.g., "Call Dentist", "Budget Review")
2. Pronouns like "that", "it", "this task"
3. References to recently created or discussed tasks

Rules:
1. If user mentions specific task name or keywords, find exact or closest match by title
2. If user says "that task", look for most recently mentioned task in conversation
3. If discussing a specific task, "it" refers to that task
4. For partial matches (e.g., "dentist" → "Call Dentist"), prefer exact keyword matches
5. If multiple tasks match, prefer more recent tasks or higher priority
6. If user says "the X task" where X is a keyword, search task titles for X
7. If truly ambiguous or no reasonable match, return null for task_id

Respond with ONLY a JSON object:
{
  "resolved_task_id": "task_id_or_null",
  "confidence": 0.0-1.0,
  "reasoning": "Why you chose this task or why it's ambiguous"
}`;

      const response = await this.callAIForIntent(prompt);

      if (response && response.resolved_task_id) {
        intent.parameters = {
          ...intent.parameters,
          target_task_id: response.resolved_task_id,
          context_resolution_confidence: response.confidence,
        };
        intent.reasoning += ` (Context resolved: ${response.reasoning})`;
      } else if (response && response.confidence < 0.6) {
        // Lower confidence if context resolution failed
        intent.confidence = Math.min(intent.confidence, 0.5);
        intent.reasoning += ` (Context ambiguous: ${response.reasoning})`;
      }

      return intent;
    } catch (error) {
      console.error("Context resolution failed:", error);
      return intent;
    }
  }

  // REMOVED: Pattern matching fallback eliminated - AI-only approach

  // REMOVED: All pattern matching methods eliminated - AI-only approach

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
      console.log("🤖 AI Intent Analysis (calling LLM with skip-intent flag)");
      console.log("🔍 Prompt length:", prompt.length, "characters");

      // Import databricks service dynamically to avoid circular imports
      const { databricksService } = await import("./databricksService");

      // Make a direct call to the LLM for intent analysis with skip flag
      const response = await databricksService.sendMessageForIntentAnalysis(
        prompt,
        "claude-3-5-sonnet"
      );

      console.log("🔍 LLM Response Success:", response.success);
      console.log("🔍 LLM Response Type:", typeof response.response);

      if (response.success && response.response) {
        // Try to parse JSON response from LLM
        try {
          const cleanResponse = response.response.trim();
          console.log(
            "🔍 Raw LLM Response (first 200 chars):",
            cleanResponse.substring(0, 200)
          );

          // Remove any markdown code blocks if present
          const jsonMatch = cleanResponse.match(
            /```(?:json)?\s*(\{[\s\S]*\})\s*```/
          ) || [null, cleanResponse];
          const jsonStr = jsonMatch[1] || cleanResponse;

          console.log(
            "🔍 Extracted JSON (first 200 chars):",
            jsonStr.substring(0, 200)
          );

          const parsed = JSON.parse(jsonStr);
          console.log("✅ LLM Intent Analysis Result:", parsed);
          return parsed;
        } catch (parseError) {
          console.error(
            "❌ Failed to parse LLM response as JSON:",
            (parseError as Error).message
          );
          console.error("Raw LLM response:", response.response);
          return null;
        }
      } else {
        console.error("❌ LLM call failed - no valid response received");
        console.error("Response details:", response);
        return null;
      }
    } catch (error) {
      console.error("❌ AI intent call failed:", error);
      return null;
    }
  }

  // REMOVED: All pattern matching logic eliminated - AI-only approach
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
