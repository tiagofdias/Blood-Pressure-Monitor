"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle, LogOut, User } from "lucide-react"
import { BPChart } from "@/components/bp-chart"
import { BPHistory } from "@/components/bp-history"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/components/auth-provider"
import { ClientWrapper } from "@/components/client-wrapper"

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

interface WeeklyAdvice {
  message: string
  type: "success" | "warning" | "danger"
  icon: any
  recommendations: string[]
}

function BloodPressureMonitorContent() {
  const { user, isLoading, logout } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [weeklyAdvice, setWeeklyAdvice] = useState<WeeklyAdvice | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5))

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Try to get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  // Mount effect
  useEffect(() => {
    if (user) {
      loadReadings()
    }
  }, [user])

  // Update weekly advice when readings change
  useEffect(() => {
    if (readings.length >= 7) {
      const advice = generateWeeklyAdvice(readings.slice(-7))
      setWeeklyAdvice(advice)
    }
  }, [readings])

  const classifyBP = (systolic: number, diastolic: number): string => {
    if (systolic > 180 || diastolic > 120) {
      return "Hypertensive Crisis"
    } else if (systolic >= 140 || diastolic >= 90) {
      return "Hypertension Stage 2"
    } else if (systolic >= 130 || diastolic >= 80) {
      return "Hypertension Stage 1"
    } else if (systolic >= 120 && diastolic < 80) {
      return "Elevated"
    } else {
      return "Normal"
    }
  }

  const generateWeeklyAdvice = (recentReadings: BPReading[]): WeeklyAdvice => {
    const avgSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length
    const avgDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length
    const category = classifyBP(avgSystolic, avgDiastolic)

    switch (category) {
      case "Normal":
        return {
          message: "Excellent! Your blood pressure is in the normal range.",
          type: "success",
          icon: CheckCircle,
          recommendations: [
            "Continue your healthy lifestyle",
            "Regular exercise and balanced diet",
            "Monitor regularly to maintain good health"
          ]
        }
      case "Elevated":
        return {
          message: "Your blood pressure is elevated. Consider lifestyle changes.",
          type: "warning",
          icon: TrendingUp,
          recommendations: [
            "Reduce sodium intake",
            "Increase physical activity",
            "Manage stress levels",
            "Consider consulting your doctor"
          ]
        }
      default:
        return {
          message: "Your blood pressure indicates hypertension. Please consult a healthcare provider.",
          type: "danger",
          icon: AlertTriangle,
          recommendations: [
            "Consult your doctor immediately",
            "Follow prescribed medications",
            "Monitor blood pressure daily",
            "Adopt heart-healthy lifestyle changes"
          ]
        }
    }
  }

  const loadReadings = async () => {
    try {
      const response = await fetch('/api/readings', {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setReadings(data)
      }
    } catch (error) {
      console.error('Failed to load readings:', error)
    }
  }

  const deleteReading = async (reading: BPReading) => {
    try {
      const response = await fetch(`/api/readings?id=${reading.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        setReadings(prev => prev.filter(r => r.id !== reading.id))
      }
    } catch (error) {
      console.error('Failed to delete reading:', error)
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "Normal":
        return "text-green-600 bg-green-100"
      case "Elevated":
        return "text-yellow-600 bg-yellow-100"
      case "Hypertension Stage 1":
        return "text-orange-600 bg-orange-100"
      case "Hypertension Stage 2":
        return "text-red-600 bg-red-100"
      case "Hypertensive Crisis":
        return "text-red-800 bg-red-200"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const saveReading = async () => {
    if (!systolic || !diastolic || !selectedDate || !selectedTime) {
      return
    }

    const systolicNum = Number.parseInt(systolic)
    const diastolicNum = Number.parseInt(diastolic)
    const heartRateNum = heartRate ? Number.parseInt(heartRate) : undefined

    if (systolicNum < 50 || systolicNum > 250 || diastolicNum < 30 || diastolicNum > 150) {
      return
    }

    const fullDateTime = `${selectedDate}T${selectedTime}:00`
    const category = classifyBP(systolicNum, diastolicNum)

    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          systolic: systolicNum,
          diastolic: diastolicNum,
          heartRate: heartRateNum,
          datetime: fullDateTime,
          category
        })
      })

      if (response.ok) {
        const newReading = await response.json()
        setReadings(prev => [newReading, ...prev])
        setSystolic("")
        setDiastolic("")
        setHeartRate("")
        setSelectedDate(new Date().toISOString().split("T")[0])
        setSelectedTime(new Date().toTimeString().slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to save reading:', error)
    }
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BP Monitor</h1>
              <p className="text-gray-600">Track your blood pressure health</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{user.name}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Weekly Advice */}
        {weeklyAdvice && (
          <Alert className={`border-l-4 ${
            weeklyAdvice.type === 'success' ? 'border-green-500 bg-green-50' :
            weeklyAdvice.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <weeklyAdvice.icon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">{weeklyAdvice.message}</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {weeklyAdvice.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Reading Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Add New Reading</span>
              </CardTitle>
              <CardDescription>
                Record your blood pressure and heart rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolic">Systolic (mmHg)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    min="50"
                    max="250"
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    min="30"
                    max="150"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="heartRate">Heart Rate (bpm) - Optional</Label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  min="40"
                  max="200"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selectedDate">Date</Label>
                  <Input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max="9999-12-31"
                  />
                </div>
                <div className="lg:col-span-1">
                  <Label htmlFor="selectedTime">Time (24h)</Label>
                  <Input
                    id="selectedTime"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={saveReading} 
                className="w-full"
                disabled={!systolic || !diastolic}
              >
                Save Reading
              </Button>
            </CardContent>
          </Card>

          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Readings</CardTitle>
              <CardDescription>Your last few blood pressure measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {readings.slice(0, 5).map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{reading.systolic}/{reading.diastolic}</span>
                          <Badge variant={
                            reading.category === "Normal" ? "default" :
                            reading.category === "Elevated" ? "secondary" :
                            "destructive"
                          }>
                            {reading.category}
                          </Badge>
                        </div>
                        <div className="text-gray-600">
                          {reading.date} at {reading.time}
                          {reading.heartRate && ` • ${reading.heartRate} bpm`}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReading(reading)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
                {readings.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No readings yet. Add your first reading!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {readings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BPChart readings={readings} />
            <BPHistory readings={readings} getCategoryColor={getCategoryColor} onDeleteReading={deleteReading} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function BloodPressureMonitor() {
  return (
    <ClientWrapper fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BloodPressureMonitorContent />
    </ClientWrapper>
  )
}
