"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { az } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Tarix və vaxt seçin",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [isOpen, setIsOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(() => {
    if (value) {
      const d = new Date(value)
      return {
        hours: d.getHours().toString().padStart(2, '0'),
        minutes: d.getMinutes().toString().padStart(2, '0')
      }
    }
    return { hours: "12", minutes: "00" }
  })

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )

  // Generate minutes (00-59, step of 5)
  const minutes = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(timeValue.hours))
      newDate.setMinutes(parseInt(timeValue.minutes))
      setDate(newDate)
      
      // Format as ISO string for input compatibility
      const isoString = newDate.toISOString().slice(0, 16)
      onChange?.(isoString)
    }
  }

  const handleTimeChange = (type: 'hours' | 'minutes', newValue: string) => {
    const newTimeValue = { ...timeValue, [type]: newValue }
    setTimeValue(newTimeValue)

    if (date) {
      const newDate = new Date(date)
      newDate.setHours(parseInt(newTimeValue.hours))
      newDate.setMinutes(parseInt(newTimeValue.minutes))
      setDate(newDate)
      
      const isoString = newDate.toISOString().slice(0, 16)
      onChange?.(isoString)
    }
  }

  const handleClear = () => {
    setDate(undefined)
    setTimeValue({ hours: "12", minutes: "00" })
    onChange?.("")
  }

  const handleNow = () => {
    const now = new Date()
    setDate(now)
    setTimeValue({
      hours: now.getHours().toString().padStart(2, '0'),
      minutes: now.getMinutes().toString().padStart(2, '0')
    })
    const isoString = now.toISOString().slice(0, 16)
    onChange?.(isoString)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-gray-50 border-gray-300 hover:bg-gray-100",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span className="flex items-center gap-2">
              {format(date, "dd/MM/yyyy", { locale: az })}
              <Clock className="h-3 w-3 text-gray-400" />
              {format(date, "HH:mm")}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Calendar Section */}
          <div className="p-3 border-r">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              locale={az}
            />
          </div>
          
          {/* Time Section */}
          <div className="p-4 space-y-4" style={{ minWidth: "200px" }}>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Vaxt seçin</h4>
              
              {/* Time Selectors */}
              <div className="flex items-center gap-2">
                <Select
                  value={timeValue.hours}
                  onValueChange={(value) => handleTimeChange('hours', value)}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-gray-500 font-medium">:</span>
                
                <Select
                  value={timeValue.minutes}
                  onValueChange={(value) => handleTimeChange('minutes', value)}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Time Input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Və ya daxil edin:</label>
                <Input
                  type="time"
                  value={`${timeValue.hours}:${timeValue.minutes}`}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':')
                    if (hours && minutes) {
                      handleTimeChange('hours', hours)
                      handleTimeChange('minutes', minutes)
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={handleNow}
                className="w-full justify-start text-xs"
              >
                <Clock className="mr-2 h-3 w-3" />
                İndi
              </Button>
              
              {date && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  className="w-full justify-start text-xs text-red-600 hover:text-red-700"
                >
                  Təmizlə
                </Button>
              )}
            </div>

            {/* Selected Value Display */}
            {date && (
              <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                <div>Seçilmiş:</div>
                <div className="font-medium">
                  {format(date, "dd MMMM yyyy, HH:mm", { locale: az })}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
