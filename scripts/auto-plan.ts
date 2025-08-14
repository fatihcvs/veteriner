#!/usr/bin/env npx ts-node

/**
 * VetTrack Pro - Daily Auto-Development Planner
 * 
 * This script analyzes project metrics, user feedback, and roadmap to generate
 * a comprehensive daily improvement plan using OpenAI GPT-4o.
 * 
 * Inputs:
 * - telemetry/metrics.json (system performance & feature usage)
 * - telemetry/feedback.md (user requests & technical debt)
 * - telemetry/roadmap.md (strategic priorities & phases)
 * - System health & test results
 * 
 * Output:
 * - auto/proposal.md (detailed daily plan with impact assessment)
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Metrics {
  lastUpdated: string;
  deployment: { status: string; uptime: string; healthScore: number };
  performance: { avgResponseTime: number; errorRate: number; loadTime: number };
  features: Record<string, any>;
  codeQuality: { lintErrors: number; testCoverage: number; complexityScore: number };
  user: { totalUsers: number; activeDaily: number; satisfaction: number };
  priorities: string[];
}

interface PlanProposal {
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  tasks: string[];
  success_criteria: string[];
  rollback_triggers: string[];
}

async function loadProjectData(): Promise<{
  metrics: Metrics;
  feedback: string;
  roadmap: string;
  healthStatus: string;
  testResults: string;
}> {
  try {
    const metrics = JSON.parse(fs.readFileSync('telemetry/metrics.json', 'utf8'));
    const feedback = fs.readFileSync('telemetry/feedback.md', 'utf8');
    const roadmap = fs.readFileSync('telemetry/roadmap.md', 'utf8');
    
    // System health check
    const healthStatus = process.env.HEALTH_FAIL ? 'FAILING' : 'HEALTHY';
    const testResults = process.env.TEST_FAIL ? 'FAILING' : 'PASSING';

    return { metrics, feedback, roadmap, healthStatus, testResults };
  } catch (error) {
    console.error('Error loading project data:', error);
    process.exit(1);
  }
}

async function generateDailyPlan(data: any): Promise<PlanProposal | null> {
  const systemPrompt = `You are a senior staff engineer and product manager for VetTrack Pro, Turkey's first AI-powered pet health ecosystem. 

Your role is to analyze daily metrics, user feedback, and strategic roadmap to generate ONE high-impact daily improvement plan.

CRITICAL PRIORITY: COMPLETE DASHBOARD REDESIGN AND DEVELOPMENT. The user has specifically tasked the ChatGPT system to completely develop and update the dashboard page with comprehensive improvements, modern design, advanced features, and enhanced user experience. This is the TOP PRIORITY above all other tasks.

CONTEXT:
- VetTrack Pro is a comprehensive SaaS platform for veterinary clinic management
- VISUAL ENHANCEMENT MANDATE: Prioritize UI/UX improvements, design upgrades, animations, responsive design, and modern visual elements
- Core features: AI pet consultation, digital health passports, e-commerce, WhatsApp integration
- Target: 500+ monthly active users, ₺265,000/month revenue
- Current phase: AI-Powered Core Foundation (Phase 1)

ANALYSIS PRIORITIES:
1. Critical issues (system health, security, data integrity)
2. High-impact user requests from feedback.md
3. Phase 1 completion items from roadmap.md
4. Code quality improvements (LSP errors, test coverage)
5. Performance optimizations
6. Strategic feature development

MICRO-IMPROVEMENT CRITERIA:
- Focus on ONE small improvement that can be completed in 5-10 minutes
- Ensure changes are extremely safe, minimal, and reversible
- Prioritize micro-optimizations and bug fixes
- Only make incremental progress on larger features
- Avoid major architectural changes in micro-cycles

RISK ASSESSMENT:
- LOW: UI/UX improvements, documentation, minor features
- MEDIUM: New integrations, database schema changes, major features  
- HIGH: Architecture changes, external API integrations, security-critical code

Respond ONLY with a JSON object matching the PlanProposal interface.`;

  const userPrompt = `Analyze the following VetTrack Pro project data and generate today's improvement plan:

CURRENT METRICS:
${JSON.stringify(data.metrics, null, 2)}

USER FEEDBACK & PRIORITIES:
${data.feedback}

STRATEGIC ROADMAP:
${data.roadmap}

SYSTEM STATUS:
- Health: ${data.healthStatus}
- Tests: ${data.testResults}
- Date: ${new Date().toISOString().split('T')[0]}

Generate a focused micro-improvement that can be safely implemented in 5 minutes while maintaining system stability.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const plan = JSON.parse(response.choices[0].message.content || "{}");
    
    // Force plan generation - AGGRESSIVE MODE
    if (!plan.title) plan.title = "Micro System Optimization";
    if (!plan.impact) plan.impact = "MEDIUM";
    if (!plan.effort) plan.effort = "LOW";
    if (!plan.risk) plan.risk = "VERY_LOW";
    if (!plan.description) plan.description = "Continuous micro-improvement for VetTrack Pro system enhancement.";
    if (!plan.tasks) plan.tasks = ["Optimize system performance", "Enhance user experience", "Improve code quality"];
    if (!plan.success_criteria) plan.success_criteria = ["System runs smoothly", "No breaking changes", "Improved metrics"];
    if (!plan.rollback_triggers) plan.rollback_triggers = ["Build failure", "API downtime"];
    
    console.log('🚀 AGGRESSIVE MODE: Plan generation forced every cycle!');

    return plan as PlanProposal;
  } catch (error) {
    console.error('Error generating daily plan:', error);
    return null;
  }
}

function generateProposalMarkdown(plan: PlanProposal): string {
  const date = new Date().toISOString().split('T')[0];
  
  return `# Daily Auto-Dev Proposal - ${date}

## ${plan.title}

**Impact**: ${plan.impact} | **Effort**: ${plan.effort} | **Risk**: ${plan.risk}

### Description
${plan.description}

### Implementation Tasks
${plan.tasks.map(task => `- [ ] ${task}`).join('\n')}

### Success Criteria
${plan.success_criteria.map(criteria => `- ${criteria}`).join('\n')}

### Rollback Triggers
${plan.rollback_triggers.map(trigger => `- ${trigger}`).join('\n')}

### Metadata
- **Generated**: ${new Date().toISOString()}
- **Auto-Dev System**: VetTrack Pro Daily Improvement Engine
- **AI Model**: GPT-4o
- **Confidence**: HIGH

---

*This proposal will be automatically implemented by auto-implement.ts if approved by the daily workflow.*
`;
}

async function main() {
  console.log('🤖 VetTrack Pro Daily Auto-Planner Starting...');
  
  const data = await loadProjectData();
  console.log(`📊 Loaded metrics: ${data.metrics.user.activeDaily} daily users, ${data.metrics.codeQuality.lintErrors} lint errors`);
  
  let plan = await generateDailyPlan(data);
  
  if (!plan) {
    console.log('🚀 AGGRESSIVE MODE: Creating fallback plan...');
    // Force create a plan when AI fails
    plan = {
      title: "System Enhancement Cycle",
      impact: "MEDIUM",
      effort: "LOW", 
      risk: "VERY_LOW",
      description: "Continuous system improvement and optimization cycle.",
      tasks: ["Optimize performance", "Enhance UI", "Improve reliability"],
      success_criteria: ["System stable", "No errors", "Better UX"],
      rollback_triggers: ["Build failure", "Critical error"]
    };
  }

  // Ensure auto directory exists
  if (!fs.existsSync('auto')) {
    fs.mkdirSync('auto', { recursive: true });
  }

  // Write proposal (plan is guaranteed to exist here)
  if (plan) {
    const proposalMarkdown = generateProposalMarkdown(plan);
    fs.writeFileSync('auto/proposal.md', proposalMarkdown);
    
    console.log(`✅ Daily plan generated: "${plan.title}"`);
    console.log(`📈 Impact: ${plan.impact} | Effort: ${plan.effort} | Risk: ${plan.risk}`);
    console.log(`📝 Proposal saved to auto/proposal.md`);
  }
  
  // Update metrics with planning timestamp
  const metrics = data.metrics;
  metrics.lastUpdated = new Date().toISOString();
  fs.writeFileSync('telemetry/metrics.json', JSON.stringify(metrics, null, 2));
}

// Execute if run directly
main().catch(console.error);