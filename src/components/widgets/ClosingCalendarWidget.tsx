import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarCheck, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface ClosingEvent {
  id: string;
  name: string;
  business_name?: string;
  loan_amount?: number;
  updated_at: string;
  closingDate: Date;
}

export function ClosingCalendarWidget() {
  const [events, setEvents] = useState<ClosingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClosingEvents();
  }, []);

  const fetchClosingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_entities')
        .select('id, name, business_name, loan_amount, updated_at')
        .eq('stage', 'Closing')
        .order('updated_at', { ascending: true });

      if (error) throw error;

      // Simulate closing dates (in reality, these would come from a dedicated closing_date field)
      const eventsWithDates = (data || []).map((item, index) => {
        const closingDate = new Date();
        closingDate.setDate(closingDate.getDate() + index + 1); // Spread over next few days
        return {
          ...item,
          closingDate,
        };
      });

      setEvents(eventsWithDates);
    } catch (error) {
      console.error('Error fetching closing events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.closingDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const datesWithEvents = events.map(e => e.closingDate);

  return (
    <Card className="bg-white border border-[#e0e0e0]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-[#161616]" />
            <CardTitle className="text-base font-normal text-[#161616]">
              Closing Calendar
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {events.length} Scheduled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-[#525252]">Loading calendar...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-[#e0e0e0]"
              modifiers={{
                hasEvents: datesWithEvents,
              }}
              modifiersClassNames={{
                hasEvents: "bg-[#0f62fe]/10 font-semibold relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-[#0f62fe]",
              }}
            />

            {/* Events for selected date */}
            <div className="pt-4 border-t border-[#e0e0e0]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-[#161616]">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h4>
                {selectedDateEvents.length > 0 && (
                  <Badge variant="default" className="text-xs">
                    {selectedDateEvents.length} closing{selectedDateEvents.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[#525252]">No closings scheduled</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 border border-[#e0e0e0] rounded-lg hover:bg-[#f4f4f4] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-[#161616]">
                          {event.business_name || event.name}
                        </p>
                        <Clock className="h-3 w-3 text-[#525252]" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#525252]">Loan Amount</span>
                        <span className="font-medium text-[#161616]">
                          {formatCurrency(event.loan_amount || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
