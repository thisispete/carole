/**
 * Databricks AI Service Integration
 * For Block's internal ML platform
 * Uses Block SSO authentication - no API keys required
 */

import { browser } from "$app/environment";
import { buildAIContext, formatContextForAI } from "./aiContext.js";
import { AIToolExecutor, aiToolExecutor } from "./aiToolExecutor.js";
import type { AIContext, Message } from "./aiContext.js";
import type {
  ToolCall,
  ToolResult,
  UserIntent,
  Intent,
} from "./aiToolExecutor.js";

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
  toolResults?: ToolResult[];
  context?: AIContext;
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
      console.log(`🔗 Base URL: ${this.baseUrl}`);
      console.log(
        `🔧 Environment: ${import.meta.env.VITE_DATABRICKS_ENV || "undefined"}`
      );
      console.log(`🏭 Production Mode: ${isProduction}`);
      console.log(
        `🔑 Token Present: ${!!import.meta.env.VITE_DATABRICKS_TOKEN}`
      );
      console.log(
        `🎯 Default Model: ${
          import.meta.env.VITE_DEFAULT_AI_MODEL || "claude-3-5-sonnet"
        }`
      );

      // Test connection to Databricks
      const connectionTest = await this.testConnection();

      if (connectionTest.success) {
        this.initialized = true;
        console.log("✅ Databricks: Connected successfully");
        console.log(
          `📊 Available models: ${
            connectionTest.models?.join(", ") || "unknown"
          }`
        );
        return true;
      } else {
        console.error("❌ Databricks: Connection failed", connectionTest.error);
        console.error(`📋 Error details: ${connectionTest.message}`);
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
      console.log("🔍 Testing Databricks AI connection...");

      const token = import.meta.env.VITE_DATABRICKS_TOKEN;

      if (!token) {
        return {
          success: false,
          error: "Missing VITE_DATABRICKS_TOKEN environment variable",
          message: "PAT token required for Databricks authentication",
        };
      }

      // Test the actual AI endpoint that we use, not just the clusters endpoint
      const testMessage = {
        messages: [{ role: "user", content: "test" }],
        max_tokens: 10,
        temperature: 0.1,
      };

      const startTime = Date.now();
      const response = await fetch(
        "/api/databricks/serving-endpoints/claude-3-5-sonnet/invocations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testMessage),
        }
      );
      const responseTime = Date.now() - startTime;

      console.log(`🔍 Connection test completed in ${responseTime}ms`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Databricks connection successful");
        console.log(`⚡ Response time: ${responseTime}ms`);
        console.log(
          `📊 Model responding: ${data.model || "claude-3-5-sonnet"}`
        );

        return {
          success: true,
          message: `Databricks AI service is available (${responseTime}ms response time)`,
          models: ["claude-3-5-sonnet", "gpt-4o", "llama-3.1-405b"],
        };
      } else {
        const errorText = await response.text();
        console.error(
          `🔍 AI endpoint test failed (${responseTime}ms):`,
          response.status,
          errorText
        );

        // Parse the error to provide better user messaging
        let userMessage = `AI service is temporarily unavailable (HTTP ${response.status})`;
        if (response.status === 503) {
          userMessage = "AI service is temporarily down for maintenance";
        } else if (response.status === 429) {
          userMessage =
            "AI service is experiencing high load - retries will help";
        } else if (response.status === 401 || response.status === 403) {
          userMessage = "AI service authentication failed";
        } else if (response.status >= 500) {
          userMessage = `AI service server error (${response.status}) - intermittent issue`;
        }

        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText} (${responseTime}ms)`,
          message: userMessage,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("🔍 Connection test failed with exception:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        message:
          "Failed to connect to AI service - network or configuration issue",
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

        return {
          success: true,
          models: models,
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send message directly to AI for intent analysis (bypasses intent analysis to prevent circular calls)
   */
  async sendMessageForIntentAnalysis(
    message: string,
    model: string = "claude-3-5-sonnet"
  ): Promise<AIResponse> {
    return this.sendMessageForIntentAnalysisWithRetry(message, model, 2);
  }

  /**
   * Send message for intent analysis with retry logic
   * @private
   */
  private async sendMessageForIntentAnalysisWithRetry(
    message: string,
    model: string = "claude-3-5-sonnet",
    maxRetries: number = 2
  ): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🤖 Direct AI call for intent analysis (attempt ${attempt}/${maxRetries}) - no tools, no context`
        );

        const isProduction =
          import.meta.env.VITE_DATABRICKS_ENV === "production";

        if (isProduction) {
          // Production: Send to actual Databricks
          const token = import.meta.env.VITE_DATABRICKS_TOKEN;

          if (!token) {
            throw new Error(
              "Missing VITE_DATABRICKS_TOKEN environment variable"
            );
          }

          const requestBody = {
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant. Respond with JSON when requested.",
              },
              { role: "user", content: message },
            ],
            max_tokens: 1000,
            temperature: 0.1,
          };

          const response = await fetch(
            `/api/databricks/serving-endpoints/${model}/invocations`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `❌ Databricks API Error (intent analysis attempt ${attempt}):`,
              response.status,
              errorText
            );

            // Determine if we should retry
            const shouldRetry = this.shouldRetryError(response.status);

            if (shouldRetry && attempt < maxRetries) {
              const error = new Error(
                `Databricks API error: ${response.status} ${response.statusText}`
              );
              lastError = error;
              console.log(`🔄 Intent analysis retry in ${attempt * 500}ms...`);
              await this.sleep(attempt * 500); // Shorter delays for intent analysis
              continue;
            } else {
              throw new Error(
                `Databricks API error: ${response.status} ${response.statusText}`
              );
            }
          }

          const data = await response.json();
          const aiResponse =
            data.choices?.[0]?.message?.content || "No response from AI";

          return {
            success: true,
            response: aiResponse,
            model: model,
            usage: data.usage,
          };
        } else {
          // Development: AI intent analysis not available - return honest error
          throw new Error(
            "AI intent analysis requires production environment. Please rephrase your request more clearly and I'll try to help."
          );
        }
      } catch (error) {
        console.error(
          `❌ Direct AI call for intent analysis failed (attempt ${attempt}):`,
          error
        );
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // If this was the last attempt or error is not retryable, break out
        if (attempt === maxRetries || !this.isRetryableError(lastError)) {
          break;
        }

        // Wait before retrying
        console.log(
          `🔄 Waiting ${attempt * 500}ms before intent analysis retry...`
        );
        await this.sleep(attempt * 500);
      }
    }

    // If we get here, all retries failed
    return {
      success: false,
      error: lastError?.message || "Unknown error",
      toolResults: [],
    };
  }

  /**
   * Send message to AI with comprehensive task management capabilities
   */
  async sendMessage(
    message: string,
    context: Message[] = [],
    model: string = "claude-3-5-sonnet"
  ): Promise<AIResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.sendMessageWithRetry(message, context, model, 3);
  }

  /**
   * Send message with retry logic for resilience
   * @private
   */
  private async sendMessageWithRetry(
    message: string,
    context: Message[] = [],
    model: string = "claude-3-5-sonnet",
    maxRetries: number = 3
  ): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🤖 Sending message to Databricks AI (attempt ${attempt}/${maxRetries}):`,
          message.slice(0, 50) + "..."
        );

        // Build context and analyze intent with AI-driven system
        console.log("🧠 Building AI context...");
        const aiContext = await buildAIContext();

        console.log("🤖 Creating tool executor...");
        const toolExecutor = new AIToolExecutor();

        console.log("🎯 Analyzing intent...");
        const intents = await toolExecutor.analyzeIntent(message, context);
        console.log("✅ User intents detected:", intents);

        if (isProduction) {
          // Production: Send to actual Databricks with retry logic
          const token = import.meta.env.VITE_DATABRICKS_TOKEN;

          if (!token) {
            throw new Error(
              "Missing VITE_DATABRICKS_TOKEN environment variable"
            );
          }

          // Enhanced system prompt with tools and context
          const systemPrompt = this.buildSystemPromptWithTools(aiContext);

          const requestBody = {
            messages: [
              { role: "system", content: systemPrompt },
              ...context,
              { role: "user", content: message },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          };

          const response = await fetch(
            `/api/databricks/serving-endpoints/${model}/invocations`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `❌ Databricks API Error (attempt ${attempt}):`,
              response.status,
              errorText
            );

            // Determine if we should retry based on error type
            const shouldRetry = this.shouldRetryError(response.status);

            if (response.status === 503) {
              const error = new Error(
                attempt === maxRetries
                  ? "Databricks service is temporarily unavailable. Please try again later."
                  : "Databricks service temporarily unavailable - retrying..."
              );
              if (shouldRetry && attempt < maxRetries) {
                lastError = error;
                console.log(`🔄 Retrying in ${attempt * 1000}ms...`);
                await this.sleep(attempt * 1000); // Exponential backoff
                continue;
              } else {
                throw error;
              }
            } else if (response.status === 429) {
              const error = new Error(
                attempt === maxRetries
                  ? "AI service is experiencing high load. Please try again later."
                  : "Rate limited - retrying..."
              );
              if (shouldRetry && attempt < maxRetries) {
                lastError = error;
                console.log(
                  `🔄 Rate limited, retrying in ${attempt * 2000}ms...`
                );
                await this.sleep(attempt * 2000); // Longer backoff for rate limits
                continue;
              } else {
                throw error;
              }
            } else if (response.status === 401) {
              throw new Error(
                "Authentication failed. Please check your Databricks token."
              );
            } else if (response.status === 403) {
              throw new Error(
                "Access denied. Please check your Databricks permissions."
              );
            } else {
              const error = new Error(
                `Databricks API error: ${response.status} ${response.statusText}`
              );
              if (shouldRetry && attempt < maxRetries) {
                lastError = error;
                console.log(`🔄 Retrying after ${response.status} error...`);
                await this.sleep(attempt * 1000);
                continue;
              } else {
                throw error;
              }
            }
          }

          const data = await response.json();
          const aiResponse =
            data.choices?.[0]?.message?.content || "No response from AI";

          // Execute intent-based tools
          const toolResults = await this.executeIntentBasedTools(intents);

          return {
            success: true,
            response: aiResponse,
            model: model,
            usage: data.usage,
            toolResults: toolResults,
            context: aiContext,
          };
        } else {
          // Development: Use local AI responses with real tool execution
          console.log(
            "🔧 Development mode: Using local AI responses with real tools"
          );

          // Execute intent-based tools (this part is real even in development)
          const toolResults = await this.executeIntentBasedTools(intents);

          // Generate contextual response based on actual actions and data WITH conversation history
          const contextualResponse = this.generateContextualResponseWithTools(
            message,
            toolResults,
            aiContext,
            intents,
            context // Now passing conversation history!
          );

          return {
            success: true,
            response: contextualResponse,
            model: `${model} (local)`,
            toolResults: toolResults,
            context: aiContext,
          };
        }
      } catch (error) {
        console.error(
          `❌ Databricks sendMessage error (attempt ${attempt}):`,
          error
        );
        lastError =
          error instanceof Error ? error : new Error("Unknown error occurred");

        // If this was the last attempt or error is not retryable, break out of loop
        if (attempt === maxRetries || !this.isRetryableError(lastError)) {
          break;
        }

        // Wait before retrying
        console.log(`🔄 Waiting ${attempt * 1000}ms before retry...`);
        await this.sleep(attempt * 1000);
      }
    }

    // If we get here, all retries failed
    const errorMessage = lastError?.message || "Unknown error occurred";

    return {
      success: false,
      error: errorMessage,
      toolResults: [],
    };
  }

  /**
   * Determine if an HTTP status code should trigger a retry
   * @private
   */
  private shouldRetryError(statusCode: number): boolean {
    // Retry on server errors and rate limiting
    return statusCode >= 500 || statusCode === 429;
  }

  /**
   * Determine if an error is retryable
   * @private
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes("temporarily unavailable") ||
      message.includes("high load") ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("504") ||
      message.includes("429")
    );
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build system prompt with tools and context
   * @private
   */
  private buildSystemPromptWithTools(context: AIContext): string {
    const contextSummary = formatContextForAI(context);

    return `You are Carole, a casual and helpful AI assistant. You help with tasks but keep things simple and conversational.

