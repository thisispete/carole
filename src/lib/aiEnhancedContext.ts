/**
 * Enhanced AI Context System
 * Provides comprehensive organizational, user, and temporal context for intelligent AI decisions
 */

import type { AIContext } from "./aiContext.js";
import { getTasks, getTopPriorityTasks } from "./taskService.js";

// === ORGANIZATIONAL CONTEXT INTERFACES ===

export interface CompanyPolicy {
  id: string;
  name: string;
  type: "training" | "compliance" | "security" | "hr" | "operational";
  priority: "mandatory" | "recommended" | "optional";
  deadline: "absolute" | "relative" | "recurring";
  description: string;
  applicableRoles: string[];
  consequences: string;
  estimatedEffort: number; // hours
}

export interface TrainingRequirement {
  id: string;
  name: string;
  type: "compliance" | "skill" | "certification" | "safety" | "onboarding";
  mandatory: boolean;
  frequency: "annual" | "quarterly" | "monthly" | "onboarding" | "as-needed";
  deadline: Date | string;
  estimatedDuration: number; // hours
  prerequisites: string[];
  applicableRoles: string[];
  priority: number; // 1-10
  regulatoryRequirement: boolean;
  consequences: string;
}

export interface BusinessPriority {
  area: string;
  importance: number; // 1-10
  currentFocus: string;
  deadline?: Date;
  stakeholders: string[];
  impact: "low" | "medium" | "high" | "critical";
  description: string;
}

export interface ComplianceDeadline {
  id: string;
  name: string;
  deadline: Date;
  type: "regulatory" | "internal" | "contractual";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  requiredActions: string[];
}

// === USER CONTEXT INTERFACES ===

export interface UserProfile {
  userId: string;
  role: string;
  department: string;
  seniority: "junior" | "mid" | "senior" | "lead" | "manager" | "director";
  timeZone: string;
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    timezone: string;
  };
  skillLevel: SkillAssessment[];
  managerUserId?: string;
  directReports: string[];
}

export interface SkillAssessment {
  skill: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  lastAssessed: Date;
}

export interface WorkPattern {
  type: "focus_time" | "meetings" | "interruptions" | "deadlines";
  pattern: string;
  confidence: number;
}

export interface CompletionPattern {
  taskType: string;
  averageCompletionTime: number; // hours
  averagePriority: number;
  successRate: number; // 0-1
  commonBlockers: string[];
}

// === TEMPORAL CONTEXT INTERFACES ===

export interface UpcomingDeadline {
  id: string;
  title: string;
  deadline: Date;
  type: "task" | "compliance" | "project" | "meeting";
  priority: number;
  daysUntil: number;
}

export interface SeasonalPattern {
  period: string; // "Q1", "end-of-year", "summer"
  characteristics: string[];
  typicalWorkload: "light" | "normal" | "heavy" | "extreme";
  commonTasks: string[];
}

// === ENHANCED AI CONTEXT ===

export interface EnhancedAIContext extends AIContext {
  organizationalContext: {
    companyPolicies: CompanyPolicy[];
    mandatoryTraining: TrainingRequirement[];
    complianceDeadlines: ComplianceDeadline[];
    businessPriorities: BusinessPriority[];
    companyName: string;
    industry: string;
    regulatoryEnvironment: string[];
  };

  userContext: {
    profile: UserProfile;
    workPatterns: WorkPattern[];
    completionPatterns: CompletionPattern[];
    currentWorkload: {
      capacity: number; // 0-1, how full their schedule is
      stress: "low" | "medium" | "high";
      focusAreas: string[];
    };
  };

  temporalContext: {
    currentDateTime: Date;
    upcomingDeadlines: UpcomingDeadline[];
    seasonalContext: SeasonalPattern;
    recentContextEvents: string[];
    workloadTrends: {
      direction: "increasing" | "decreasing" | "stable";
      velocity: number; // tasks per day
    };
  };

  taskIntelligence: {
    similarTasks: any[];
    potentialDependencies: string[];
    estimatedEffortRange: [number, number]; // [min, max] hours
    riskFactors: string[];
  };
}

// === CONTEXT BUILDER ===

