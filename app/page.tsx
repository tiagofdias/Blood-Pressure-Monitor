"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle, LogOut, User, Download } from "lucide-react"
import { BPChart } from "@/components/bp-chart"
import { BPHistory } from "@/components/bp-history"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/components/auth-provider"
import { ClientWrapper } from "@/components/client-wrapper"
import { exportToExcel } from "@/lib/excel-export"

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
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isExporting, setIsExporting] = useState(false)

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

  // Excel export function
  const handleExportToExcel = async () => {
    if (readings.length === 0) {
      alert('No data to export. Please add some blood pressure readings first.')
      return
    }

    setIsExporting(true)
    try {
      const filename = await exportToExcel(readings, user?.name || 'Patient')
      alert(`Data exported successfully as ${filename}`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Mount effect
  useEffect(() => {
    // Set initial date and time on client side to avoid hydration mismatch
    const now = new Date()
    setSelectedDate(now.toISOString().split("T")[0])
    setSelectedTime(now.toTimeString().slice(0, 5))
    
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

  const classifyHeartRate = (heartRate: number, restingRate: boolean = true): string => {
    if (restingRate) {
      // Resting heart rate classification
      if (heartRate < 60) {
        return "Bradycardia" // Slow
      } else if (heartRate >= 60 && heartRate <= 100) {
        return "Normal"
      } else if (heartRate > 100 && heartRate <= 120) {
        return "Elevated"
      } else {
        return "Tachycardia" // Fast
      }
    }
    return "Normal"
  }

  const getHeartRateInfo = (heartRate: number) => {
    const category = classifyHeartRate(heartRate)
    const recommendations = {
      "Bradycardia": {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        description: "Below 60 bpm - May indicate excellent fitness or medical condition",
        recommendations: ["Consult doctor if experiencing symptoms", "Monitor for dizziness or fatigue"]
      },
      "Normal": {
        color: "text-green-600 bg-green-50 border-green-200",
        description: "60-100 bpm - Healthy resting heart rate",
        recommendations: ["Maintain regular exercise", "Continue healthy lifestyle"]
      },
      "Elevated": {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        description: "100-120 bpm - Slightly elevated",
        recommendations: ["Consider stress management", "Reduce caffeine intake", "Improve sleep quality"]
      },
      "Tachycardia": {
        color: "text-red-600 bg-red-50 border-red-200",
        description: "Above 120 bpm - Elevated heart rate",
        recommendations: ["Consult healthcare provider", "Check for underlying conditions", "Monitor symptoms"]
      }
    }
    return recommendations[category as keyof typeof recommendations] || recommendations.Normal
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
        const result = await response.json()
        // The API returns { success: true, reading: newReading }
        if (result.success && result.reading) {
          // Transform the reading to match frontend format
          const readingDate = result.reading.readingDate ? new Date(result.reading.readingDate) : new Date(result.reading.readingDatetime)
          const formattedReading = {
            id: result.reading.id.toString(),
            date: `${readingDate.getFullYear()}-${String(readingDate.getMonth() + 1).padStart(2, '0')}-${String(readingDate.getDate()).padStart(2, '0')}`,
            time: result.reading.readingTime,
            datetime: result.reading.readingDatetime,
            systolic: result.reading.systolic,
            diastolic: result.reading.diastolic,
            heartRate: result.reading.heartRate,
            category: result.reading.category
          }
          setReadings(prev => [formattedReading, ...prev])
        } else {
          // Fallback: reload all readings to ensure UI is in sync
          loadReadings()
        }
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
              onClick={handleExportToExcel}
              disabled={isExporting || readings.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
            </Button>
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

              <div className="grid grid-cols-2 gap-4">
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
                <div>
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

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent History</span>
              </CardTitle>
              <CardDescription>
                Your latest measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BPHistory readings={readings} getCategoryColor={getCategoryColor} onDeleteReading={deleteReading} />
            </CardContent>
          </Card>
        </div>

        {/* Charts and History */}
        {readings.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Quick Stats Summary */}
            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Your Health Summary</span>
                </CardTitle>
                <CardDescription>
                  Latest readings and averages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {readings.length > 0 ? (
                  <div className="space-y-4">
                    {/* Latest Reading with Trend */}
                    {(() => {
                      // Get the truly latest reading by sorting by datetime
                      const sortedReadings = [...readings].sort((a, b) => 
                        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
                      );
                      const latestReading = sortedReadings[0];
                      const previousReading = sortedReadings[1];
                      
                      // Calculate trends
                      const systolicTrend = previousReading ? latestReading.systolic - previousReading.systolic : 0;
                      const diastolicTrend = previousReading ? latestReading.diastolic - previousReading.diastolic : 0;
                      const hrTrend = (previousReading?.heartRate && latestReading.heartRate) 
                        ? latestReading.heartRate - previousReading.heartRate : 0;
                      
                      return (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Latest Reading</span>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="text-xs bg-white">
                                {new Date(latestReading.datetime).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Badge>
                              {previousReading && (
                                <span className="text-xs text-gray-500 font-medium">vs. previous</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="text-2xl font-bold text-red-600">{latestReading.systolic}/{latestReading.diastolic}</div>
                                {previousReading && (
                                  <div className="flex flex-col items-center">
                                    {systolicTrend !== 0 && (
                                      <span className={`text-xs flex items-center ${
                                        systolicTrend > 0 ? 'text-red-500' : 'text-green-500'
                                      }`}>
                                        {systolicTrend > 0 ? '↗' : '↘'} {Math.abs(systolicTrend)}
                                      </span>
                                    )}
                                    {diastolicTrend !== 0 && (
                                      <span className={`text-xs flex items-center ${
                                        diastolicTrend > 0 ? 'text-red-500' : 'text-green-500'
                                      }`}>
                                        {diastolicTrend > 0 ? '↗' : '↘'} {Math.abs(diastolicTrend)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">Blood Pressure (mmHg)</div>
                              <div className="flex justify-center">
                                <Badge variant={
                                  latestReading.category === "Normal" ? "default" :
                                  latestReading.category === "Elevated" ? "secondary" :
                                  "destructive"
                                } className={`text-xs ${
                                  latestReading.category === "Normal" ? "bg-green-100 text-green-800" :
                                  latestReading.category === "Elevated" ? "bg-yellow-100 text-yellow-800" :
                                  latestReading.category.includes("Stage 1") ? "bg-orange-100 text-orange-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {latestReading.category}
                                </Badge>
                              </div>
                            </div>
                            
                            {latestReading.heartRate ? (
                              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <div className="text-2xl font-bold text-green-600">{latestReading.heartRate}</div>
                                  {previousReading?.heartRate && hrTrend !== 0 && (
                                    <span className={`text-xs flex items-center ${
                                      hrTrend > 0 ? 'text-orange-500' : 'text-blue-500'
                                    }`}>
                                      {hrTrend > 0 ? '↗' : '↘'} {Math.abs(hrTrend)}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">Heart Rate (bpm)</div>
                                <div className="flex justify-center">
                                  <Badge variant="outline" className={`text-xs ${
                                    classifyHeartRate(latestReading.heartRate) === "Normal" ? "bg-green-100 text-green-800" :
                                    classifyHeartRate(latestReading.heartRate) === "Low" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {classifyHeartRate(latestReading.heartRate)}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <div className="text-lg text-gray-400 mb-1">—</div>
                                <div className="text-xs text-gray-500 mb-2">No Heart Rate</div>
                                <div className="text-xs text-gray-400">Add HR to next reading</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 7-Day and Overall Insights */}
                    {(() => {
                      const now = new Date();
                      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      const recentReadings = readings.filter(r => new Date(r.datetime) >= sevenDaysAgo);
                      
                      // Overall averages
                      const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
                      const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
                      const heartRateReadings = readings.filter(r => r.heartRate);
                      const avgHeartRate = heartRateReadings.length > 0 
                        ? Math.round(heartRateReadings.reduce((sum, r) => sum + r.heartRate!, 0) / heartRateReadings.length)
                        : null;

                      // Recent averages (7 days)
                      const recentAvgSystolic = recentReadings.length > 0 
                        ? Math.round(recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length)
                        : avgSystolic;
                      const recentAvgDiastolic = recentReadings.length > 0 
                        ? Math.round(recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length)
                        : avgDiastolic;
                      const recentHRReadings = recentReadings.filter(r => r.heartRate);
                      const recentAvgHeartRate = recentHRReadings.length > 0 
                        ? Math.round(recentHRReadings.reduce((sum, r) => sum + r.heartRate!, 0) / recentHRReadings.length)
                        : null;
                      
                      // Category distribution
                      const categoryCount = readings.reduce((acc, r) => {
                        acc[r.category] = (acc[r.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      const mostCommonCategory = Object.entries(categoryCount)
                        .sort(([,a], [,b]) => b - a)[0];

                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {/* 7-Day Summary */}
                          <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <span className="text-sm font-medium text-gray-700">Recent 7 Days</span>
                              <Badge variant="outline" className="text-xs">
                                {recentReadings.length}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{recentAvgSystolic}/{recentAvgDiastolic}</div>
                                <div className="text-xs text-gray-600">Avg BP</div>
                              </div>
                              {recentAvgHeartRate && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">{recentAvgHeartRate} bpm</div>
                                  <div className="text-xs text-gray-600">Avg HR</div>
                                </div>
                              )}
                              {recentReadings.length > 0 && recentAvgSystolic !== avgSystolic && (
                                <div className="text-center">
                                  <span className={`text-xs font-medium ${recentAvgSystolic < avgSystolic ? 'text-green-600' : 'text-red-600'}`}>
                                    {recentAvgSystolic < avgSystolic ? '↓' : '↑'} 
                                    {Math.abs(recentAvgSystolic - avgSystolic)} vs overall
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Overall Summary */}
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <span className="text-sm font-medium text-gray-700">Overall Stats</span>
                              <Badge variant="outline" className="text-xs">
                                {readings.length}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{avgSystolic}/{avgDiastolic}</div>
                                <div className="text-xs text-gray-600">Avg BP</div>
                              </div>
                              {avgHeartRate && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">{avgHeartRate} bpm</div>
                                  <div className="text-xs text-gray-600">Avg HR</div>
                                </div>
                              )}
                              <div className="text-center">
                                <div className="text-xs text-gray-500">
                                  Most: {mostCommonCategory[0]} ({Math.round((mostCommonCategory[1] / readings.length) * 100)}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Health Insights & Recommendations */}
                    {(() => {
                      const latestReading = [...readings].sort((a, b) => 
                        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
                      )[0];
                      
                      const insights = [];
                      
                      // BP insights
                      if (latestReading.category === "Normal") {
                        insights.push({
                          type: "success",
                          text: "Great! Your latest BP is in the normal range. Keep up the healthy habits!"
                        });
                      } else if (latestReading.category === "Elevated") {
                        insights.push({
                          type: "warning",
                          text: "Your BP is elevated. Consider lifestyle changes like reducing sodium and increasing exercise."
                        });
                      } else {
                        insights.push({
                          type: "alert",
                          text: "Your BP indicates hypertension. Please consult your healthcare provider."
                        });
                      }

                      // Heart rate insights
                      if (latestReading.heartRate) {
                        const hrCategory = classifyHeartRate(latestReading.heartRate);
                        if (hrCategory === "Low") {
                          insights.push({
                            type: "info",
                            text: "Your heart rate is lower than average. If you're not an athlete, consider consulting a doctor."
                          });
                        } else if (hrCategory === "High") {
                          insights.push({
                            type: "warning",
                            text: "Your heart rate is elevated. This could be due to stress, caffeine, or physical activity."
                          });
                        }
                      }

                      // Trend insights
                      const recentReadings = [...readings]
                        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
                        .slice(0, Math.min(5, readings.length));
                      
                      if (recentReadings.length >= 3) {
                        const avgRecent = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length;
                        const oldReadings = readings.slice(recentReadings.length);
                        const avgOld = oldReadings.length > 0 
                          ? oldReadings.reduce((sum, r) => sum + r.systolic, 0) / oldReadings.length 
                          : avgRecent;
                        
                        if (avgRecent > avgOld + 5) {
                          insights.push({
                            type: "warning",
                            text: "Your recent readings show an upward trend. Monitor closely and consider lifestyle factors."
                          });
                        } else if (avgRecent < avgOld - 5) {
                          insights.push({
                            type: "success",
                            text: "Excellent! Your recent readings show improvement. Keep up whatever you're doing!"
                          });
                        }
                      }

                      return insights.length > 0 && (
                          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-700">Health Insights</span>
                          </div>
                          <div className="space-y-2">
                            {insights.map((insight, index) => (
                              <div key={index} className={`text-xs p-2 rounded flex items-start gap-2 ${
                                insight.type === "success" ? "bg-green-100 text-green-800" :
                                insight.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                                insight.type === "alert" ? "bg-red-100 text-red-800" :
                                "bg-blue-100 text-blue-800"
                              }`}>
                                <span className="text-sm">
                                  {insight.type === "success" ? "✅" :
                                   insight.type === "warning" ? "⚠️" :
                                   insight.type === "alert" ? "🚨" : "💡"}
                                </span>
                                <span>{insight.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No readings yet</p>
                    <p className="text-sm">Add your first reading to see your health summary!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BP Trends Chart */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Health Trends</span>
                </CardTitle>
                <CardDescription>
                  Your blood pressure and heart rate over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <BPChart readings={readings} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Health Categories Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Pressure Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Blood Pressure Guide</span>
              </CardTitle>
              <CardDescription>
                Understanding your blood pressure readings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-green-800">Normal</div>
                    <div className="text-sm text-green-600">Less than 120/80 mmHg</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-yellow-800">Elevated</div>
                    <div className="text-sm text-yellow-600">120-129 / less than 80</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Watch</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-orange-800">Stage 1 Hypertension</div>
                    <div className="text-sm text-orange-600">130-139 / 80-89 mmHg</div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Caution</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-red-800">Stage 2 & Crisis</div>
                    <div className="text-sm text-red-600">140/90+ mmHg</div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Seek Care</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-green-500" />
                <span>Heart Rate Guide</span>
              </CardTitle>
              <CardDescription>
                Understanding your resting heart rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-yellow-800">Bradycardia</div>
                    <div className="text-sm text-yellow-600">Less than 60 bpm</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Monitor</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-green-800">Normal</div>
                    <div className="text-sm text-green-600">60-100 bpm</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-yellow-800">Elevated</div>
                    <div className="text-sm text-yellow-600">100-120 bpm</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Caution</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-red-800">Tachycardia</div>
                    <div className="text-sm text-red-600">Above 120 bpm</div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Seek Care</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
