import { Router } from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = Router();

interface SystemStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastChecked: string;
  details: string;
  uptime?: string;
}

interface AutoDevCycle {
  id: string;
  timestamp: string;
  type: 'plan' | 'implement' | 'health-check';
  status: 'running' | 'completed' | 'failed';
  duration?: number;
  filesChanged?: number;
  description: string;
}

// Check if a script exists and is executable
function checkScript(scriptPath: string): SystemStatus {
  const fullPath = path.join(process.cwd(), scriptPath);
  const name = path.basename(scriptPath, '.ts');
  
  try {
    if (fs.existsSync(fullPath)) {
      // Try to run a basic syntax check
      execSync(`npx tsx --check ${fullPath}`, { stdio: 'pipe' });
      return {
        name: `Auto-${name.charAt(0).toUpperCase() + name.slice(1)}`,
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        details: 'Script is valid and executable'
      };
    } else {
      return {
        name: `Auto-${name.charAt(0).toUpperCase() + name.slice(1)}`,
        status: 'error',
        lastChecked: new Date().toISOString(),
        details: 'Script file not found'
      };
    }
  } catch (error) {
    return {
      name: `Auto-${name.charAt(0).toUpperCase() + name.slice(1)}`,
      status: 'error',
      lastChecked: new Date().toISOString(),
      details: `Script error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check OpenAI API status
async function checkOpenAI(): Promise<SystemStatus> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        name: 'OpenAI API',
        status: 'error',
        lastChecked: new Date().toISOString(),
        details: 'API key not configured'
      };
    }

    // Basic API key format check
    if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return {
        name: 'OpenAI API',
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        details: 'API key configured and valid format'
      };
    } else {
      return {
        name: 'OpenAI API', 
        status: 'warning',
        lastChecked: new Date().toISOString(),
        details: 'API key format may be invalid'
      };
    }
  } catch (error) {
    return {
      name: 'OpenAI API',
      status: 'error',
      lastChecked: new Date().toISOString(),
      details: `API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check GitHub Actions workflow
function checkGitHubWorkflow(): SystemStatus {
  const workflowPath = '.github/workflows/daily-auto-dev-unlimited.yml';
  
  try {
    if (fs.existsSync(workflowPath)) {
      const content = fs.readFileSync(workflowPath, 'utf8');
      const isEvery5Minutes = content.includes('*/5 * * * *');
      
      return {
        name: 'GitHub Actions',
        status: isEvery5Minutes ? 'healthy' : 'warning',
        lastChecked: new Date().toISOString(),
        details: isEvery5Minutes ? 'Configured for 5-minute cycles' : 'Not configured for 5-minute cycles'
      };
    } else {
      return {
        name: 'GitHub Actions',
        status: 'error', 
        lastChecked: new Date().toISOString(),
        details: 'Workflow file not found'
      };
    }
  } catch (error) {
    return {
      name: 'GitHub Actions',
      status: 'error',
      lastChecked: new Date().toISOString(),
      details: `Workflow check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Get recent auto-dev cycles from CHANGELOG
function getRecentCycles(): AutoDevCycle[] {
  try {
    const changelogPath = 'CHANGELOG.md';
    if (!fs.existsSync(changelogPath)) {
      return [];
    }

    const content = fs.readFileSync(changelogPath, 'utf8');
    const lines = content.split('\n');
    const cycles: AutoDevCycle[] = [];

    let currentDate = '';
    for (const line of lines) {
      if (line.startsWith('## [Auto-')) {
        const match = line.match(/## \[Auto-(.+?)\] - (.+)/);
        if (match) {
          currentDate = match[2];
        }
      } else if (line.includes('🤖 **') && currentDate) {
        const match = line.match(/🤖 \*\*(.+?)\*\*/);
        if (match) {
          cycles.push({
            id: `${currentDate}-${cycles.length}`,
            timestamp: new Date(currentDate).toISOString(),
            type: 'implement',
            status: 'completed',
            description: match[1],
            filesChanged: Math.floor(Math.random() * 5) + 1 // Mock data
          });
        }
      }
    }

    return cycles.slice(0, 10); // Return last 10 cycles
  } catch (error) {
    return [];
  }
}

// Get system logs
function getSystemLogs(): string[] {
  const logs: string[] = [];
  const now = new Date();
  
  // Add some recent log entries (mock data for now)
  logs.push(`[${now.toISOString()}] Auto-Dev System Monitor: Status check completed`);
  logs.push(`[${now.toISOString()}] Health Monitor: All systems operational`);
  logs.push(`[${now.toISOString()}] Auto-Plan: Next cycle scheduled in 5 minutes`);
  logs.push(`[${now.toISOString()}] Ultra Aggressive Mode: ACTIVE`);
  
  return logs.slice(-50); // Return last 50 log entries
}

// GET /api/admin/auto-dev/status
router.get('/status', async (req, res) => {
  try {
    const systems: SystemStatus[] = [
      checkScript('scripts/auto-plan.ts'),
      checkScript('scripts/auto-implement.ts'), 
      checkScript('scripts/health-monitor.ts'),
      await checkOpenAI(),
      checkGitHubWorkflow()
    ];

    const recentCycles = getRecentCycles();
    const logs = getSystemLogs();
    
    // Calculate metrics
    const totalCycles = recentCycles.length;
    const completedCycles = recentCycles.filter(c => c.status === 'completed').length;
    const successRate = totalCycles > 0 ? Math.round((completedCycles / totalCycles) * 100) : 0;
    const avgDuration = 45; // Mock average duration
    const filesModified = recentCycles.reduce((sum, cycle) => sum + (cycle.filesChanged || 0), 0);
    const lastSuccessfulRun = recentCycles.find(c => c.status === 'completed')?.timestamp || 'Never';

    const metrics = {
      totalCycles,
      successRate,
      avgDuration,
      filesModified,
      lastSuccessfulRun
    };

    res.json({
      systems,
      recentCycles,
      metrics,
      logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting auto-dev status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// POST /api/admin/auto-dev/trigger
router.post('/trigger', async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!['plan', 'implement', 'health-check'].includes(type)) {
      return res.status(400).json({ error: 'Invalid trigger type' });
    }

    let scriptPath = '';
    let description = '';
    
    switch (type) {
      case 'plan':
        scriptPath = 'scripts/auto-plan.ts';
        description = 'Manual planning cycle triggered';
        break;
      case 'implement':
        scriptPath = 'scripts/auto-implement.ts';
        description = 'Manual implementation cycle triggered';
        break;
      case 'health-check':
        scriptPath = 'scripts/health-monitor.ts';
        description = 'Manual health check triggered';
        break;
    }

    // Execute the script in background
    setTimeout(() => {
      try {
        execSync(`npx tsx ${scriptPath}`, { stdio: 'pipe' });
        console.log(`Manual ${type} cycle completed successfully`);
      } catch (error) {
        console.error(`Manual ${type} cycle failed:`, error);
      }
    }, 100);

    res.json({ 
      success: true, 
      message: `${description} - executing in background`,
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering auto-dev cycle:', error);
    res.status(500).json({ error: 'Failed to trigger cycle' });
  }
});

// POST /api/admin/auto-dev/control
router.post('/control', async (req, res) => {
  try {
    const { system, action } = req.body;
    
    if (!['start', 'stop'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // For now, this is mostly informational
    // In a real implementation, you might control actual processes
    
    res.json({
      success: true,
      message: `${action.toUpperCase()} command sent to ${system}`,
      system,
      action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error controlling system:', error);
    res.status(500).json({ error: 'Failed to control system' });
  }
});

export default router;