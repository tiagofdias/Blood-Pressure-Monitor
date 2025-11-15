"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"

interface BPReading {
  id: string
  datetime: string
  systolic: number
  diastolic: number
  heartRate?: number
  category: string
}

interface BPChartProps {
  readings: BPReading[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{data.fullDate}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Systolic:</span>
            </div>
            <span className="font-bold text-red-600">{data.systolic} mmHg</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Diastolic:</span>
            </div>
            <span className="font-bold text-blue-600">{data.diastolic} mmHg</span>
          </div>
          {data.heartRate && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Heart Rate:</span>
              </div>
              <span className="font-bold text-green-600">{data.heartRate} bpm</span>
            </div>
          )}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Category:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                data.category === 'Normal' ? 'bg-green-100 text-green-800' :
                data.category === 'Elevated' ? 'bg-yellow-100 text-yellow-800' :
                data.category === 'High Blood Pressure Stage 1' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function BPChart({ readings }: BPChartProps) {
  const chartData = readings
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .map((reading, index) => ({
      date: new Date(reading.datetime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        ...(readings.length <= 7 ? { 
          hour: "2-digit",
          minute: "2-digit",
          hour12: false 
        } : {})
      }),
      fullDate: new Date(reading.datetime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heartRate: reading.heartRate || null,
      category: reading.category,
      index: index
    }))

  if (readings.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="font-medium">No readings to display</p>
          <p className="text-sm">Add some readings to see your trends!</p>
        </div>
      </div>
    )
  }

  // Calculate optimal Y-axis domain based on data
  const allValues = [...chartData.flatMap(d => [d.systolic, d.diastolic]), ...chartData.filter(d => d.heartRate).map(d => d.heartRate!)]
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const padding = (maxValue - minValue) * 0.1
  const yMin = Math.max(40, Math.floor(minValue - padding))
  const yMax = Math.min(220, Math.ceil(maxValue + padding))

  const hasHeartRateData = chartData.some(d => d.heartRate)

