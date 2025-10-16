import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, Activity, TrendingUp, Settings, MoreVertical, Bell, Lock, Key, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SecurityThreats() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Detection</h1>
          <p className="text-muted-foreground">
            Real-time threat monitoring and security incident management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <AlertTriangle className="mr-2 h-4 w-4" />
            View Alerts
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Security Options
                <MoreVertical className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Threat Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Configure Alerts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Ban className="mr-2 h-4 w-4" />
                Block IP Addresses
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" />
                Lockdown Mode
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Key className="mr-2 h-4 w-4" />
                Detection Rules
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              System security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Under investigation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Threats</CardTitle>
            <CardDescription>Current security incidents requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Suspicious Login Activity</p>
                    <p className="text-sm text-red-700">Multiple failed attempts from IP 192.168.1.100</p>
                  </div>
                </div>
                <Button size="sm" variant="destructive">Investigate</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <Activity className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Unusual Data Access</p>
                    <p className="text-sm text-yellow-700">User accessing data outside normal pattern</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Categories</CardTitle>
            <CardDescription>Breakdown of detected threats by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Brute Force Attacks</p>
                  <p className="text-sm text-muted-foreground">Login attempts</p>
                </div>
                <span className="text-sm font-medium">15</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Suspicious Activity</p>
                  <p className="text-sm text-muted-foreground">Anomalous behavior</p>
                </div>
                <span className="text-sm font-medium">7</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Malware Detection</p>
                  <p className="text-sm text-muted-foreground">File uploads</p>
                </div>
                <span className="text-sm font-medium">0</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Data Exfiltration</p>
                  <p className="text-sm text-muted-foreground">Unusual downloads</p>
                </div>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest threat detection activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 font-medium text-sm border-b pb-2">
              <span>Time</span>
              <span>Threat Type</span>
              <span>Source</span>
              <span>Severity</span>
              <span>Status</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">2 min ago</span>
              <span>Brute Force</span>
              <span>192.168.1.100</span>
              <span className="text-red-600">High</span>
              <span className="text-yellow-600">Investigating</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">15 min ago</span>
              <span>Suspicious Access</span>
              <span>Internal User</span>
              <span className="text-yellow-600">Medium</span>
              <span className="text-blue-600">Monitoring</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">1 hour ago</span>
              <span>Failed Login</span>
              <span>External</span>
              <span className="text-gray-600">Low</span>
              <span className="text-green-600">Resolved</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}