"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"

interface BPReading {
  id: string
  date: string
  time: string
  datetime: string
  systolic: number
  diastolic: number
  heartRate?: number
  category: string
}

interface BPHistoryProps {
  readings: BPReading[]
  getCategoryColor: (category: string) => string
  onDeleteReading?: (reading: BPReading) => void
}

// Safe date formatting that won't cause hydration mismatches
const formatDateSafe = (dateString: string): string => {
  try {
    // Use consistent formatting that works the same on server and client
    const date = new Date(dateString)
    // Use toISOString and format manually to ensure consistency
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    // Fallback to original string if parsing fails
    return dateString
  }
}

export function BPHistory({ readings, getCategoryColor, onDeleteReading }: BPHistoryProps) {
  if (readings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No readings recorded yet. Start by adding your first reading!
      </div>
    )
  }

  // Sort readings by datetime (most recent first)
  const sortedReadings = [...readings].sort((a, b) => {
    const dateA = new Date(a.datetime)
    const dateB = new Date(b.datetime)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {sortedReadings.map((reading, index) => (
        <div key={reading.id || `${reading.date}-${reading.time}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              <div>{formatDateSafe(reading.date)}</div>
              <div className="text-xs text-gray-500">{reading.time}</div>
            </div>
            <div className="font-semibold">
              {reading.systolic}/{reading.diastolic}
            </div>
            {reading.heartRate && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Heart className="h-3 w-3" />
                {reading.heartRate}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(reading.category)}>{reading.category}</Badge>
            {onDeleteReading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteReading(reading)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                title="Delete reading"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
