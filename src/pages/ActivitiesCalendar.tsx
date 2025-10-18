import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { Calendar, Clock, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ActivitiesCalendar() {
  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Calendar"
        description="Manage your appointments, meetings, and important deadlines"
        actions={
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        }
      />
      
      <ResponsiveContainer>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <StandardContentCard title="Calendar View">
              <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Calendar Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your calendar to view appointments
                  </p>
                </div>
              </div>
            </StandardContentCard>
          </div>

          <div className="space-y-6">
            <StandardContentCard title="Today's Schedule">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Client Meeting</p>
                    <p className="text-sm text-muted-foreground">9:00 AM - John Doe</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Team Standup</p>
                    <p className="text-sm text-muted-foreground">10:30 AM - Conference Room</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Property Visit</p>
                    <p className="text-sm text-muted-foreground">2:00 PM - 123 Main St</p>
                  </div>
                </div>
              </div>
            </StandardContentCard>

            <StandardContentCard title="Quick Actions">
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
                <Button className="w-full" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Block Time
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Team Meeting
                </Button>
              </div>
            </StandardContentCard>
          </div>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}