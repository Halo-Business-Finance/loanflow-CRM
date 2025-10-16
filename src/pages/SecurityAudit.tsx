import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Filter, Calendar, Shield, Key, Lock, Settings, MoreVertical, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SecurityAudit() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail of all system activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
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
              <DropdownMenuLabel>Audit Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Configure Retention
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Key className="mr-2 h-4 w-4" />
                Access Controls
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" />
                Archive Logs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Alert Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Successful logins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Access</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">
              Records accessed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Changes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Configuration updates
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Events</CardTitle>
          <CardDescription>Latest system activities and security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 font-medium text-sm border-b pb-2">
              <span>Timestamp</span>
              <span>User</span>
              <span>Action</span>
              <span>Resource</span>
              <span>Status</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">2 min ago</span>
              <span>john.doe@example.com</span>
              <span>LOGIN</span>
              <span>System</span>
              <span className="text-green-600">SUCCESS</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">5 min ago</span>
              <span>jane.smith@example.com</span>
              <span>VIEW_LEAD</span>
              <span>Lead #12345</span>
              <span className="text-green-600">SUCCESS</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">10 min ago</span>
              <span>admin@example.com</span>
              <span>UPDATE_USER</span>
              <span>User #789</span>
              <span className="text-green-600">SUCCESS</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">15 min ago</span>
              <span>unknown@example.com</span>
              <span>LOGIN</span>
              <span>System</span>
              <span className="text-red-600">FAILED</span>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg">
              <span className="text-muted-foreground">20 min ago</span>
              <span>mike.wilson@example.com</span>
              <span>DOWNLOAD</span>
              <span>Document #456</span>
              <span className="text-green-600">SUCCESS</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}