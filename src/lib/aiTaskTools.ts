/**
 * AI Task Tools - Core Interface
 * Enables AI to perform comprehensive task management operations
 */

import {
  getTasks,
  getTopPriorityTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./taskService.js";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  difficulty_level?: number;
  status: "backlog" | "todo" | "in_progress" | "blocked" | "done";
  context_tags?: string[];
  locations?: string[];
  due_date?: string;
  time_estimate_hours?: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface TaskAnalysis {
  totalTasks: number;
  statusBreakdown: Record<string, number>;
  priorityDistribution: Record<string, number>;
  themes: string[];
  blockers: string[];
  optimizationSuggestions: OptimizationSuggestion[];
  topPriorities: Task[];
}

export interface OptimizationSuggestion {
  type: "grouping" | "priority" | "status" | "dependency";
  description: string;
  affectedTasks: string[];
  confidence: number;
  action?: string;
}

export interface TaskCluster {
  theme: string;
  tasks: Task[];
  suggestedActions: string[];
}

export interface AITaskToolResult {
  success: boolean;
  data?: any;
  error?: string;
  userMessage: string;
  taskId?: string;
  requiresConfirmation?: boolean;
}

/**
 * Core AI Task Tools Interface
 * All the operations the AI can perform on tasks
 */
export class AITaskTools {
  // === CORE TASK OPERATIONS ===

  async searchTasks(query: string): Promise<AITaskToolResult> {
    try {
      const result = await getTasks();
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to search tasks: ${result.error}`,
        };
      }

      const tasks = result.data || [];
      const searchQuery = query.toLowerCase();

      const matchingTasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery) ||
          task.description?.toLowerCase().includes(searchQuery) ||
          task.context_tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery)
          )
      );

      return {
        success: true,
        data: matchingTasks,
        userMessage: `🔍 Found ${matchingTasks.length} tasks matching "${query}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async createTaskFromAI(taskData: Partial<Task>): Promise<AITaskToolResult> {
    try {
      // Ensure required fields have defaults and validate ranges
      const priority =
        taskData.priority !== undefined
          ? Math.max(0, Math.min(10, taskData.priority))
          : 5; // Use consistent default priority
      const difficulty =
        taskData.difficulty_level !== undefined
          ? Math.max(0, Math.min(10, taskData.difficulty_level))
          : 5;

      const newTask = {
        title: taskData.title || "Untitled Task",
        description: taskData.description,
        priority: priority,
        difficulty_level: difficulty,
        status: taskData.status || "todo",
        context_tags: taskData.context_tags || [],
        locations: taskData.locations || [], // Ensure locations is always an array
        due_date: taskData.due_date,
        time_estimate_hours: taskData.time_estimate_hours,
        // Don't spread taskData after setting defaults to avoid overriding validated values
      };

      const result = await createTask(newTask);

      if (result.success) {
        return {
          success: true,
          data: result.data,
          taskId: result.data.id,
          userMessage: `Created "${result.data.title}"`,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to create task: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Task creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async updateTaskFromAI(
    taskId: string,
    updates: Partial<Task>
  ): Promise<AITaskToolResult> {
    try {
      const result = await updateTask(taskId, updates);

      if (result.success) {
        return {
          success: true,
          data: result.data,
          taskId: result.data.id,
          userMessage: `Updated "${result.data.title}"`,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to update task: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Task update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async deleteTaskFromAI(taskId: string): Promise<AITaskToolResult> {
    try {
      const result = await deleteTask(taskId);

      if (result.success) {
        return {
          success: true,
          taskId: taskId,
          userMessage: `Deleted task`,
          requiresConfirmation: true,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to delete task: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Task deletion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // === STATUS & PRIORITY MANAGEMENT ===

  async changeTaskStatus(
    taskId: string,
    status: Task["status"]
  ): Promise<AITaskToolResult> {
    try {
      const result = await updateTask(taskId, { status });

      if (result.success) {
        const statusEmoji =
          {
            backlog: "📋",
            todo: "📝",
            in_progress: "🔄",
            blocked: "🚫",
            done: "✅",
          }[status] || "📝";

        return {
          success: true,
          data: result.data,
          taskId: result.data.id,
          userMessage: `Moved to ${status.replace("_", " ")}`,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to change task status: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Status change failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async changeTaskPriority(
    taskId: string,
    priority: number
  ): Promise<AITaskToolResult> {
    try {
      // Validate priority range
      const validPriority = Math.max(0, Math.min(10, priority));

      const result = await updateTask(taskId, { priority: validPriority });

      if (result.success) {
        return {
          success: true,
          data: result.data,
          taskId: result.data.id,
          userMessage: `Set priority to ${validPriority}`,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to change priority: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Priority change failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async markTaskComplete(taskId: string): Promise<AITaskToolResult> {
    try {
      const result = await updateTask(taskId, {
        status: "done",
        updated_at: new Date().toISOString(),
      });

      if (result.success) {
        return {
          success: true,
          data: result.data,
          taskId: result.data.id,
          userMessage: `Completed! 🎉`,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to mark task complete: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Task completion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // === TASK INTELLIGENCE ===

  async analyzeTasks(): Promise<AITaskToolResult> {
    try {
      const result = await getTasks();
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to analyze tasks: ${result.error}`,
        };
      }

      const tasks = result.data || [];
      const analysis = this.performTaskAnalysis(tasks);

      return {
        success: true,
        data: analysis,
        userMessage: `📊 Task Analysis Complete: ${analysis.totalTasks} tasks analyzed`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Task analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  private performTaskAnalysis(tasks: Task[]): TaskAnalysis {
    const statusBreakdown = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = tasks.reduce((acc, task) => {
      const priorityRange =
        task.priority >= 8
          ? "High (8-10)"
          : task.priority >= 5
          ? "Medium (5-7)"
          : "Low (0-4)";
      acc[priorityRange] = (acc[priorityRange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const themes = this.extractThemes(tasks);
    const blockers = tasks
      .filter((task) => task.status === "blocked")
      .map((task) => task.title);
    const optimizationSuggestions = this.generateOptimizationSuggestions(tasks);
    const topPriorities = tasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    return {
      totalTasks: tasks.length,
      statusBreakdown,
      priorityDistribution,
      themes,
      blockers,
      optimizationSuggestions,
      topPriorities,
    };
  }

  private extractThemes(tasks: Task[]): string[] {
    const themes = new Set<string>();

    tasks.forEach((task) => {
      // Extract themes from titles and tags
      const words = task.title.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3) {
          themes.add(word);
        }
      });

      // Add tags as themes
      task.context_tags?.forEach((tag) => {
        themes.add(tag.toLowerCase());
      });
    });

    return Array.from(themes).slice(0, 10); // Top 10 themes
  }

  private generateOptimizationSuggestions(
    tasks: Task[]
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Suggest priority adjustments for blocked tasks
    const blockedTasks = tasks.filter((task) => task.status === "blocked");
    if (blockedTasks.length > 0) {
      suggestions.push({
        type: "status",
        description: `You have ${blockedTasks.length} blocked tasks. Consider addressing blockers first.`,
        affectedTasks: blockedTasks.map((task) => task.id),
        confidence: 0.8,
        action: "Review and unblock these tasks",
      });
    }

    // Suggest grouping similar tasks
    const themes = this.extractThemes(tasks);
    themes.forEach((theme) => {
      const themeTasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(theme) ||
          task.context_tags?.some((tag) => tag.toLowerCase().includes(theme))
      );

      if (themeTasks.length >= 3) {
        suggestions.push({
          type: "grouping",
          description: `Consider grouping ${themeTasks.length} tasks related to "${theme}" for batch processing`,
          affectedTasks: themeTasks.map((task) => task.id),
          confidence: 0.7,
          action: `Work on all "${theme}" tasks together`,
        });
      }
    });

    return suggestions;
  }

  // === CONTEXT RETRIEVAL ===

  async getTasksByStatus(status: Task["status"]): Promise<AITaskToolResult> {
    try {
      const result = await getTasks();
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to get tasks by status: ${result.error}`,
        };
      }

      const tasks = result.data || [];
      const filteredTasks = tasks.filter((task) => task.status === status);

      return {
        success: true,
        data: filteredTasks,
        userMessage: `📋 Found ${filteredTasks.length} tasks with status "${status}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Failed to get tasks by status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async getHighPriorityTasks(): Promise<AITaskToolResult> {
    try {
      const result = await getTopPriorityTasks(10);

      if (result.success) {
        return {
          success: true,
          data: result.data,
          userMessage: `🎯 Found ${
            result.data?.length || 0
          } high priority tasks`,
        };
      } else {
        return {
          success: false,
          error: result.error,
          userMessage: `❌ Failed to get high priority tasks: ${result.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: `❌ Failed to get high priority tasks: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async getBlockedTasks(): Promise<AITaskToolResult> {
    return this.getTasksByStatus("blocked");
  }
}

// Export singleton instance
export const aiTaskTools = new AITaskTools();
