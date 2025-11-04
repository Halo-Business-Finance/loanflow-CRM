import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { StandardKPICard } from "@/components/StandardKPICard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { CheckSquare, Clock, AlertTriangle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function ActivitiesTasks() {
  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Tasks"
        description="Manage your daily tasks and action items"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        }
      />

      <ResponsiveContainer>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StandardKPICard
              title="Pending Tasks"
              value="12"
              trend={{ value: "Due today", direction: "neutral" }}
            />

            <StandardKPICard
              title="Completed"
              value="8"
              trend={{ value: "Today", direction: "up" }}
            />

            <StandardKPICard
              title="Overdue"
              value="3"
              trend={{ value: "Requires attention", direction: "down" }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="Today's Tasks">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Review loan application #12345</p>
                    <p className="text-sm text-muted-foreground">Due: 2:00 PM</p>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Call client for documentation</p>
                    <p className="text-sm text-muted-foreground">Due: 3:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border/50">
                  <Checkbox checked />
                  <div className="flex-1">
                    <p className="font-medium line-through text-muted-foreground">Send approval letter</p>
                    <p className="text-sm text-muted-foreground">Completed: 10:15 AM</p>
                  </div>
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Upcoming Tasks">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Prepare quarterly report</p>
                    <p className="text-sm text-muted-foreground">Due: Tomorrow</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Team meeting preparation</p>
                    <p className="text-sm text-muted-foreground">Due: Wednesday</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Update client contact information</p>
                    <p className="text-sm text-muted-foreground">Due: Friday</p>
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