import { useState } from "react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardPageHeader } from "@/components/StandardPageHeader";
import { StandardContentCard } from "@/components/StandardContentCard";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useCalendarData } from "@/hooks/useCalendarData";
import { EventListSidebar } from "@/components/calendar/EventListSidebar";
import { ScheduleMeetingModal } from "@/components/calendar/ScheduleMeetingModal";
import { addMonths, subMonths, format, isToday, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ActivitiesCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const { events, loading, getEventsForDate, getDatesWithEvents, refetch } = useCalendarData(currentMonth);
  
  const datesWithEvents = getDatesWithEvents();
  const selectedDateEvents = getEventsForDate(selectedDate);
  const todayEvents = getEventsForDate(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getEventCountForDate = (date: Date) => {
    return getEventsForDate(date).length;
  };

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Calendar"
        description="Manage your appointments, meetings, and important deadlines"
        actions={
          <Button onClick={() => setShowScheduleModal(true)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule Event
          </Button>
        }
      />
      
      <ResponsiveContainer>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StandardContentCard>
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentMonth(new Date());
                        setSelectedDate(new Date());
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Loading calendar...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      modifiers={{
                        hasEvents: datesWithEvents,
                      }}
                      modifiersClassNames={{
                        hasEvents: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full",
                      }}
                      className="rounded-md w-full [&_.rdp-caption]:hidden"
                      classNames={{
                        months: "w-full",
                        month: "w-full",
                        table: "w-full border-collapse",
                        head_row: "flex w-full",
                        head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                        row: "flex w-full mt-2",
                        cell: "p-0 relative flex-1 text-center text-sm focus-within:relative focus-within:z-20 h-16",
                        day: "w-full h-16 p-0 font-normal aria-selected:opacity-100",
                      }}
                    />
                    
                    {/* Event count indicators */}
                    <div className="absolute inset-0 pointer-events-none">
                      {datesWithEvents.map((date) => {
                        const count = getEventCountForDate(date);
                        if (count > 1) {
                          return (
                            <div
                              key={date.toISOString()}
                              className="absolute text-xs font-medium text-primary"
                              style={{
                                // Position would need calculation based on calendar grid
                                display: 'none' // Simplified for now
                              }}
                            >
                              {count}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Has Events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{events.length}</Badge>
                    <span>Total Events This Month</span>
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </div>

          <div className="space-y-6">
            <StandardContentCard title={isToday(selectedDate) ? "Today's Schedule" : "Selected Day"}>
              <EventListSidebar 
                events={selectedDateEvents}
                selectedDate={selectedDate}
              />
            </StandardContentCard>

            <StandardContentCard title="Quick Actions">
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  New Event
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    setShowScheduleModal(true);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Block Time
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    setShowScheduleModal(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team Meeting
                </Button>
              </div>
            </StandardContentCard>
          </div>
        </div>
      </ResponsiveContainer>

      <ScheduleMeetingModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        selectedDate={selectedDate}
        onSuccess={refetch}
      />
    </StandardPageLayout>
  );
}