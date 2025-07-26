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
        <div key={reading.datetime || `${reading.date}-${reading.time}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              <div>{new Date(reading.date).toLocaleDateString("en-GB")}</div>
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
