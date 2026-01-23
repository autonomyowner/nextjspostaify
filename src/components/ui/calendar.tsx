'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  minDate?: Date
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Calendar({ selectedDate, onDateSelect, minDate = new Date() }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  const [direction, setDirection] = useState(0)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const minDateTime = useMemo(() => {
    const d = new Date(minDate)
    d.setHours(0, 0, 0, 0)
    return d
  }, [minDate])

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysArray: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      daysArray.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i))
    }

    return daysArray
  }, [currentMonth])

  const navigateMonth = (delta: number) => {
    setDirection(delta)
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + delta)
      return newDate
    })
  }

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true
    return date < minDateTime
  }

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigateMonth(-1)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-white/60 text-sm">←</span>
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={currentMonth.toISOString()}
            initial={{ opacity: 0, y: direction > 0 ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -10 : 10 }}
            transition={{ duration: 0.15 }}
            className="font-display text-base font-semibold"
          >
            {MONTHS[currentMonth.getMonth()]} <span className="text-white/40">{currentMonth.getFullYear()}</span>
          </motion.h3>
        </AnimatePresence>
        <button
          onClick={() => navigateMonth(1)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-white/60 text-sm">→</span>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-semibold text-white/30 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: direction * 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -15 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {daysInMonth.map((date, index) => (
            <motion.button
              key={index}
              onClick={() => date && !isDateDisabled(date) && onDateSelect(date)}
              disabled={isDateDisabled(date)}
              whileHover={!isDateDisabled(date) ? { scale: 1.1 } : {}}
              whileTap={!isDateDisabled(date) ? { scale: 0.95 } : {}}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all relative
                ${!date ? 'invisible' : ''}
                ${isDateDisabled(date)
                  ? 'text-white/15 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10 cursor-pointer'}
                ${isDateSelected(date)
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : ''}
                ${isToday(date) && !isDateSelected(date)
                  ? 'ring-1 ring-amber-500/50 text-amber-400'
                  : ''}
              `}
            >
              {date?.getDate()}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface TimePickerProps {
  selectedTime: { hour: number; minute: number }
  onTimeSelect: (time: { hour: number; minute: number }) => void
}

export function TimePicker({ selectedTime, onTimeSelect }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  // Group times by period (Morning, Afternoon, Evening, Night)
  const getTimePeriod = (hour: number) => {
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    if (hour >= 17 && hour < 21) return 'Evening'
    return 'Night'
  }

  const groupedTimes = useMemo(() => {
    const groups: Record<string, { hour: number; minute: number }[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: []
    }

    hours.forEach(hour => {
      minutes.forEach(minute => {
        const period = getTimePeriod(hour)
        groups[period].push({ hour, minute })
      })
    })

    return groups
  }, [])

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white/60">Select Time</label>
      <div className="space-y-4 max-h-[240px] overflow-y-auto pe-2 custom-scrollbar">
        {Object.entries(groupedTimes).map(([period, times]) => (
          <div key={period}>
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">{period}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-1.5">
              {times.map(({ hour, minute }) => {
                const isSelected = selectedTime.hour === hour && selectedTime.minute === minute
                return (
                  <motion.button
                    key={`${hour}-${minute}`}
                    onClick={() => onTimeSelect({ hour, minute })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      px-1.5 sm:px-2 py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all
                      ${isSelected
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                        : 'bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/10'
                      }
                    `}
                  >
                    {formatTime(hour, minute)}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DateTimePickerProps {
  selectedDateTime: Date | null
  onDateTimeSelect: (date: Date) => void
  minDate?: Date
}

export function DateTimePicker({ selectedDateTime, onDateTimeSelect, minDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(selectedDateTime)
  const [selectedTime, setSelectedTime] = useState({
    hour: selectedDateTime?.getHours() || 9,
    minute: selectedDateTime?.getMinutes() || 0
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const newDateTime = new Date(date)
    newDateTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0)
    onDateTimeSelect(newDateTime)
  }

  const handleTimeSelect = (time: { hour: number; minute: number }) => {
    setSelectedTime(time)
    if (selectedDate) {
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(time.hour, time.minute, 0, 0)
      onDateTimeSelect(newDateTime)
    }
  }

  const formatSelectedDateTime = () => {
    if (!selectedDate) return null
    const date = new Date(selectedDate)
    date.setHours(selectedTime.hour, selectedTime.minute, 0, 0)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Selected DateTime Display */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
          >
            <p className="text-xs font-medium text-white/40 mb-1 uppercase tracking-wider">Scheduled for</p>
            <p className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {formatSelectedDateTime()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            minDate={minDate}
          />
        </div>

        {/* Time Picker */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
          <TimePicker
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
          />
        </div>
      </div>
    </div>
  )
}
