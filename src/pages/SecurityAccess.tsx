import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { StandardKPICard } from "@/components/StandardKPICard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { Shield, Users, Key, Lock, Settings, UserPlus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SecurityAccess() {
  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Access Management"
        description="Manage user access permissions and security controls"
        actions={
          <div className="flex items-center gap-3">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
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
                <DropdownMenuLabel>Security Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Configure Policies
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  Manage API Keys
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  Session Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Bulk User Actions
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
              title="Active Users"
              value="48"
              trend={{
                value: "Currently logged in",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Admin Users"
              value="5"
              trend={{
                value: "With admin privileges",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="API Keys"
              value="12"
              trend={{
                value: "Active integrations",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Failed Logins"
              value="3"
              trend={{
                value: "Last 24 hours",
                direction: "neutral"
              }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="User Permissions">
              <p className="text-sm text-muted-foreground mb-4">
                Manage role-based access control
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Lead Manager</p>
                    <p className="text-sm text-muted-foreground">12 users assigned</p>
                  </div>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Underwriter</p>
                    <p className="text-sm text-muted-foreground">8 users assigned</p>
                  </div>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Administrator</p>
                    <p className="text-sm text-muted-foreground">5 users assigned</p>
                  </div>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Recent Access Events">
              <p className="text-sm text-muted-foreground mb-4">
                Latest security events
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">User Login</p>
                    <p className="text-sm text-muted-foreground">john.doe@example.com - 2 min ago</p>
                  </div>
                  <span className="text-sm text-green-600">Success</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Permission Change</p>
                    <p className="text-sm text-muted-foreground">jane.smith@example.com - 15 min ago</p>
                  </div>
                  <span className="text-sm text-blue-600">Updated</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Failed Login</p>
                    <p className="text-sm text-muted-foreground">unknown@example.com - 1 hour ago</p>
                  </div>
                  <span className="text-sm text-red-600">Failed</span>
                </div>
              </div>
            </StandardContentCard>
          </div>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}