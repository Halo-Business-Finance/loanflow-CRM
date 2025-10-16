import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Database, Server, Monitor, Shield, ChevronDown } from "lucide-react"
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground">
            Manage system-wide settings and configurations
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Monitor className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Uptime this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
            <p className="text-xs text-muted-foreground">
              Total storage used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              Currently connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              Average CPU usage
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure core system functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Maintenance Mode</label>
                  <p className="text-xs text-muted-foreground">
                    Put system in maintenance mode
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto Backup</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically backup data daily
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Error Reporting</label>
                  <p className="text-xs text-muted-foreground">
                    Send error reports to administrators
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Debug Logging</label>
                  <p className="text-xs text-muted-foreground">
                    Enable detailed system logging
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Settings</CardTitle>
            <CardDescription>Optimize system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Cache Enabled</label>
                  <p className="text-xs text-muted-foreground">
                    Enable application caching
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Compression</label>
                  <p className="text-xs text-muted-foreground">
                    Compress API responses
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Rate Limiting</label>
                  <p className="text-xs text-muted-foreground">
                    Limit API requests per user
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">CDN</label>
                  <p className="text-xs text-muted-foreground">
                    Use content delivery network
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security and access controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Security Level</label>
                  <p className="text-xs text-muted-foreground">
                    Select system security configuration
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between">
                      <span>High Security</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] bg-card z-50">
                    <DropdownMenuLabel>Security Level</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Low Security</DropdownMenuItem>
                    <DropdownMenuItem>Medium Security</DropdownMenuItem>
                    <DropdownMenuItem>High Security</DropdownMenuItem>
                    <DropdownMenuItem>Maximum Security</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Two-Factor Auth</label>
                  <p className="text-xs text-muted-foreground">
                    Require 2FA for all users
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">IP Whitelist</label>
                  <p className="text-xs text-muted-foreground">
                    Restrict access by IP address
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Audit Logging</label>
                  <p className="text-xs text-muted-foreground">
                    Log all security events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system configuration and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Application Version</span>
                <span className="text-sm text-muted-foreground">v2.4.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Database Version</span>
                <span className="text-sm text-muted-foreground">PostgreSQL 15.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Server OS</span>
                <span className="text-sm text-muted-foreground">Ubuntu 22.04 LTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Runtime</span>
                <span className="text-sm text-muted-foreground">Node.js 18.17.0</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">2.1 GB / 8 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-muted-foreground">45.2 GB / 100 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Network I/O</span>
                <span className="text-sm text-muted-foreground">1.2 MB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Restart</span>
                <span className="text-sm text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
          <CardDescription>Perform system maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Database className="h-6 w-6" />
              <span>Backup Database</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span>Clear Cache</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Monitor className="h-6 w-6" />
              <span>System Health Check</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Server className="h-6 w-6" />
              <span>Restart Services</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Shield className="h-6 w-6" />
              <span>Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}