  return (
    <div className="space-y-3">
      {/* Chart Statistics Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-sm font-bold text-red-600">{Math.max(...chartData.map(d => d.systolic))}</div>
          <div className="text-xs text-gray-600">Peak Systolic</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-sm font-bold text-blue-600">{Math.max(...chartData.map(d => d.diastolic))}</div>
          <div className="text-xs text-gray-600">Peak Diastolic</div>
        </div>
        {hasHeartRateData && (
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-sm font-bold text-green-600">{Math.max(...chartData.filter(d => d.heartRate).map(d => d.heartRate!))}</div>
            <div className="text-xs text-gray-600">Peak HR</div>
          </div>
        )}
        {!hasHeartRateData && (
          <div className="text-center p-2 bg-gray-50 rounded border border-dashed border-gray-200">
            <div className="text-sm text-gray-400">—</div>
            <div className="text-xs text-gray-400">No HR Data</div>
          </div>
        )}
      </div>

      {/* Chart with improved styling */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <defs>
              {/* Improved gradient definitions */}
              <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[yMin, yMax]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: 'mmHg / bpm', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Improved Lines */}
            <Line 
              type="monotone" 
              dataKey="systolic" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Systolic BP"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Diastolic BP"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
              connectNulls={false}
            />
            {hasHeartRateData && (
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Heart Rate"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Detailed Chart Information */}
      <div className="space-y-3">
        {/* Chart Legend */}
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
            <span className="font-medium">Trends over time</span>
            <span>•</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="text-red-500">■</span> Systolic</span>
              <span className="flex items-center gap-1"><span className="text-blue-500">■</span> Diastolic</span>
              {hasHeartRateData && <span className="flex items-center gap-1"><span className="text-green-500">■</span> Heart Rate</span>}
            </div>
          </div>
        </div>

        {/* Reading Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Data Range</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Readings:</span>
                <span className="font-medium">{chartData.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">
                  {chartData.length > 1 ? 
                    `${Math.ceil((new Date(chartData[chartData.length - 1].fullDate).getTime() - new Date(chartData[0].fullDate).getTime()) / (1000 * 60 * 60 * 24))} days` 
                    : '1 day'
                  }
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Y-axis:</span>
                <span className="font-medium">{yMin}-{yMax}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-3 border border-green-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Variability</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Sys Range:</span>
                <span className="font-medium">
                  {Math.min(...chartData.map(d => d.systolic))}-{Math.max(...chartData.map(d => d.systolic))} mmHg
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Dia Range:</span>
                <span className="font-medium">
                  {Math.min(...chartData.map(d => d.diastolic))}-{Math.max(...chartData.map(d => d.diastolic))} mmHg
                </span>
              </div>
              {hasHeartRateData && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">HR Range:</span>
                  <span className="font-medium">
                    {Math.min(...chartData.filter(d => d.heartRate).map(d => d.heartRate!))}-{Math.max(...chartData.filter(d => d.heartRate).map(d => d.heartRate!))} bpm
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        {chartData.length >= 2 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Recent Trend Analysis</div>
            <div className="space-y-2">
              {(() => {
                // Get recent readings (last 30% or minimum 2)
                const recentCount = Math.max(2, Math.ceil(chartData.length * 0.3));
                const recentReadings = chartData.slice(-recentCount);
                
                // Calculate trend using linear regression on recent data
                const calculateTrend = (values: number[]) => {
                  if (values.length < 2) return 0;
                  
                  const n = values.length;
                  const x = Array.from({length: n}, (_, i) => i);
                  const sumX = x.reduce((a, b) => a + b, 0);
                  const sumY = values.reduce((a, b) => a + b, 0);
                  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
                  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
                  
                  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                  return slope * (n - 1); // Total change over the period
                };
                
                const systolicValues = recentReadings.map(r => r.systolic);
                const diastolicValues = recentReadings.map(r => r.diastolic);
                
                const sysTrend = calculateTrend(systolicValues);
                const diaTrend = calculateTrend(diastolicValues);
                
                // Calculate variability (standard deviation)
                const calculateVariability = (values: number[]) => {
                  const mean = values.reduce((a, b) => a + b, 0) / values.length;
                  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
                  return Math.sqrt(variance);
                };
                
                const sysVariability = calculateVariability(systolicValues);
                const diaVariability = calculateVariability(diastolicValues);
                
                // Determine trend interpretation
                const interpretTrend = (trend: number, variability: number) => {
                  const absT = Math.abs(trend);
                  if (absT < 1 || absT < variability) return 'stable';
                  if (trend > 0) return 'rising';
                  return 'declining';
                };
                
                const sysTrendType = interpretTrend(sysTrend, sysVariability);
                const diaTrendType = interpretTrend(diaTrend, diaVariability);
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className={`text-sm font-bold ${
                          sysTrendType === 'rising' ? 'text-red-600' : 
                          sysTrendType === 'declining' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {sysTrendType === 'rising' ? '📈' : sysTrendType === 'declining' ? '📉' : '➡️'} 
                          {sysTrendType === 'stable' ? 'Stable' : 
                           sysTrendType === 'rising' ? 'Rising' : 'Improving'}
                        </div>
                        <div className="text-xs text-gray-600">Systolic Pattern</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className={`text-sm font-bold ${
                          diaTrendType === 'rising' ? 'text-red-600' : 
                          diaTrendType === 'declining' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {diaTrendType === 'rising' ? '📈' : diaTrendType === 'declining' ? '📉' : '➡️'} 
                          {diaTrendType === 'stable' ? 'Stable' : 
                           diaTrendType === 'rising' ? 'Rising' : 'Improving'}
                        </div>
                        <div className="text-xs text-gray-600">Diastolic Pattern</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 bg-white rounded p-2 border">
                      <div className="font-medium mb-1">Analysis (last {recentCount} readings):</div>
                      <div className="space-y-1">
                        <div>• Systolic: {sysVariability.toFixed(1)} mmHg variability</div>
                        <div>• Diastolic: {diaVariability.toFixed(1)} mmHg variability</div>
                        <div>• Pattern: {
                          (sysTrendType === 'rising' && diaTrendType === 'rising') ? '⚠️ Both pressures trending up' :
                          (sysTrendType === 'declining' && diaTrendType === 'declining') ? '✅ Both pressures improving' :
                          (sysTrendType === 'stable' && diaTrendType === 'stable') ? '✅ Consistent readings' :
                          '📊 Mixed pattern - monitor closely'
                        }</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
