import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { StandardKPICard } from "@/components/StandardKPICard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { Settings, Database, Server, Monitor, Shield, Activity, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SettingsSystem() {
  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="System Configuration"
        description="Manage system-wide settings and configurations"
        actions={
          <div className="flex items-center gap-3">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Actions
                  <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border shadow-large z-50">
                <DropdownMenuLabel>System Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Database className="mr-2 h-4 w-4" />
                  Backup Database
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Clear Cache
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Monitor className="mr-2 h-4 w-4" />
                  System Health Check
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Server className="mr-2 h-4 w-4" />
                  Restart Services
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Security Scan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      
      <ResponsiveContainer padding="md" maxWidth="full">
        <div className="space-y-6">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StandardKPICard 
              title="System Health"
              value="99.9%"
              trend={{
                value: "Uptime this month",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Database Size"
              value="2.4 GB"
              trend={{
                value: "Total storage used",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Active Sessions"
              value="48"
              trend={{
                value: "Currently connected",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="System Load"
              value="23%"
              trend={{
                value: "Average CPU usage",
                direction: "neutral"
              }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="System Settings">
              <p className="text-sm text-muted-foreground mb-4">
                Configure core system functionality
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <p className="text-xs text-muted-foreground">
                      Put system in maintenance mode
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Auto Backup</label>
                    <p className="text-xs text-muted-foreground">
                      Automatically backup data daily
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Error Reporting</label>
                    <p className="text-xs text-muted-foreground">
                      Send error reports to administrators
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Debug Logging</label>
                    <p className="text-xs text-muted-foreground">
                      Enable detailed system logging
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Performance Settings">
              <p className="text-sm text-muted-foreground mb-4">
                Optimize system performance
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Cache Enabled</label>
                    <p className="text-xs text-muted-foreground">
                      Enable application caching
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Compression</label>
                    <p className="text-xs text-muted-foreground">
                      Compress API responses
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Rate Limiting</label>
                    <p className="text-xs text-muted-foreground">
                      Limit API requests per user
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">CDN</label>
                    <p className="text-xs text-muted-foreground">
                      Use content delivery network
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Security Settings">
              <p className="text-sm text-muted-foreground mb-4">
                Configure security and access controls
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Two-Factor Auth</label>
                    <p className="text-xs text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">IP Whitelist</label>
                    <p className="text-xs text-muted-foreground">
                      Restrict access by IP address
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Audit Logging</label>
                    <p className="text-xs text-muted-foreground">
                      Log all security events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </StandardContentCard>
          </div>

          <StandardContentCard title="System Information">
            <p className="text-sm text-muted-foreground mb-4">
              Current system configuration and status
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Application Version</span>
                  <span className="text-sm text-muted-foreground">v2.4.1</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Database Version</span>
                  <span className="text-sm text-muted-foreground">PostgreSQL 15.2</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Server OS</span>
                  <span className="text-sm text-muted-foreground">Ubuntu 22.04 LTS</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Runtime</span>
                  <span className="text-sm text-muted-foreground">Node.js 18.17.0</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">2.1 GB / 8 GB</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Disk Usage</span>
                  <span className="text-sm text-muted-foreground">45.2 GB / 100 GB</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Network I/O</span>
                  <span className="text-sm text-muted-foreground">1.2 MB/s</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Last Restart</span>
                  <span className="text-sm text-muted-foreground">3 days ago</span>
                </div>
              </div>
            </div>
          </StandardContentCard>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}