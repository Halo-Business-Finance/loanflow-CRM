import { useState } from "react"
import { format, addDays, addWeeks } from "date-fns"
import { Calendar as CalendarIcon, Clock, Phone, Mail, Bell, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface ActionReminderProps {
  entityId: string
  entityName: string
  entityType: 'lead' | 'client'
  isOpen: boolean
  onClose: () => void
}

export function ActionReminder({ entityId, entityName, entityType, isOpen, onClose }: ActionReminderProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [reminderType, setReminderType] = useState<'call' | 'email' | 'follow_up'>()
  const [customNote, setCustomNote] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const quickDateOptions = [
    { label: "Tomorrow", value: addDays(new Date(), 1) },
    { label: "In 3 days", value: addDays(new Date(), 3) },
    { label: "Next week", value: addWeeks(new Date(), 1) },
    { label: "In 2 weeks", value: addWeeks(new Date(), 2) },
  ]

  const timeOptions = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ]

  const reminderTypes = [
    {
      id: 'call' as const,
      label: 'Call Reminder',
      icon: Phone,
      description: 'Schedule a phone call',
      color: 'bg-blue-500'
    },
    {
      id: 'email' as const,
      label: 'Email Reminder',
      icon: Mail,
      description: 'Send an email follow-up',
      color: 'bg-green-500'
    },
    {
      id: 'follow_up' as const,
      label: 'General Follow-up',
      icon: Bell,
      description: 'General reminder to follow up',
      color: 'bg-purple-500'
    }
  ]

  const createReminder = async () => {
    if (!selectedDate || !reminderType) return

    setIsCreating(true)
    try {
      const reminderDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      reminderDateTime.setHours(parseInt(hours), parseInt(minutes))

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          title: `${reminderTypes.find(t => t.id === reminderType)?.label}`,
          message: customNote || `${reminderType === 'call' ? 'Call' : reminderType === 'email' ? 'Email' : 'Follow up with'} ${entityName}`,
          type: `${reminderType}_reminder`,
          related_id: entityId,
          created_at: reminderDateTime.toISOString()
        })

      if (error) throw error

      toast({
        title: "Reminder Created",
        description: `${reminderTypes.find(t => t.id === reminderType)?.label} scheduled for ${format(reminderDateTime, 'PPP p')}`,
      })

      // Reset form
      setSelectedDate(undefined)
      setReminderType(undefined)
      setCustomNote("")
      onClose()
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full shadow-xl border animate-in slide-in-from-top-4 duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <CardTitle className="text-base font-semibold">
          Create Reminder
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>For:</span>
          <Badge variant="outline">{entityName}</Badge>
        </div>

        {/* Reminder Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Reminder Type</Label>
          <div className="grid grid-cols-1 gap-2">
            {reminderTypes.map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.id}
                  variant={reminderType === type.id ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setReminderType(type.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${type.color} mr-3`} />
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Date Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">When?</Label>
          
          {/* Calendar Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom Note */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Custom Note (Optional)</Label>
          <Textarea
            placeholder="Add any specific details for this reminder..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            rows={3}
          />
        </div>

        {/* Preview */}
        {selectedDate && reminderType && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Preview:</div>
            <div className="text-sm text-muted-foreground">
              {reminderTypes.find(t => t.id === reminderType)?.label} for {entityName}
            </div>
            <div className="text-sm text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              {format(selectedDate, 'PPP')} at {selectedTime}
            </div>
            {customNote && (
              <div className="text-sm text-muted-foreground mt-1">
                Note: {customNote}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={createReminder}
            disabled={!selectedDate || !reminderType || isCreating}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Reminder
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
      </div>
    </div>
  )
}