export class EnhancedContextBuilder {
  async buildEnhancedContext(userId?: string): Promise<EnhancedAIContext> {
    console.log("🧠 Building enhanced AI context...");

    // Build base context
    const baseContext = await this.buildBaseContext();

    // Load organizational context
    const orgContext = await this.loadOrganizationalContext();

    // Load user context
    const userContext = await this.loadUserContext(userId);

    // Build temporal context
    const temporalContext = await this.buildTemporalContext();

    // Analyze task intelligence
    const taskIntelligence = await this.analyzeTaskIntelligence(
      baseContext.allTasks
    );

    const enhancedContext: EnhancedAIContext = {
      ...baseContext,
      organizationalContext: orgContext,
      userContext,
      temporalContext,
      taskIntelligence,
    };

    console.log("✅ Enhanced context built:", {
      policies: orgContext.companyPolicies.length,
      trainings: orgContext.mandatoryTraining.length,
      upcomingDeadlines: temporalContext.upcomingDeadlines.length,
      userRole: userContext.profile.role,
    });

    return enhancedContext;
  }

  private async buildBaseContext(): Promise<AIContext> {
    // Import the existing buildAIContext function
    const { buildAIContext } = await import("./aiContext.js");
    return await buildAIContext();
  }

  private async loadOrganizationalContext() {
    // For now, return Block-specific context
    // In production, this would load from a configuration system
    return {
      companyName: "Block, Inc.",
      industry: "Financial Technology",
      regulatoryEnvironment: ["FinCEN", "SEC", "PCI-DSS", "SOX"],
      companyPolicies: this.getBlockCompanyPolicies(),
      mandatoryTraining: this.getBlockTrainingRequirements(),
      complianceDeadlines: this.getBlockComplianceDeadlines(),
      businessPriorities: this.getBlockBusinessPriorities(),
    };
  }

  private async loadUserContext(userId?: string) {
    // For now, return default context
    // In production, this would load from user management system
    return {
      profile: {
        userId: userId || "current-user",
        role: "Software Engineer",
        department: "Engineering",
        seniority: "mid" as const,
        timeZone: "America/Los_Angeles",
        workingHours: {
          start: "09:00",
          end: "17:00",
          timezone: "America/Los_Angeles",
        },
        skillLevel: [
          {
            skill: "TypeScript",
            level: "advanced" as const,
            lastAssessed: new Date(),
          },
          {
            skill: "React",
            level: "advanced" as const,
            lastAssessed: new Date(),
          },
          {
            skill: "AI/ML",
            level: "intermediate" as const,
            lastAssessed: new Date(),
          },
        ],
        directReports: [],
      },
      workPatterns: [
        {
          type: "focus_time" as const,
          pattern: "Most productive 9-11am and 2-4pm",
          confidence: 0.8,
        },
      ],
      completionPatterns: [
        {
          taskType: "coding",
          averageCompletionTime: 4,
          averagePriority: 6,
          successRate: 0.85,
          commonBlockers: ["unclear requirements", "dependencies"],
        },
      ],
      currentWorkload: {
        capacity: 0.7, // 70% capacity
        stress: "medium" as const,
        focusAreas: ["AI features", "task management"],
      },
    };
  }

  private async buildTemporalContext() {
    const now = new Date();

    return {
      currentDateTime: now,
      upcomingDeadlines: await this.getUpcomingDeadlines(),
      seasonalContext: this.getCurrentSeasonalContext(now),
      recentContextEvents: [
        "Started Q1 2025 planning cycle",
        "New compliance training requirements announced",
      ],
      workloadTrends: {
        direction: "stable" as const,
        velocity: 3.2, // tasks per day
      },
    };
  }

  private async analyzeTaskIntelligence(allTasks: any[]) {
    return {
      similarTasks: allTasks.slice(0, 3), // Most recent similar tasks
      potentialDependencies: [],
      estimatedEffortRange: [1, 8] as [number, number],
      riskFactors: ["unclear requirements", "external dependencies"],
    };
  }

  // === BLOCK-SPECIFIC CONTEXT DATA ===

