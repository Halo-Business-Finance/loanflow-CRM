import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useCalendarData } from "@/hooks/useCalendarData"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function CompactCalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { getEventsForDate, getDatesWithEvents, loading } = useCalendarData(currentMonth)

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500'
      case 'meeting':
      case 'team_meeting':
        return 'bg-purple-500'
      case 'followup':
      case 'follow_up':
        return 'bg-green-500'
      case 'deadline':
        return 'bg-red-500'
      case 'task':
        return 'bg-orange-500'
      default:
        return 'bg-muted-foreground'
    }
  }

  const datesWithEvents = getDatesWithEvents()
  const eventsForSelectedDate = date ? getEventsForDate(date) : []

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-sm text-muted-foreground">Loading events...</div>
          </div>
        ) : (
          <>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md w-full"
              modifiers={{
                hasEvents: datesWithEvents,
              }}
              modifiersClassNames={{
                hasEvents: "relative",
              }}
              components={{
                Day: ({ date: dayDate, ...props }) => {
                  const dayEvents = getEventsForDate(dayDate)
                  const isSelected = date && format(date, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd')
                  
                  return (
                    <div className="relative w-full h-full">
                      <button
                        {...props}
                        className={cn(
                          "relative w-9 h-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-md",
                          isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        <span className="text-sm">{dayDate.getDate()}</span>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5 justify-center">
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  getEventTypeColor(event.type)
                                )}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[8px] leading-none ml-0.5">+</span>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  )
                },
              }}
            />
            <div className="mt-3 text-xs text-muted-foreground text-center">
              {date ? (
                <div className="space-y-1">
                  <p className="font-medium">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </p>
                  {eventsForSelectedDate.length > 0 ? (
                    <p className="text-primary">
                      {eventsForSelectedDate.length} event{eventsForSelectedDate.length > 1 ? 's' : ''} scheduled
                    </p>
                  ) : (
                    <p>No events scheduled</p>
                  )}
                </div>
              ) : (
                <p>Select a date</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
