#!/usr/bin/env npx tsx

/**
 * VetTrack Pro - Health Monitor for Auto-Dev System
 * 
 * Monitors the auto-dev system status and provides real-time feedback
 * on system health, recent improvements, and cycle performance.
 */

import fs from 'fs';
import { execSync } from 'child_process';

interface SystemHealth {
  timestamp: string;
  autoDevActive: boolean;
  lastPlanGenerated: string | null;
  lastImplementation: string | null;
  recentImprovements: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  issues: string[];
}

async function checkWorkflowStatus(): Promise<{ active: boolean; lastRun: string | null }> {
  try {
    // Check if GitHub Actions workflow exists and is configured
    const workflowExists = fs.existsSync('.github/workflows/daily-auto-dev-unlimited.yml');
    
    if (!workflowExists) {
      return { active: false, lastRun: null };
    }

    // Check for recent proposal files
    const proposalExists = fs.existsSync('auto/proposal.md');
    let lastRun: string | null = null;
    
    if (proposalExists) {
      const stats = fs.statSync('auto/proposal.md');
      lastRun = stats.mtime.toISOString();
    }

    return { active: true, lastRun };
  } catch (error) {
    return { active: false, lastRun: null };
  }
}

async function countRecentImprovements(): Promise<number> {
  try {
    // Count commits with [auto] tag in the last 24 hours
    const result = execSync('git log --oneline --since="24 hours ago" --grep="\\[auto\\]" | wc -l', 
      { encoding: 'utf8', stdio: 'pipe' });
    return parseInt(result.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

async function checkSystemIssues(): Promise<string[]> {
  const issues: string[] = [];

  // Check for LSP errors
  try {
    if (fs.existsSync('server/routes.ts')) {
      const content = fs.readFileSync('server/routes.ts', 'utf8');
      // Simple check for common TypeScript issues
      if (content.includes('any')) {
        issues.push('TypeScript any types detected');
      }
    }
  } catch (error) {
    issues.push('Failed to check TypeScript files');
  }

  // Check for missing secrets
  if (!process.env.OPENAI_API_KEY) {
    issues.push('OPENAI_API_KEY not configured');
  }

  // Check if auto directory exists
  if (!fs.existsSync('auto')) {
    issues.push('Auto directory missing');
  }

  // Check if telemetry files exist
  if (!fs.existsSync('telemetry/metrics.json')) {
    issues.push('Metrics file missing');
  }

  return issues;
}

async function getSystemHealth(): Promise<SystemHealth> {
  const timestamp = new Date().toISOString();
  
  const workflowStatus = await checkWorkflowStatus();
  const recentImprovements = await countRecentImprovements();
  const issues = await checkSystemIssues();

  let systemStatus: 'healthy' | 'warning' | 'error' = 'healthy';
  if (issues.length > 3) {
    systemStatus = 'error';
  } else if (issues.length > 0) {
    systemStatus = 'warning';
  }

  return {
    timestamp,
    autoDevActive: workflowStatus.active,
    lastPlanGenerated: workflowStatus.lastRun,
    lastImplementation: workflowStatus.lastRun,
    recentImprovements,
    systemStatus,
    issues
  };
}

function displayHealthReport(health: SystemHealth) {
  console.log('\n🤖 VetTrack Pro Auto-Dev System Health Report');
  console.log('================================================');
  console.log(`📅 Timestamp: ${health.timestamp}`);
  console.log(`🔄 Auto-Dev Active: ${health.autoDevActive ? '✅ YES' : '❌ NO'}`);
  console.log(`📝 Last Plan: ${health.lastPlanGenerated || 'Never'}`);
  console.log(`⚡ Recent Improvements (24h): ${health.recentImprovements}`);
  
  console.log(`🏥 System Status: ${
    health.systemStatus === 'healthy' ? '✅ HEALTHY' :
    health.systemStatus === 'warning' ? '⚠️ WARNING' :
    '❌ ERROR'
  }`);

  if (health.issues.length > 0) {
    console.log('\n🔍 Issues Detected:');
    health.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log('\n📊 Next Steps:');
  if (!health.autoDevActive) {
    console.log('  - Enable GitHub Actions workflow');
    console.log('  - Configure OPENAI_API_KEY secret');
  } else if (health.systemStatus === 'error') {
    console.log('  - Address critical issues above');
    console.log('  - Check system logs for errors');
  } else {
    console.log('  - System running normally, monitoring continues');
    console.log('  - Next improvement cycle: every 5 minutes');
  }

  console.log('\n🔗 Quick Commands:');
  console.log('  npm run health:check     - Check app health');
  console.log('  npx tsx scripts/auto-plan.ts    - Generate plan manually');
  console.log('  npx tsx scripts/auto-implement.ts - Execute plan manually');
  
  console.log('\n================================================\n');
}

async function main() {
  const health = await getSystemHealth();
  displayHealthReport(health);

  // Save health report for tracking
  if (!fs.existsSync('telemetry')) {
    fs.mkdirSync('telemetry', { recursive: true });
  }
  
  fs.writeFileSync('telemetry/health.json', JSON.stringify(health, null, 2));
  
  // Exit with error code if system has critical issues
  process.exit(health.systemStatus === 'error' ? 1 : 0);
}

// Execute if run directly
main().catch(console.error);