  private getBlockCompanyPolicies(): CompanyPolicy[] {
    return [
      {
        id: "aml-training",
        name: "Anti-Money Laundering (AML) Training",
        type: "compliance",
        priority: "mandatory",
        deadline: "absolute",
        description:
          "Federal requirement for all financial services employees. Must be completed annually by February 15th.",
        applicableRoles: ["all"],
        consequences:
          "Regulatory violation, potential fines up to $500K, possible termination",
        estimatedEffort: 4,
      },
      {
        id: "security-awareness",
        name: "Security Awareness Training",
        type: "security",
        priority: "mandatory",
        deadline: "recurring",
        description:
          "Annual cybersecurity training covering phishing, data protection, and incident response",
        applicableRoles: ["all"],
        consequences: "Account suspension, access revocation",
        estimatedEffort: 2,
      },
      {
        id: "pci-compliance",
        name: "PCI-DSS Compliance Training",
        type: "compliance",
        priority: "mandatory",
        deadline: "recurring",
        description:
          "Payment Card Industry compliance training for employees handling payment data",
        applicableRoles: ["engineering", "payments", "operations"],
        consequences:
          "Audit failure, potential loss of payment processing ability",
        estimatedEffort: 3,
      },
    ];
  }

  private getBlockTrainingRequirements(): TrainingRequirement[] {
    return [
      {
        id: "aml-2025",
        name: "AML Training 2025",
        type: "compliance",
        mandatory: true,
        frequency: "annual",
        deadline: new Date("2025-02-15"),
        estimatedDuration: 4,
        prerequisites: [],
        applicableRoles: ["all"],
        priority: 10,
        regulatoryRequirement: true,
        consequences: "Legal violation, possible termination, company fines",
      },
      {
        id: "security-2025",
        name: "Security Awareness 2025",
        type: "safety",
        mandatory: true,
        frequency: "annual",
        deadline: new Date("2025-12-31"),
        estimatedDuration: 2,
        prerequisites: [],
        applicableRoles: ["all"],
        priority: 8,
        regulatoryRequirement: false,
        consequences: "Account suspension, security clearance revocation",
      },
    ];
  }

  private getBlockComplianceDeadlines(): ComplianceDeadline[] {
    return [
      {
        id: "aml-deadline-2025",
        name: "AML Training Compliance Deadline",
        deadline: new Date("2025-02-15"),
        type: "regulatory",
        severity: "critical",
        description:
          "Federal deadline for AML training completion - no extensions possible",
        requiredActions: [
          "Complete training",
          "Submit certificate",
          "Manager verification",
        ],
      },
    ];
  }

  private getBlockBusinessPriorities(): BusinessPriority[] {
    return [
      {
        area: "compliance",
        importance: 10,
        currentFocus: "Q1 2025 regulatory compliance",
        deadline: new Date("2025-03-31"),
        stakeholders: ["Legal", "Risk", "All Employees"],
        impact: "critical",
        description:
          "Critical regulatory deadlines must be met to avoid legal and financial consequences",
      },
      {
        area: "ai-innovation",
        importance: 8,
        currentFocus: "AI-powered product features",
        stakeholders: ["Product", "Engineering", "AI Team"],
        impact: "high",
        description: "Strategic focus on AI integration across Block products",
      },
    ];
  }

  private async getUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
    const now = new Date();

    return [
      {
        id: "aml-training",
        title: "AML Training 2025",
        deadline: new Date("2025-02-15"),
        type: "compliance",
        priority: 10,
        daysUntil: Math.ceil(
          (new Date("2025-02-15").getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
    ];
  }

  private getCurrentSeasonalContext(date: Date): SeasonalPattern {
    const month = date.getMonth() + 1; // 1-12

    if (month <= 3) {
      return {
        period: "Q1",
        characteristics: [
          "New year planning",
          "Compliance deadlines",
          "Goal setting",
        ],
        typicalWorkload: "heavy",
        commonTasks: ["AML training", "Annual reviews", "Planning"],
      };
    }

    // Default pattern
    return {
      period: "Standard",
      characteristics: ["Regular operations"],
      typicalWorkload: "normal",
      commonTasks: ["Feature development", "Bug fixes"],
    };
  }
}

// Export singleton instance
export const enhancedContextBuilder = new EnhancedContextBuilder();

// Convenience function
export async function buildEnhancedAIContext(
  userId?: string
): Promise<EnhancedAIContext> {
  return await enhancedContextBuilder.buildEnhancedContext(userId);
}
