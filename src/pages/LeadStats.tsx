import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Users, Target } from "lucide-react"

export default function LeadStats() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Statistics</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics for your lead generation performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="widget-glass widget-glow">
          <CardHeader className="widget-content flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-2xl font-bold">254</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="widget-glass widget-glow">
          <CardHeader className="widget-content flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-2xl font-bold">24.5%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="widget-glass widget-glow">
          <CardHeader className="widget-content flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-2xl font-bold">156</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="widget-glass widget-glow">
          <CardHeader className="widget-content flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="widget-content">
            <div className="text-2xl font-bold">2.4h</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              15% faster
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="widget-glass widget-glow">
          <CardHeader className="widget-content">
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent className="widget-content space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Website</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">45%</Badge>
                <span className="text-sm text-muted-foreground">114 leads</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Referrals</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">30%</Badge>
                <span className="text-sm text-muted-foreground">76 leads</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Social Media</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">15%</Badge>
                <span className="text-sm text-muted-foreground">38 leads</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Other</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">10%</Badge>
                <span className="text-sm text-muted-foreground">26 leads</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="widget-glass widget-glow">
          <CardHeader className="widget-content">
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Current status of all leads</CardDescription>
          </CardHeader>
          <CardContent className="widget-content space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">New</span>
              <div className="flex items-center gap-2">
                <Badge>35%</Badge>
                <span className="text-sm text-muted-foreground">89 leads</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Contacted</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">25%</Badge>
                <span className="text-sm text-muted-foreground">64 leads</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Qualified</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">20%</Badge>
                <span className="text-sm text-muted-foreground">51 leads</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Converted</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">20%</Badge>
                <span className="text-sm text-muted-foreground">50 leads</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}