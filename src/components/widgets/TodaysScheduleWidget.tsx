import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, CalendarPlus } from 'lucide-react';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function TodaysScheduleWidget() {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());
  const { events, loading, getEventsForDate } = useCalendarData(currentDate);
  const todaysEvents = getEventsForDate(currentDate);

  const formatEventTime = (date: Date) => {
    try {
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-red-500';
      case 'followup':
        return 'bg-orange-500';
      case 'call':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-normal text-[#161616]">
              Today's Schedule
            </CardTitle>
          </div>
          <Button 
            variant="link" 
            size="sm"
            onClick={() => navigate('/activities/calendar')}
            className="text-xs text-primary"
          >
            View All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading events...</p>
          </div>
        ) : todaysEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No events scheduled for today</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/activities/calendar')}
              className="text-primary"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule an event
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3">
              {todaysEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-[#e0e0e0] rounded-lg hover:bg-[#f4f4f4] transition-colors cursor-pointer"
                  onClick={() => {
                    if (event.relatedId) {
                      navigate(`/leads/${event.relatedId}`);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getEventTypeColor(event.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#161616] truncate">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatEventTime(event.startTime)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
