/**
 * AI Context System
 * Provides rich context awareness for the AI assistant
 */

import { getTasks, getTopPriorityTasks } from "./taskService.js";
import type { Task } from "./aiTaskTools.js";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface UserPreferences {
  workingHours?: {
    start: string;
    end: string;
  };
  priorityStyle?: "aggressive" | "balanced" | "relaxed";
  preferredTags?: string[];
}

export interface AIContext {
  // Current task state
  allTasks: Task[];
  topPriorityTasks: Task[];
  recentlyUpdatedTasks: Task[];

  // Task analytics
  totalTasks: number;
  blockedTasks: Task[];
  completedToday: Task[];
  overdueTasks: Task[];
  inProgressTasks: Task[];

  // Task distribution
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;

  // Patterns and insights
  commonThemes: string[];
  suggestedFocus: string;

  // Conversation context
  recentMessages: Message[];
  currentTaskFocus?: string; // Task ID if discussing specific task
  lastContextUpdate: Date;
}

/**
 * Build comprehensive AI context from current task state
 */
export async function buildAIContext(
  recentMessages: Message[] = []
): Promise<AIContext> {
  try {
    console.log("🧠 Building AI context...");

    // Fetch all tasks and priority tasks in parallel
    const [allTasksResult, topPriorityResult] = await Promise.all([
      getTasks(),
      getTopPriorityTasks(5),
    ]);

    const allTasks = allTasksResult.success ? allTasksResult.data || [] : [];
    const topPriorityTasks = topPriorityResult.success
      ? topPriorityResult.data || []
      : [];

    // Calculate task analytics
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const blockedTasks = allTasks.filter((task) => task.status === "blocked");
    const completedToday = allTasks.filter((task) => {
      if (task.status !== "done") return false;
      const updatedAt = new Date(task.updated_at);
      return updatedAt >= todayStart;
    });
    const overdueTasks = allTasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      return new Date(task.due_date) < now;
    });
    const inProgressTasks = allTasks.filter(
      (task) => task.status === "in_progress"
    );
    const recentlyUpdatedTasks = allTasks
      .filter((task) => {
        const updatedAt = new Date(task.updated_at);
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return updatedAt > hourAgo;
      })
      .slice(0, 5);

    // Calculate breakdowns
    const statusBreakdown = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityBreakdown = allTasks.reduce((acc, task) => {
      const range =
        task.priority >= 8
          ? "High (8-10)"
          : task.priority >= 5
          ? "Medium (5-7)"
          : "Low (0-4)";
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Extract common themes
    const commonThemes = extractCommonThemes(allTasks);

    // Determine suggested focus
    const suggestedFocus = determineSuggestedFocus(
      allTasks,
      blockedTasks,
      overdueTasks,
      inProgressTasks
    );

    const context: AIContext = {
      allTasks,
      topPriorityTasks,
      recentlyUpdatedTasks,
      totalTasks: allTasks.length,
      blockedTasks,
      completedToday,
      overdueTasks,
      inProgressTasks,
      statusBreakdown,
      priorityBreakdown,
      commonThemes,
      suggestedFocus,
      recentMessages,
      lastContextUpdate: now,
    };

    console.log("✅ AI context built:", {
      totalTasks: context.totalTasks,
      blocked: context.blockedTasks.length,
      inProgress: context.inProgressTasks.length,
      completedToday: context.completedToday.length,
      overdue: context.overdueTasks.length,
      themes: context.commonThemes.length,
    });

    return context;
  } catch (error) {
    console.error("❌ Failed to build AI context:", error);

    // Return minimal context on error
    return {
      allTasks: [],
      topPriorityTasks: [],
      recentlyUpdatedTasks: [],
      totalTasks: 0,
      blockedTasks: [],
      completedToday: [],
      overdueTasks: [],
      inProgressTasks: [],
      statusBreakdown: {},
      priorityBreakdown: {},
      commonThemes: [],
      suggestedFocus: "Unable to determine focus - please check your tasks",
      recentMessages,
      lastContextUpdate: new Date(),
    };
  }
}

/**
 * Extract common themes from tasks
 */
