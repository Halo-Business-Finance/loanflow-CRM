import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { Activity, TrendingUp, AlertTriangle, Shield } from "lucide-react"

export default function UnderwriterRisk() {
  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Risk Assessment"
        description="Comprehensive risk analysis and assessment tools for loan underwriting"
      />

      <ResponsiveContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">High Risk</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Applications flagged</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Medium Risk</span>
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">Requires closer review</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Low Risk</span>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Safe to proceed</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Risk Score Avg</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">74.5</div>
              <p className="text-xs text-muted-foreground">Portfolio average</p>
            </StandardContentCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="Risk Factors Analysis">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Credit Score Range</span>
                  <span className="text-sm font-medium">650-850</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Debt-to-Income Ratio</span>
                  <span className="text-sm font-medium">&lt; 43%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Employment History</span>
                  <span className="text-sm font-medium">2+ years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Down Payment</span>
                  <span className="text-sm font-medium">≥ 20%</span>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Recent Risk Assessments">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Application #12345</p>
                    <p className="text-sm text-muted-foreground">John Doe - $450,000</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">Low Risk (85)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Application #12346</p>
                    <p className="text-sm text-muted-foreground">Jane Smith - $320,000</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-yellow-600">Medium Risk (65)</span>
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </div>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}