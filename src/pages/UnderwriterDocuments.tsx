import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, CheckCircle, Clock, AlertTriangle, RefreshCw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function UnderwriterDocuments() {
  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">
                    Document Review
                  </h1>
                  <Badge variant="default" className="text-xs font-medium px-2 py-1">
                    176 Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and process loan documents for underwriting decisions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <Filter className="h-3 w-3 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <Upload className="h-3 w-3 mr-2" />
                Upload
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-6">
        {/* Document Review Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-primary">23</p>
                <p className="text-xs text-muted-foreground">Documents awaiting review</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-primary">145</p>
                <p className="text-xs text-muted-foreground">Documents approved today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Requires Attention</p>
                <p className="text-2xl font-bold text-primary">8</p>
                <p className="text-xs text-muted-foreground">Documents with issues</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Processed</p>
                <p className="text-2xl font-bold text-primary">1,234</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-2 border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Recent Document Reviews
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest documents processed by the underwriting team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Income Verification - John Doe</p>
                    <p className="text-sm text-muted-foreground">Loan Application #12345</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-green-600 border-green-600/20 bg-green-50">
                    Approved
                  </Badge>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Credit Report - Jane Smith</p>
                    <p className="text-sm text-muted-foreground">Loan Application #12346</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-yellow-600 border-yellow-600/20 bg-yellow-50">
                    Under Review
                  </Badge>
                  <Button size="sm" variant="outline">Review Now</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}