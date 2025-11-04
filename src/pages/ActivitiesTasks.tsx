import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
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
            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pending Tasks</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Due today</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completed</span>
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overdue</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </StandardContentCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="Today's Tasks">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium">Review loan application #12345</p>
                    <p className="text-sm text-muted-foreground">Due: 2:00 PM</p>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium">Call client for documentation</p>
                    <p className="text-sm text-muted-foreground">Due: 3:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox checked />
                  <div className="flex-1">
                    <p className="font-medium line-through text-muted-foreground">Send approval letter</p>
                    <p className="text-sm text-muted-foreground">Completed: 10:15 AM</p>
                  </div>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Upcoming Tasks">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium">Prepare quarterly report</p>
                    <p className="text-sm text-muted-foreground">Due: Tomorrow</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium">Team meeting preparation</p>
                    <p className="text-sm text-muted-foreground">Due: Wednesday</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium">Update client contact information</p>
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