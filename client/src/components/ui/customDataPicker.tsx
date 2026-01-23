import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState } from "react"
import { format, addDays, subDays, parseISO } from "date-fns"

interface CustomDatePickerProps {
  initialDate?: Date
  onChange?: (date: Date) => void
}

function CustomDatePicker({ initialDate, onChange }: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate ?? new Date()
  )

  const updateDate = (date: Date) => {
    setSelectedDate(date)
    onChange?.(date)
  }

  const goToNextDay = () => updateDate(addDays(selectedDate, 1))
  const goToPreviousDay = () => updateDate(subDays(selectedDate, 1))

  const formattedDate = format(selectedDate, "yyyy MM dd")

  return (
    <div className="flex items-center space-x-2">
      <button
        className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
        onClick={goToPreviousDay}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <input
        type="date"
        className="bg-[#FBBC05] text-[#000000] font-medium px-3 py-1 rounded border border-[#000000]"
        value={formattedDate}
        onChange={(e) => updateDate(parseISO(e.target.value))}
      />

      <button
        className="p-1 rounded hover:bg-[#FBBC05] hover:text-[#000000]"
        onClick={goToNextDay}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

export default CustomDatePicker