import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Code, 
  Database, 
  GitBranch, 
  Play, 
  RefreshCw, 
  Settings,
  Zap,
  XCircle
} from 'lucide-react';

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

interface Metrics {
  totalCycles: number;
  successRate: number;
  avgDuration: number;
  filesModified: number;
  lastSuccessfulRun: string;
}

export default function AutoDevMonitor() {
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [recentCycles, setRecentCycles] = useState<AutoDevCycle[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800', 
      error: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  const fetchSystemStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/auto-dev/status');
      const data = await response.json();
      setSystemStatus(data.systems || []);
      setRecentCycles(data.recentCycles || []);
      setMetrics(data.metrics || null);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const triggerManualCycle = async (type: 'plan' | 'implement' | 'health-check') => {
    try {
      const response = await fetch('/api/admin/auto-dev/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        setTimeout(fetchSystemStatus, 2000); // Refresh after 2 seconds
      }
    } catch (error) {
      console.error('Failed to trigger cycle:', error);
    }
  };

  const toggleSystem = async (systemName: string, action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/admin/auto-dev/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: systemName, action })
      });
      
      if (response.ok) {
        fetchSystemStatus();
      }
    } catch (error) {
      console.error('Failed to control system:', error);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading Auto-Dev Monitor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto-Dev System Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and control for the autonomous development system
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchSystemStatus} 
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.totalCycles || 0}</p>
                <p className="text-sm text-muted-foreground">Total Cycles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.successRate || 0}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.avgDuration || 0}s</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.filesModified || 0}</p>
                <p className="text-sm text-muted-foreground">Files Modified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current health status of all auto-dev components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((system) => (
                  <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(system.status)}
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <p className="text-sm text-muted-foreground">{system.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(system.status)}
                      {system.uptime && (
                        <span className="text-xs text-muted-foreground">
                          Uptime: {system.uptime}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Cycles */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Auto-Dev Cycles</CardTitle>
              <CardDescription>Latest autonomous development activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {recentCycles.map((cycle) => (
                    <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <GitBranch className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{cycle.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(cycle.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(cycle.status)}
                        {cycle.filesChanged && (
                          <span className="text-xs text-muted-foreground">
                            {cycle.filesChanged} files
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Real-time logs from auto-dev processes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="font-mono text-sm space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="p-2 border-l-2 border-gray-200 bg-gray-50">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Controls</CardTitle>
              <CardDescription>Manually trigger auto-dev processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => triggerManualCycle('plan')}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Trigger Planning</span>
                </Button>
                
                <Button 
                  onClick={() => triggerManualCycle('implement')}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Trigger Implementation</span>
                </Button>
                
                <Button 
                  onClick={() => triggerManualCycle('health-check')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Health Check</span>
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Manual triggers will interrupt the automatic 5-minute cycle. Use with caution.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure auto-dev system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cycle Interval</label>
                    <p className="text-sm text-muted-foreground">Current: Every 5 minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Aggressive Mode</label>
                    <p className="text-sm text-muted-foreground">Status: ENABLED</p>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ultra Aggressive Mode Active</AlertTitle>
                  <AlertDescription>
                    System will force implementations even when AI is conservative. 
                    Safety checks are minimized for maximum development speed.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}