${contextSummary}

STYLE:
- Be super casual and friendly - like texting a friend
- Keep responses SHORT and sweet
- Use line breaks to make things easy to read
- Don't repeat back details the user already knows
- Just do what they ask without explaining how

RESPONSES:
- "Done!" instead of "I successfully completed the task"
- "What's next?" instead of "What else can I help you with today?"
- Use natural language, not formal sentences
- Add line breaks between thoughts

Remember: Less is more. Be helpful, not wordy.`;
  }

  /**
   * Execute tools based on user intent
   * @private
   */
  private async executeIntentBasedTools(
    intents: Intent[]
  ): Promise<ToolResult[]> {
    const toolResults: ToolResult[] = [];

    for (const intent of intents) {
      console.log(
        `🎯 Processing intent: ${intent.type} (confidence: ${intent.confidence})`
      );

      // Special handling for task creation - check ambiguity first
      if (intent.type === "create") {
        const ambiguity = intent.parameters?._ambiguityAnalysis;
        const duplicateCheck = intent.parameters?._duplicateCheck;

        console.log("🤔 Ambiguity analysis:", ambiguity);
        console.log("🔍 Duplicate check:", duplicateCheck);

        // Don't execute if highly ambiguous or has duplicates - let response generation handle it
        if (
          (ambiguity && ambiguity.score > 30) ||
          (duplicateCheck && duplicateCheck.hasDuplicates)
        ) {
          console.log(
            "⚠️ Task creation blocked due to ambiguity or duplicates - will ask for clarification"
          );
          console.log("🔍 Ambiguity details:", ambiguity);
          console.log("🔍 Duplicate details:", duplicateCheck);
          continue; // Skip execution, let response generation ask questions
        }

        // Also skip if confidence is too low (lowered threshold for creation)
        if (intent.confidence < 0.4) {
          console.log(
            "⚠️ Task creation confidence too low - will ask for clarification"
          );
          continue;
        }
      }

      // Execute intents with sufficient confidence (lowered threshold)
      if (intent.confidence >= 0.3) {
        const toolCall = this.intentToToolCall(intent);
        if (toolCall) {
          console.log(
            `🛠️ Executing tool based on intent: ${intent.type} (confidence: ${intent.confidence})`
          );
          const result = await aiToolExecutor.executeTool(toolCall);
          toolResults.push(result);
        }
      } else {
        console.log(
          `⚠️ Intent detected but confidence too low: ${intent.type} (${intent.confidence} < 0.5)`
        );

        // For task creation with low confidence, check if it was blocked for good reasons
        if (intent.type === "create" && intent.confidence >= 0.3) {
          const ambiguity = intent.parameters?._ambiguityAnalysis;
          const duplicateCheck = intent.parameters?._duplicateCheck;

          // Don't override confidence if we have good reasons to block
          if (
            (ambiguity && ambiguity.score > 30) ||
            (duplicateCheck && duplicateCheck.hasDuplicates)
          ) {
            console.log(
              "⚠️ Task creation still blocked due to ambiguity/duplicates - not overriding"
            );
          } else {
            console.log(
              "🔄 Attempting task creation with manual confidence override..."
            );
            const toolCall = this.intentToToolCall(intent);
            if (toolCall && toolCall.parameters?.title) {
              // Override confidence if we have at least a title and no blocking issues
              const result = await aiToolExecutor.executeTool(toolCall);
              toolResults.push(result);
            }
          }
        }
      }
    }

    return toolResults;
  }

  /**
   * Convert user intent to tool call
   * @private
   */
  private intentToToolCall(intent: Intent): ToolCall | null {
    switch (intent.type) {
      case "create":
        return {
          tool: "createTask",
          parameters: intent.parameters || {},
          reasoning: intent.reasoning,
          confidence: intent.confidence,
        };

      case "complete":
        if (intent.parameters?.target_task_id) {
          return {
            tool: "markTaskComplete",
            parameters: { taskId: intent.parameters.target_task_id },
            reasoning: intent.reasoning,
            confidence: intent.confidence,
          };
        }
        break;

      case "status_change":
        if (intent.parameters?.target_task_id && intent.parameters?.status) {
          return {
            tool: "changeTaskStatus",
            parameters: {
              taskId: intent.parameters.target_task_id,
              status: intent.parameters.status,
            },
            reasoning: intent.reasoning,
            confidence: intent.confidence,
          };
        }
        break;

      case "priority_change":
        console.log("🔧 Processing priority_change intent:", {
          target_task_id: intent.parameters?.target_task_id,
          priority: intent.parameters?.priority,
          hasTaskId: !!intent.parameters?.target_task_id,
          hasPriority: intent.parameters?.priority !== undefined,
        });

        if (
          intent.parameters?.target_task_id &&
          intent.parameters?.priority !== undefined
        ) {
          console.log("✅ Creating changeTaskPriority tool call");
          return {
            tool: "changeTaskPriority",
            parameters: {
              taskId: intent.parameters.target_task_id,
              priority: intent.parameters.priority,
            },
            reasoning: intent.reasoning,
            confidence: intent.confidence,
          };
        } else {
          console.log("❌ Missing required parameters for priority change:", {
            target_task_id: intent.parameters?.target_task_id,
            priority: intent.parameters?.priority,
          });
        }
        break;

      case "update":
        if (intent.parameters?.target_task_id) {
          console.log(
            "🔧 Processing general update intent:",
            intent.parameters
          );

          // Extract all update parameters except target_task_id
          const updates = { ...intent.parameters };
          delete updates.target_task_id;
          delete updates.context_resolution_confidence;

          return {
            tool: "updateTask",
            parameters: {
              taskId: intent.parameters.target_task_id,
              ...updates,
            },
            reasoning: intent.reasoning,
            confidence: intent.confidence,
          };
        } else {
          console.log("❌ Missing target_task_id for update intent");
        }
        break;

      case "search":
        if (intent.parameters?.query) {
          return {
            tool: "searchTasks",
            parameters: { query: intent.parameters.query },
            reasoning: intent.reasoning,
            confidence: intent.confidence,
          };
        }
        break;

      case "analyze":
        return {
          tool: "analyzeTasks",
          parameters: {},
          reasoning: intent.reasoning,
          confidence: intent.confidence,
        };
    }

    return null;
  }

  /**
   * Generate a contextual AI response based on actual tool results and real data
   * @private
   */
  private generateContextualResponseWithTools(
    message: string,
    toolResults: ToolResult[],
    context: AIContext,
    intents: UserIntent[],
    conversationHistory: Message[] = []
  ): string {
    console.log("🧠 Generating response with conversation memory...");
    console.log("💬 Recent messages:", conversationHistory.length);

    // Analyze conversation context
    const conversationContext = this.analyzeConversationContext(
      conversationHistory,
      message
    );

    // If we executed tools, incorporate their results
    if (toolResults.length > 0) {
      const successfulTools = toolResults.filter((r) => r.success);
      const failedTools = toolResults.filter((r) => !r.success);

      let response = "";

      if (successfulTools.length > 0) {
        // Add conversation-aware responses
        if (conversationContext.isFollowUp) {
          response += "Got it! ";
        } else if (conversationContext.seemsImpatient) {
          response += "Done! ";
        } else if (conversationContext.isPolite) {
          response += "Sure thing! ";
        }

        // Generate accurate responses based on actual tool results
        for (const tool of successfulTools) {
          if (tool.toolCall?.tool === "createTask" && tool.data) {
            // Use actual task data instead of generic message
            const task = tool.data;
            response += `I've added that task for you: "${task.title}"\n`;
            response += `Priority: ${task.priority} ${
              task.priority >= 8
                ? "(High)"
                : task.priority >= 6
                ? "(Medium)"
                : "(Low)"
            }\n`;
            response += `Status: ${task.status.replace("_", " ")}\n`;
            if (task.due_date) {
              response += `Due: ${new Date(
                task.due_date
              ).toLocaleDateString()}\n`;
            }
          } else {
            // For other tools, use the standard message
            response += tool.userMessage;
          }
        }
        response += "\n";
      }

      if (failedTools.length > 0) {
        if (conversationContext.hasTriedBefore) {
          response += "Still having trouble with that... ";
        }
        response += failedTools.map((tool) => tool.userMessage).join(" ");
        response += "\n\n";
      }

      // Add contextual follow-up based on conversation
      response += this.generateConversationAwareFollowUp(
        context,
        conversationContext
      );

      return response;
    }

    // Check if we have intents but no tool results (blocked due to ambiguity/duplicates)
    if (intents.length > 0 && toolResults.length === 0) {
      const createIntent = intents.find((intent) => intent.type === "create");
      if (createIntent) {
        const ambiguity = createIntent.parameters?._ambiguityAnalysis;
        const duplicateCheck = createIntent.parameters?._duplicateCheck;

        // If we blocked due to ambiguity or duplicates, provide guidance
        if (
          (ambiguity && ambiguity.score > 30) ||
          (duplicateCheck && duplicateCheck.hasDuplicates)
        ) {
          return this.generateAmbiguityResponse(createIntent);
        }

        // If we blocked due to low confidence, ask for clarification
        if (createIntent.confidence < 0.6) {
          return this.generateAmbiguityResponse(createIntent);
        }
      }

      // Handle other low-confidence intents
      const lowConfidenceIntents = intents.filter(
        (intent) => intent.confidence < 0.5
      );

      if (lowConfidenceIntents.length > 0) {
        const intent = lowConfidenceIntents[0];

        // Use conversation context to provide better clarification
        switch (intent.type) {
          case "complete":
            if (conversationContext.mentionedSpecificTask) {
              return "Which task did you want to mark as done?";
            }
            return "Looks like you want to mark something as done!\n\nWhich task are you referring to?";

          case "status_change":
            return "Want to change a task status?\n\nWhich task and what status should it be?";

          case "priority_change":
            if (conversationContext.hasDiscussedPriorities) {
              return "Another priority change?\n\nWhich task and what priority (0-10)?";
            }
            return "Looks like you want to change a priority!\n\nWhich task and what priority (0-10)?";

          case "search":
            return "Want to search for something?\n\nWhat should I look for?";

          case "analyze":
            return "Want me to analyze your tasks?\n\nLet me take a look...";

          default:
            if (conversationContext.seemsRepetitive) {
              return "I'm still not quite getting it.\n\nCan you try explaining it differently?";
            }
            return "I think I understand what you want but need more details!\n\nCan you be more specific?";
        }
      }
    }

    // No intents detected - use conversation-aware responses
    return this.generateConversationAwareResponse(context, conversationContext);
  }

  /**
   * Analyze conversation context for better responses
   * @private
   */
  private analyzeConversationContext(
    history: Message[],
    currentMessage: string
  ): {
    isFollowUp: boolean;
    seemsImpatient: boolean;
    isPolite: boolean;
    hasTriedBefore: boolean;
    hasAskedForTasks: boolean;
    seemsConfused: boolean;
    mentionedSpecificTask: boolean;
    hasDiscussedPriorities: boolean;
    seemsRepetitive: boolean;
  } {
    const recentMessages = history.slice(-3); // Last 3 messages
    const allContent = recentMessages
      .map((m) => m.content.toLowerCase())
      .join(" ");
    const currentLower = currentMessage.toLowerCase();

    return {
      isFollowUp: /\b(also|and|then|next|after that)\b/.test(currentLower),
      seemsImpatient: /\b(still|again|yet|why|please|come on)\b/.test(
        currentLower
      ),
      isPolite: /\b(please|thanks|thank you|could you)\b/.test(currentLower),
      hasTriedBefore: recentMessages.some(
        (m) =>
          m.role === "user" &&
          /\b(create|add|make)\b/.test(m.content.toLowerCase())
      ),
      hasAskedForTasks: /\b(task|todo|create|add)\b/.test(allContent),
      seemsConfused: /\b(help|how|what|confused|don't understand)\b/.test(
        currentLower
      ),
      mentionedSpecificTask: /\b(this|that|the [\w\s]+ task)\b/.test(
        currentLower
      ),
      hasDiscussedPriorities: /\b(priority|important|urgent)\b/.test(
        allContent
      ),
      seemsRepetitive:
        recentMessages.filter(
          (m) =>
            m.role === "user" &&
            m.content.toLowerCase().includes(currentLower.slice(0, 10))
        ).length > 1,
    };
  }

  /**
   * Generate conversation-aware follow-up
   * @private
   */
  private generateConversationAwareFollowUp(
    context: AIContext,
    convContext: any
  ): string {
    if (convContext.isFollowUp) {
      return "What's next?";
    }

    if (context.blockedTasks.length > 0 && !convContext.hasAskedForTasks) {
      return context.blockedTasks.length === 1
        ? "Got a blocked task.\n\nWant to talk through it?"
        : `Got ${context.blockedTasks.length} blocked tasks.\n\nWant to tackle those?`;
    }

    if (
      context.topPriorityTasks.length > 0 &&
      !convContext.hasDiscussedPriorities
    ) {
      return `Top priority: "${context.topPriorityTasks[0].title}"\n\nStart there?`;
    }

    return "What else can I help with?";
  }

  /**
   * Generate conversation-aware response when no intents detected
   * @private
   */
  private generateConversationAwareResponse(
    context: AIContext,
    convContext: any
  ): string {
    // Handle confused users
    if (convContext.seemsConfused) {
      return 'No problem! I can help you:\n\n• Create tasks ("create a task to...")\n• Update priorities ("make X high priority")\n• Mark things done ("mark X as complete")\n\nWhat would you like to do?';
    }

    // Handle repetitive requests
    if (convContext.seemsRepetitive) {
      return "Hmm, seems like we're going in circles.\n\nLet me try a different approach - what's the main thing you want to accomplish right now?";
    }

    // Standard contextual responses based on task state
    const responses = [
      context.suggestedFocus.includes("overdue")
        ? "Got some overdue stuff!\n\nWant to knock those out first?"
        : convContext.isPolite
        ? "Hey! Happy to help - what's up?"
        : "Hey! What's up?",

      context.topPriorityTasks.length > 0
        ? `Top priority: "${context.topPriorityTasks[0].title}"\n\nStart there?`
        : convContext.hasAskedForTasks
        ? "Want to create another task?"
        : "What's on your mind?",

      context.blockedTasks.length > 0
        ? "Noticed some blocked tasks...\n\nWant to get those unstuck?"
        : convContext.isFollowUp
        ? "What's next?"
        : "What can I help with?",

      context.completedToday.length > 0
        ? `Nice! Already got ${context.completedToday.length} done today.\n\nWhat's next?`
        : "Ready to get stuff done?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate response for ambiguous or duplicate-prone task creation
   * @private
   */
  private generateAmbiguityResponse(intent: UserIntent): string {
    console.log("🤔 Generating ambiguity response for intent:", intent);
    const ambiguity = intent.parameters?._ambiguityAnalysis;
    const duplicateCheck = intent.parameters?._duplicateCheck;

    let response = "";

    // Handle duplicates first
    if (duplicateCheck?.hasDuplicates) {
      const duplicates = duplicateCheck.duplicates;
      if (duplicates.length === 1 && duplicates[0].matchType === "exact") {
        return `Looks like you already have that task: "${duplicates[0].task.title}"\n\nDid you mean to update it instead?`;
      } else if (duplicates.length > 0) {
        const similarTasks = duplicates
          .slice(0, 2)
          .map((d: any) => `"${d.task.title}"`)
          .join(", ");
        response += `I found similar tasks: ${similarTasks}\n\n`;
        response +=
          "Want to create a new one anyway, or update an existing one?";
        return response;
      }
    }

    // Handle ambiguity
    if (ambiguity && ambiguity.score > 30) {
      response += "I can create that task, but I need a few more details:\n\n";

      ambiguity.suggestions.forEach((suggestion: string, index: number) => {
        response += `${index + 1}. ${suggestion}\n`;
      });

      response += "\nJust let me know and I'll set it up!";
      return response;
    }

    // Low confidence fallback
    if (intent.confidence < 0.5) {
      response +=
        "I think you want to create a task, but I'm not quite sure.\n\n";
      if (intent.parameters?.title) {
        response += `Is this right: "${intent.parameters.title}"?\n\n`;
      }
      response += "Give me a bit more detail and I'll create it for you!";
      return response;
    }

    return "Got it! Creating that task now...";
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
