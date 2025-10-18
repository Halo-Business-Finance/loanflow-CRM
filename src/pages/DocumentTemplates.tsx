import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Edit, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"

export default function DocumentTemplates() {
  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Document Templates"
        description="Manage and customize loan document templates"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Loan Application</span>
            </CardTitle>
            <CardDescription>Standard loan application form template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Last modified: 2 days ago</p>
                <p>Used: 45 times this month</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Income Verification</span>
            </CardTitle>
            <CardDescription>Template for income verification requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Last modified: 1 week ago</p>
                <p>Used: 23 times this month</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Property Appraisal</span>
            </CardTitle>
            <CardDescription>Property appraisal request template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Last modified: 3 days ago</p>
                <p>Used: 18 times this month</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Credit Authorization</span>
            </CardTitle>
            <CardDescription>Credit check authorization form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Last modified: 5 days ago</p>
                <p>Used: 67 times this month</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Disclosure Statement</span>
            </CardTitle>
            <CardDescription>Required disclosure statement template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Last modified: 1 week ago</p>
                <p>Used: 34 times this month</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Closing Documents</span>
            </CardTitle>
            <CardDescription>Complete closing document package</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Last modified: 3 days ago</p>
                <p>Used: 12 times this month</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </StandardPageLayout>
  )
}