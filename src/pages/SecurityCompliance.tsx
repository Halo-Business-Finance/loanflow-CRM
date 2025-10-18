import { CheckCircle, AlertTriangle, FileText, Shield, Settings, MoreVertical, Download, Calendar, Key, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"

export default function SecurityCompliance() {
  const headerActions = (
    <>
      <Button>
        <Download className="mr-2 h-4 w-4" />
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
          <DropdownMenuLabel>Compliance Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Audit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            View Policies
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Lock className="mr-2 h-4 w-4" />
            Compliance Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Key className="mr-2 h-4 w-4" />
            Certification Management
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Compliance"
        description="Monitor regulatory compliance and security standards adherence"
        actions={headerActions}
      />

      <ResponsiveContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StandardContentCard className="bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                  <p className="text-2xl font-bold text-foreground">96.5%</p>
                  <p className="text-xs text-muted-foreground">Overall compliance rating</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </StandardContentCard>

            <StandardContentCard className="bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Passed Checks</p>
                  <p className="text-2xl font-bold text-foreground">28</p>
                  <p className="text-xs text-muted-foreground">Out of 30 requirements</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </StandardContentCard>

            <StandardContentCard className="bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </StandardContentCard>

            <StandardContentCard className="bg-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Audit</p>
                  <p className="text-2xl font-bold text-foreground">7</p>
                  <p className="text-xs text-muted-foreground">Days ago</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </StandardContentCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="Compliance Standards">
              <p className="text-sm text-muted-foreground mb-4">Current adherence to industry standards</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SOC 2 Type II</p>
                      <p className="text-sm text-muted-foreground">Security controls audit</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">Compliant</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">GDPR</p>
                      <p className="text-sm text-muted-foreground">Data protection regulation</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">Compliant</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">PCI DSS</p>
                      <p className="text-sm text-muted-foreground">Payment card security</p>
                    </div>
                  </div>
                  <span className="text-sm text-yellow-600">Minor Issues</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">HIPAA</p>
                      <p className="text-sm text-muted-foreground">Healthcare data protection</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">Compliant</span>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Recent Compliance Activities">
              <p className="text-sm text-muted-foreground mb-4">Latest compliance checks and updates</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Security Policy Update</p>
                    <p className="text-sm text-muted-foreground">Updated password requirements - 2 days ago</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Access Review</p>
                    <p className="text-sm text-muted-foreground">Quarterly user access audit - 1 week ago</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Vulnerability Scan</p>
                    <p className="text-sm text-muted-foreground">Monthly security scan - 3 days ago</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Training Completion</p>
                    <p className="text-sm text-muted-foreground">Security awareness training - 1 week ago</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </StandardContentCard>
          </div>

          <StandardContentCard title="Compliance Action Items">
            <p className="text-sm text-muted-foreground mb-4">Items requiring immediate attention</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div>
                  <p className="font-medium text-yellow-900">PCI DSS Certificate Renewal</p>
                  <p className="text-sm text-yellow-700">Certificate expires in 30 days - requires renewal</p>
                </div>
                <Button size="sm" variant="outline">Schedule Renewal</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div>
                  <p className="font-medium text-blue-900">Quarterly Access Review</p>
                  <p className="text-sm text-blue-700">Review user permissions and access rights</p>
                </div>
                <Button size="sm" variant="outline">Start Review</Button>
              </div>
            </div>
          </StandardContentCard>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}