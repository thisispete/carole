/**
 * Databricks AI Service Integration
 * For Block's internal ML platform
 * Uses Block SSO authentication - no API keys required
 */

import { browser } from "$app/environment";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Model {
  name: string;
  displayName: string;
  description: string;
  recommended: boolean;
}

interface AIResponse {
  success: boolean;
  response?: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

interface ConnectionResult {
  success: boolean;
  message?: string;
  models?: string[];
  error?: string;
}

interface Task {
  id: string;
  title: string;
  priority: number;
  status: string;
  [key: string]: any;
}

// Check if we're in production mode
const isProduction = import.meta.env.VITE_DATABRICKS_ENV === "production";

class DatabricksService {
  public baseUrl: string | null = null;
  public initialized: boolean = false;

  /**
   * Initialize Databricks service with Block's internal endpoints
   * This should be called on app startup
   */
  async initialize(): Promise<boolean> {
    if (!browser) {
      console.log("🔧 Databricks: Server-side, skipping initialization");
      return false;
    }

    try {
      // Use environment variable or default to Block's internal endpoint
      this.baseUrl =
        import.meta.env.VITE_DATABRICKS_HOST ||
        "https://databricks.internal.block.xyz";

      console.log("🤖 Databricks Service: Initializing...");
      console.log("🔗 Base URL:", this.baseUrl);
      console.log("🔧 Mode:", isProduction ? "Production" : "Development");

      // Test connection to Databricks
      const connectionTest = await this.testConnection();

      if (connectionTest.success) {
        this.initialized = true;
        console.log("✅ Databricks: Connected successfully");
        return true;
      } else {
        console.error("❌ Databricks: Connection failed", connectionTest.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Databricks: Initialization error", error);
      return false;
    }
  }

  /**
   * Test connection to Databricks
   * Uses PAT authentication for Block's internal Databricks
   */
  async testConnection(): Promise<ConnectionResult> {
    try {
      console.log("🔍 Testing Databricks connection...");

      if (isProduction) {
        // Production: Test actual connection to Databricks using PAT
        const token = import.meta.env.VITE_DATABRICKS_TOKEN;

        if (!token) {
          return {
            success: false,
            error: "Missing VITE_DATABRICKS_TOKEN environment variable",
            message: "PAT token required for Databricks authentication",
          };
        }

        const response = await fetch("/api/databricks/api/2.0/clusters/list", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          return {
            success: true,
            message: "Databricks connection verified (production)",
            models: ["claude-3-5-sonnet", "gpt-4o", "llama-3.1-405b"],
          };
        } else {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            message: "Failed to connect to Databricks - check your PAT token",
          };
        }
      } else {
        // Development: Simulate connection
        console.log("🔧 Development mode: Simulating Databricks connection");

        return {
          success: true,
          message: "Databricks connection ready (development mode)",
          models: ["claude-3-5-sonnet", "gpt-4o", "llama-3.1-405b"],
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        message: "Failed to connect to Databricks",
      };
    }
  }

  /**
   * List available models from Databricks
   */
  async listModels(): Promise<{
    success: boolean;
    models?: Model[];
    error?: string;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log("📋 Fetching available models...");

      if (isProduction) {
        // Production: Query actual Databricks models endpoint
        const token = import.meta.env.VITE_DATABRICKS_TOKEN;

        if (!token) {
          throw new Error("Missing VITE_DATABRICKS_TOKEN environment variable");
        }

        const response = await fetch(
          "/api/databricks/api/2.0/serving-endpoints",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Parse the actual response from Databricks
          const models: Model[] =
            data.endpoints?.map((endpoint: any) => ({
              name: endpoint.name,
              displayName: endpoint.name
                .replace("-", " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase()),
              description: `${endpoint.task || "LLM"} model via Databricks`,
              recommended: ["claude-3-5-sonnet", "gpt-4o"].includes(
                endpoint.name
              ),
            })) || [];

          console.log(
            "📋 Production models loaded:",
            models.map((m) => m.name)
          );
          return { success: true, models };
        } else {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }
      } else {
        // Development: Return mock models
        const models: Model[] = [
          {
            name: "claude-3-5-sonnet",
            displayName: "Claude 3.5 Sonnet",
            description: "Anthropic's most capable model",
            recommended: true,
          },
          {
            name: "gpt-4o",
            displayName: "GPT-4o",
            description: "OpenAI's multimodal model",
            recommended: true,
          },
          {
            name: "llama-3.1-405b",
            displayName: "Llama 3.1 405B",
            description: "Meta's largest open model",
            recommended: false,
          },
        ];

        console.log(
          "📋 Development models:",
          models.map((m) => m.name)
        );
        return { success: true, models };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Failed to list models:", error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a chat message to Databricks AI
   * @param message - User message
   * @param context - Previous conversation context
   * @param model - Model to use (defaults to Claude 3.5 Sonnet)
   */
  async sendMessage(
    message: string,
    context: Message[] = [],
    model: string = "claude-3-5-sonnet"
  ): Promise<AIResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log("💬 Sending message to Databricks AI...");
      console.log("🤖 Model:", model);
      console.log("📝 Message:", message);

      // Build the conversation context
      const messages: Message[] = [
        {
          role: "system",
          content:
            "You are Carole, a proactive AI assistant helping with task management and productivity. You have access to the user's task list and can help prioritize, create, and manage tasks. Be helpful, friendly, and proactive in your suggestions.",
        },
        ...context,
        {
          role: "user",
          content: message,
        },
      ];

      if (isProduction) {
        // Production: Make actual API call to Databricks
        const token = import.meta.env.VITE_DATABRICKS_TOKEN;

        if (!token) {
          throw new Error("Missing VITE_DATABRICKS_TOKEN environment variable");
        }

        const response = await fetch(
          `/api/databricks/serving-endpoints/${model}/invocations`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: messages,
              max_tokens: 1000,
              temperature: 0.7,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Parse the response based on Databricks format
        const aiResponse =
          data.choices?.[0]?.message?.content ||
          data.response ||
          "No response received";

        return {
          success: true,
          response: aiResponse,
          model: model,
          usage: data.usage || {
            prompt_tokens: messages.reduce(
              (sum, msg) => sum + msg.content.length / 4,
              0
            ),
            completion_tokens: aiResponse.length / 4,
            total_tokens: 0,
          },
        };
      } else {
        // Development: Simulate AI response
        console.log("🔧 Development mode: Simulating AI response");

        const simulatedResponse = this.generateSimulatedResponse(message);

        return {
          success: true,
          response: simulatedResponse,
          model: model,
          usage: {
            prompt_tokens: messages.reduce(
              (sum, msg) => sum + msg.content.length / 4,
              0
            ),
            completion_tokens: simulatedResponse.length / 4,
            total_tokens: 0,
          },
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Databricks AI request failed:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate a simulated AI response for development
   * @private
   */
  private generateSimulatedResponse(message: string): string {
    const responses = [
      "I can help you with that! Based on your current tasks, I'd suggest focusing on the highest priority items first. Would you like me to analyze your task list?",
      "That's a great question! I noticed you have some tasks that might be related. Should we group them together to work more efficiently?",
      "I can see you're working on several projects. Let me help you prioritize based on deadlines and importance. What's most urgent right now?",
      "Thanks for the update! I've noted that in your task context. Is there anything blocking you from making progress on this?",
      "I understand. Let me suggest a different approach that might work better for your current situation. Have you considered breaking this down into smaller steps?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get AI suggestions for task prioritization
   * @param tasks - Array of task objects
   */
  async getPrioritySuggestions(tasks: Task[]): Promise<AIResponse> {
    const taskContext = tasks
      .map(
        (task) =>
          `- ${task.title} (Priority: ${task.priority}, Status: ${task.status})`
      )
      .join("\n");

    const message = `Here are my current tasks:\n${taskContext}\n\nCan you help me prioritize these and suggest what I should focus on today?`;

    return await this.sendMessage(message);
  }

  /**
   * Create a task from natural language
   * @param description - Natural language description
   */
  async createTaskFromText(description: string): Promise<AIResponse> {
    const message = `Please help me create a task from this description: "${description}". Extract the title, priority level (0-10), difficulty (0-10), and any relevant tags or details.`;

    return await this.sendMessage(message);
  }
}

// Export singleton instance
export const databricksService = new DatabricksService();

// Export the class for testing
export { DatabricksService };