function extractCommonThemes(tasks: Task[]): string[] {
  const themeCount = new Map<string, number>();

  tasks.forEach((task) => {
    // Extract from title words
    const titleWords = task.title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);

    titleWords.forEach((word) => {
      themeCount.set(word, (themeCount.get(word) || 0) + 1);
    });

    // Extract from tags
    task.context_tags?.forEach((tag) => {
      const tagLower = tag.toLowerCase();
      themeCount.set(tagLower, (themeCount.get(tagLower) || 0) + 1);
    });
  });

  // Return themes that appear in at least 2 tasks
  return Array.from(themeCount.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 8);
}

/**
 * Determine what the user should focus on
 */
function determineSuggestedFocus(
  allTasks: Task[],
  blockedTasks: Task[],
  overdueTasks: Task[],
  inProgressTasks: Task[]
): string {
  // Priority 1: Overdue tasks
  if (overdueTasks.length > 0) {
    return `🚨 You have ${overdueTasks.length} overdue task${
      overdueTasks.length > 1 ? "s" : ""
    }. Consider addressing these first.`;
  }

  // Priority 2: Blocked tasks
  if (blockedTasks.length > 0) {
    return `🚫 You have ${blockedTasks.length} blocked task${
      blockedTasks.length > 1 ? "s" : ""
    }. Focus on unblocking these to maintain progress.`;
  }

  // Priority 3: In-progress tasks
  if (inProgressTasks.length > 0) {
    return `🔄 You have ${inProgressTasks.length} task${
      inProgressTasks.length > 1 ? "s" : ""
    } in progress. Consider completing these before starting new work.`;
  }

  // Priority 4: High-priority tasks
  const highPriorityTasks = allTasks.filter(
    (task) => task.priority >= 8 && task.status !== "done"
  );
  if (highPriorityTasks.length > 0) {
    return `🎯 You have ${highPriorityTasks.length} high-priority task${
      highPriorityTasks.length > 1 ? "s" : ""
    }. These might be good to tackle next.`;
  }

  // Default: General guidance
  if (allTasks.length === 0) {
    return `📝 You don't have any tasks yet. Consider adding some tasks to get started!`;
  }

  return `📋 You have ${allTasks.length} task${
    allTasks.length > 1 ? "s" : ""
  } total. Consider working on your highest priority items.`;
}

/**
 * Format context for AI system prompt
 */
export function formatContextForAI(context: AIContext): string {
  const contextSummary = `
CURRENT TASK STATE:
- Total tasks: ${context.totalTasks}
- Status breakdown: ${Object.entries(context.statusBreakdown)
    .map(([status, count]) => `${status}: ${count}`)
    .join(", ")}
- Priority breakdown: ${Object.entries(context.priorityBreakdown)
    .map(([range, count]) => `${range}: ${count}`)
    .join(", ")}

TOP PRIORITY TASKS:
${
  context.topPriorityTasks
    .map((task) => `- "${task.title}" (P${task.priority}, ${task.status})`)
    .join("\n") || "None"
}

ATTENTION NEEDED:
- Blocked tasks: ${context.blockedTasks.length}
- Overdue tasks: ${context.overdueTasks.length}
- In progress: ${context.inProgressTasks.length}
- Completed today: ${context.completedToday.length}

FOCUS SUGGESTION:
${context.suggestedFocus}

COMMON THEMES:
${
  context.commonThemes.length > 0
    ? context.commonThemes.join(", ")
    : "None identified"
}

RECENT ACTIVITY:
${
  context.recentlyUpdatedTasks.length > 0
    ? context.recentlyUpdatedTasks
        .map((task) => `- Updated: "${task.title}"`)
        .join("\n")
    : "No recent updates"
}
`.trim();

  return contextSummary;
}

/**
 * Detect if user is referring to a specific task
 */
export function detectTaskReference(
  message: string,
  context: AIContext
): Task | null {
  const messageLower = message.toLowerCase();

  // Look for exact title matches first
  for (const task of context.allTasks) {
    if (messageLower.includes(task.title.toLowerCase())) {
      return task;
    }
  }

  // Look for partial matches in titles
  for (const task of context.allTasks) {
    const titleWords = task.title.toLowerCase().split(/\s+/);
    if (
      titleWords.some((word) => word.length > 3 && messageLower.includes(word))
    ) {
      return task;
    }
  }

  return null;
}
