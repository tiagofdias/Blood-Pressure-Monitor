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

export default function BloodPressureMonitor() {
  const { user, isLoading, logout } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [weeklyAdvice, setWeeklyAdvice] = useState<WeeklyAdvice | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Client-side mounting check
  useEffect(() => {
    setIsClient(true)
  }, [])
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

  const generateWeeklyAdvice = (lastSevenReadings: BPReading[]): WeeklyAdvice => {
    const categories = lastSevenReadings.map((r) => r.category)
    const crisisCount = categories.filter((c) => c === "Hypertensive Crisis").length
    const stage2Count = categories.filter((c) => c === "Hypertension Stage 2").length
    const stage1Count = categories.filter((c) => c === "Hypertension Stage 1").length
    const elevatedCount = categories.filter((c) => c === "Elevated").length

    if (crisisCount > 0) {
      return {
        message: "🚨 Immediate medical attention recommended",
        type: "danger",
        icon: AlertTriangle,
        recommendations: [
          "Seek immediate medical care",
          "Do not delay - this is a medical emergency",
          "Call your doctor or go to the emergency room",
        ],
      }
    } else if (stage2Count >= 3) {
      return {
        message: "⚠️ You should consult a doctor",
        type: "warning",
        icon: AlertTriangle,
        recommendations: [
          "Schedule an appointment with your healthcare provider",
          "Consider lifestyle modifications",
          "Monitor your blood pressure daily",
          "Reduce sodium intake and increase physical activity",
        ],
      }
    } else if (stage1Count + stage2Count >= 5) {
      return {
        message: "⚠️ Monitor closely and consider talking to a doctor",
        type: "warning",
        icon: TrendingUp,
        recommendations: [
          "Continue daily monitoring",
          "Implement lifestyle changes",
          "Consider scheduling a check-up",
          "Focus on diet, exercise, and stress management",
        ],
      }
    } else {
      return {
        message: "✅ No major concerns this week",
        type: "success",
        icon: CheckCircle,
        recommendations: [
          "Keep up the good work!",
          "Continue regular monitoring",
          "Maintain healthy lifestyle habits",
          "Stay consistent with measurements",
        ],
      }
    }
  }

  const loadReadings = async () => {
    try {
      const response = await fetch("/api/readings", {
        headers: getAuthHeaders(),
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setReadings(data)
      }
    } catch (error) {
      console.error("Error loading readings:", error)
    }
  }

  const deleteReading = async (reading: BPReading) => {
    if (!confirm(`Are you sure you want to delete the reading from ${new Date(reading.date).toLocaleDateString("en-GB")} at ${reading.time}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/readings?id=${reading.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
      })

      if (response.ok) {
        // Remove the reading from local state
        setReadings(prev => prev.filter(r => r.id !== reading.id))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete reading")
      }
    } catch (error) {
      console.error("Error deleting reading:", error)
      alert("Failed to delete reading")
    }
  }

  const saveReading = async () => {
    if (!systolic || !diastolic || !selectedDate || !selectedTime) {
      alert("Please enter systolic, diastolic, date, and time values")
      return
    }

    const systolicNum = Number.parseInt(systolic)
    const diastolicNum = Number.parseInt(diastolic)
    const heartRateNum = heartRate ? Number.parseInt(heartRate) : undefined

    if (systolicNum < 70 || systolicNum > 250 || diastolicNum < 40 || diastolicNum > 150) {
      alert("Please enter realistic blood pressure values")
      return
    }

    // Combine date and time into a full datetime string
    const fullDateTime = `${selectedDate}T${selectedTime}:00`

    const newReading: BPReading = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      datetime: fullDateTime,
      systolic: systolicNum,
      diastolic: diastolicNum,
      heartRate: heartRateNum,
      category: classifyBP(systolicNum, diastolicNum),
    }

    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newReading),
        credentials: 'include'
      })

      if (response.ok) {
        setReadings((prev) => [...prev, newReading])
        setSystolic("")
        setDiastolic("")
        setHeartRate("")
        // Reset to current date/time for next entry
        const now = new Date()
        setSelectedDate(now.toISOString().split("T")[0])
        setSelectedTime(now.toTimeString().slice(0, 5))
      }
    } catch (error) {
      console.error("Error saving reading:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Normal":
        return "bg-green-100 text-green-800"
      case "Elevated":
        return "bg-yellow-100 text-yellow-800"
      case "Hypertension Stage 1":
        return "bg-orange-100 text-orange-800"
      case "Hypertension Stage 2":
        return "bg-red-100 text-red-800"
      case "Hypertensive Crisis":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Pressure Monitor</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />
  }

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Pressure Monitor</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center py-4">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Pressure Monitor</h1>
            <p className="text-gray-600">Track your daily readings and get personalized health advice</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Record Today's Reading
            </CardTitle>
            <CardDescription>
              Enter your blood pressure measurements with date (DD/MM/YYYY) and time (24h format)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-1">
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
              <div className="lg:col-span-1">
                <Label htmlFor="systolic">Systolic</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  min="70"
                  max="250"
                />
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="diastolic">Diastolic</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  min="40"
                  max="150"
                />
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="heartRate">Heart Rate</Label>
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
              <div className="lg:col-span-1 flex flex-col justify-end">
                <Button onClick={saveReading} className="w-full h-10">
                  Save Reading
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Advice */}
        {weeklyAdvice && (
          <Alert
            className={`border-2 ${
              weeklyAdvice.type === "success"
                ? "border-green-200 bg-green-50"
                : weeklyAdvice.type === "warning"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-red-200 bg-red-50"
            }`}
          >
            <weeklyAdvice.icon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{weeklyAdvice.message}</p>
                <ul className="list-disc list-inside space-y-1">
                  {weeklyAdvice.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Charts and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Blood Pressure Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BPChart readings={readings.slice().sort((a, b) => 
                new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
              ).slice(-14)} />
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BPHistory 
                readings={readings.slice(-10)} 
                getCategoryColor={getCategoryColor} 
                onDeleteReading={deleteReading}
              />
            </CardContent>
          </Card>
        </div>

        {/* BP Categories Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Categories (AHA Guidelines)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { name: "Normal", systolic: "< 120", diastolic: "< 80", color: "bg-green-100 text-green-800" },
                { name: "Elevated", systolic: "120-129", diastolic: "< 80", color: "bg-yellow-100 text-yellow-800" },
                { name: "Stage 1", systolic: "130-139", diastolic: "80-89", color: "bg-orange-100 text-orange-800" },
                { name: "Stage 2", systolic: "≥ 140", diastolic: "≥ 90", color: "bg-red-100 text-red-800" },
                { name: "Crisis", systolic: "> 180", diastolic: "> 120", color: "bg-red-600 text-white" },
              ].map((category) => (
                <div key={category.name} className="text-center">
                  <Badge className={`${category.color} mb-2`}>{category.name}</Badge>
                  <p className="text-sm">
                    {category.systolic} / {category.diastolic}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
