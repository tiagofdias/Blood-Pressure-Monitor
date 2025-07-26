import * as XLSX from 'xlsx';

interface BPReading {
  id: string;
  datetime: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  category: string;
}

export async function exportToExcel(readings: BPReading[], userName: string = 'Patient') {
  if (readings.length === 0) {
    alert('No data to export');
    return;
  }

  // Sort readings by date
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Helper function to create bordered table structure
  const createTableData = (title: string, headers: string[], data: any[][]) => {
    const table = [];
    table.push([title]);
    table.push(['']); // Empty row
    table.push([...headers]);
    table.push(...data);
    table.push(['']); // Empty row after table
    return table;
  };

  // Helper functions for status indicators
  const getBPStatus = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return '🚨 HYPERTENSIVE CRISIS';
    if (sys >= 140 || dia >= 90) return '❌ HIGH BP STAGE 2';
    if (sys >= 130 || dia >= 80) return '⚠️ HIGH BP STAGE 1';
    if (sys >= 120) return '⚠️ ELEVATED';
    return '✅ NORMAL';
  };

  const getHealthImpact = (category: string) => {
    if (category.includes('Normal')) return '✅ Optimal cardiovascular health';
    if (category.includes('Elevated')) return '⚠️ Increased cardiovascular risk';
    if (category.includes('Stage 1')) return '⚠️ Moderate cardiovascular risk';
    if (category.includes('Stage 2')) return '❌ High cardiovascular risk';
    if (category.includes('Crisis')) return '🚨 IMMEDIATE MEDICAL ATTENTION REQUIRED';
    return '📊 Monitor regularly';
  };

  // 1. Executive Summary Sheet
  const summaryData = [];
  
  // Title and patient info
  summaryData.push(['BLOOD PRESSURE MONITORING REPORT - CLINICAL SUMMARY']);
  summaryData.push(['']);
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  summaryData.push(['PATIENT INFORMATION']);
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  summaryData.push(['Patient Name:', userName]);
  summaryData.push(['Report Date:', new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })]);
  summaryData.push(['Total Readings:', readings.length.toString()]);
  summaryData.push(['Monitoring Period:', `${new Date(sortedReadings[0].datetime).toLocaleDateString('en-GB')} to ${new Date(sortedReadings[sortedReadings.length - 1].datetime).toLocaleDateString('en-GB')}`]);
  summaryData.push(['']);

  // Clinical Statistics Table
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  summaryData.push(['CLINICAL STATISTICS']);
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  
  const avgSys = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  const avgDia = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  
  const statsHeaders = ['📊 Metric', '📈 Value', '🎯 Target Range', '⚕️ Status'];
  const statsData = [
    ['Average Systolic BP', `${avgSys} mmHg`, '< 120 mmHg', avgSys < 120 ? '✅ NORMAL' : avgSys < 130 ? '⚠️ ELEVATED' : avgSys < 140 ? '⚠️ STAGE 1 HIGH' : avgSys < 180 ? '❌ STAGE 2 HIGH' : '🚨 CRISIS'],
    ['Average Diastolic BP', `${avgDia} mmHg`, '< 80 mmHg', avgDia < 80 ? '✅ NORMAL' : avgDia < 90 ? '⚠️ STAGE 1 HIGH' : avgDia < 120 ? '❌ STAGE 2 HIGH' : '🚨 CRISIS'],
    ['Overall BP Classification', `${avgSys}/${avgDia} mmHg`, 'Normal < 120/80', getBPStatus(avgSys, avgDia)]
  ];

  // Add heart rate if available
  const heartRateReadings = readings.filter(r => r.heartRate);
  if (heartRateReadings.length > 0) {
    const avgHR = Math.round(heartRateReadings.reduce((sum, r) => sum + r.heartRate!, 0) / heartRateReadings.length);
    const hrStatus = (avgHR >= 60 && avgHR <= 100) ? '✅ NORMAL' : 
                    (avgHR < 60) ? '⚠️ BRADYCARDIA (LOW)' : '⚠️ TACHYCARDIA (HIGH)';
    statsData.push(['Average Heart Rate', `${avgHR} bpm`, '60-100 bpm', hrStatus]);
  }

  summaryData.push(statsHeaders);
  summaryData.push(...statsData);
  summaryData.push(['']);

  // Category Distribution Table
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  summaryData.push(['BLOOD PRESSURE CATEGORY DISTRIBUTION']);
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);

  const categoryCount = readings.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryHeaders = ['🏷️ BP Category', '📊 Count', '📈 Percentage', '⚕️ Health Impact'];
  const categoryData = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => {
      const percentage = Math.round((count / readings.length) * 100);
      return [category, count.toString(), `${percentage}%`, getHealthImpact(category)];
    });

  summaryData.push(categoryHeaders);
  summaryData.push(...categoryData);
  summaryData.push(['']);

  // Recent Trend Analysis
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  summaryData.push(['RECENT TREND ANALYSIS (Last 7 readings)']);
  summaryData.push(['══════════════════════════════════════════════════════════════════════════════════']);

  const recentReadings = sortedReadings.slice(-Math.min(7, sortedReadings.length));
  const recentAvgSys = Math.round(recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length);
  const recentAvgDia = Math.round(recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length);
  
  const sysTrend = recentAvgSys - avgSys;
  const diaTrend = recentAvgDia - avgDia;
  
  const getTrendRecommendation = () => {
    if (Math.abs(sysTrend) <= 2 && Math.abs(diaTrend) <= 2) return '✅ Stable - Continue current management';
    if (sysTrend > 5 || diaTrend > 3) return '⚠️ Rising trend - Consider medical review';
    if (sysTrend < -5 || diaTrend < -3) return '✅ Improving - Current therapy effective';
    return '📊 Monitor closely for pattern development';
  };

  const trendHeaders = ['📅 Period', '📊 Average BP', '📈 Trend vs Overall', '💡 Recommendation'];
  const trendData = [
    ['Overall Average', `${avgSys}/${avgDia} mmHg`, 'Baseline', 'Historical reference point'],
    ['Recent 7 readings', `${recentAvgSys}/${recentAvgDia} mmHg`, 
     `${sysTrend >= 0 ? '+' : ''}${sysTrend}/${diaTrend >= 0 ? '+' : ''}${diaTrend} mmHg`, 
     getTrendRecommendation()]
  ];

  summaryData.push(trendHeaders);
  summaryData.push(...trendData);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 25 }, // Column A
    { wch: 20 }, // Column B  
    { wch: 25 }, // Column C
    { wch: 40 }  // Column D
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Executive Summary');

  // 2. Detailed Readings Sheet with Table Structure
  const readingsData = [];
  
  readingsData.push(['COMPLETE BLOOD PRESSURE LOG - DETAILED READINGS']);
  readingsData.push(['']);
  readingsData.push(['══════════════════════════════════════════════════════════════════════════════════']);
  readingsData.push(['CHRONOLOGICAL BLOOD PRESSURE MEASUREMENTS']);
  readingsData.push(['══════════════════════════════════════════════════════════════════════════════════']);

  const readingsHeaders = ['📅 Date', '🕐 Time', '📊 Systolic (mmHg)', '📊 Diastolic (mmHg)', '❤️ Heart Rate (bpm)', '🏷️ BP Category', '📝 Clinical Notes'];
  readingsData.push(readingsHeaders);

  sortedReadings.forEach((reading, index) => {
    const date = new Date(reading.datetime);
    const dayOfWeek = date.toLocaleDateString('en-GB', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-GB');
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    // Add visual indicators for high readings
    const sysDisplay = reading.systolic >= 140 ? `⚠️ ${reading.systolic}` : reading.systolic.toString();
    const diaDisplay = reading.diastolic >= 90 ? `⚠️ ${reading.diastolic}` : reading.diastolic.toString();
    const hrDisplay = reading.heartRate ? reading.heartRate.toString() : 'N/A';
    
    readingsData.push([
      `${dayOfWeek} ${dateStr}`,
      timeStr,
      sysDisplay,
      diaDisplay,
      hrDisplay,
      reading.category,
      '' // Empty notes column for healthcare provider
    ]);
  });

  const readingsSheet = XLSX.utils.aoa_to_sheet(readingsData);
  readingsSheet['!cols'] = [
    { wch: 15 }, // Date with day
    { wch: 8 },  // Time
    { wch: 15 }, // Systolic
    { wch: 15 }, // Diastolic
    { wch: 15 }, // Heart Rate
    { wch: 30 }, // Category
    { wch: 25 }  // Clinical Notes
  ];

  XLSX.utils.book_append_sheet(workbook, readingsSheet, '📋 Detailed Readings');

  // 3. Monthly Trends Sheet (if data spans multiple months)
  const monthlyData = new Map<string, { 
    count: number, 
    totalSys: number, 
    totalDia: number, 
    totalHR: number, 
    hrCount: number,
    categories: Record<string, number>
  }>();

  sortedReadings.forEach(reading => {
    const date = new Date(reading.datetime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { 
        count: 0, 
        totalSys: 0, 
        totalDia: 0, 
        totalHR: 0, 
        hrCount: 0,
        categories: {}
      });
    }
    
    const monthStats = monthlyData.get(monthKey)!;
    monthStats.count++;
    monthStats.totalSys += reading.systolic;
    monthStats.totalDia += reading.diastolic;
    
    if (reading.heartRate) {
      monthStats.totalHR += reading.heartRate;
      monthStats.hrCount++;
    }
    
    monthStats.categories[reading.category] = (monthStats.categories[reading.category] || 0) + 1;
  });

  if (monthlyData.size > 1) {
    const monthlySheetData = [];
    
    monthlySheetData.push(['MONTHLY TRENDS ANALYSIS']);
    monthlySheetData.push(['']);
    monthlySheetData.push(['══════════════════════════════════════════════════════════════════════════════════']);
    monthlySheetData.push(['MONTH-BY-MONTH BLOOD PRESSURE TRENDS']);
    monthlySheetData.push(['══════════════════════════════════════════════════════════════════════════════════']);

    const monthlyHeaders = ['📅 Month', '📊 Total Readings', '📈 Avg Systolic', '📈 Avg Diastolic', '❤️ Avg Heart Rate', '🏷️ Dominant Category', '⚕️ Health Status'];
    monthlySheetData.push(monthlyHeaders);

    Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, stats]) => {
        const avgSys = Math.round(stats.totalSys / stats.count);
        const avgDia = Math.round(stats.totalDia / stats.count);
        const avgHR = stats.hrCount > 0 ? Math.round(stats.totalHR / stats.hrCount) : 'N/A';
        
        const mostCommonCategory = Object.entries(stats.categories)
          .sort(([,a], [,b]) => b - a)[0][0];

        const healthStatus = getBPStatus(avgSys, avgDia);

        monthlySheetData.push([
          new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          stats.count.toString(),
          `${avgSys} mmHg`,
          `${avgDia} mmHg`,
          typeof avgHR === 'number' ? `${avgHR} bpm` : avgHR,
          mostCommonCategory,
          healthStatus
        ]);
      });

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlySheetData);
    monthlySheet['!cols'] = [
      { wch: 15 }, // Month
      { wch: 12 }, // Readings count
      { wch: 15 }, // Avg Systolic
      { wch: 15 }, // Avg Diastolic  
      { wch: 15 }, // Avg Heart Rate
      { wch: 30 }, // Dominant Category
      { wch: 25 }  // Health Status
    ];

    XLSX.utils.book_append_sheet(workbook, monthlySheet, '📈 Monthly Trends');
  }

  // 4. Clinical Analysis Sheet
  if (sortedReadings.length >= 3) {
    const analysisData = [];
    
    analysisData.push(['CLINICAL TREND ANALYSIS & MEDICAL RECOMMENDATIONS']);
    analysisData.push(['']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);
    analysisData.push(['ADVANCED CLINICAL ANALYSIS']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);
    analysisData.push(['Analysis Parameters:']);
    analysisData.push(['• Data Points Analyzed:', sortedReadings.length.toString()]);
    analysisData.push(['• Analysis Period:', `${new Date(sortedReadings[0].datetime).toLocaleDateString('en-GB')} to ${new Date(sortedReadings[sortedReadings.length - 1].datetime).toLocaleDateString('en-GB')}`]);
    analysisData.push(['• Trend Calculation Method:', 'Linear regression analysis']);
    analysisData.push(['']);

    // Enhanced trend calculation using linear regression
    const calculateTrend = (values: number[]) => {
      const n = values.length;
      const x = Array.from({length: n}, (_, i) => i);
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      return slope;
    };

    const recentCount = Math.max(5, Math.ceil(sortedReadings.length * 0.3));
    const recentAnalysisReadings = sortedReadings.slice(-recentCount);
    
    const sysValues = recentAnalysisReadings.map(r => r.systolic);
    const diaValues = recentAnalysisReadings.map(r => r.diastolic);
    
    const sysTrend = calculateTrend(sysValues);
    const diaTrend = calculateTrend(diaValues);
    
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);
    analysisData.push(['TREND ANALYSIS RESULTS']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);

    const trendHeaders = ['📊 Parameter', '📈 Trend Analysis', '⚕️ Clinical Interpretation', '💡 Medical Recommendation'];
    analysisData.push(trendHeaders);

    const interpretTrend = (slope: number, param: string) => {
      if (Math.abs(slope) < 0.5) return `${param} readings are stable`;
      if (slope > 0) return `${param} increasing by ${slope.toFixed(1)} mmHg per reading`;
      return `${param} decreasing by ${Math.abs(slope).toFixed(1)} mmHg per reading`;
    };

    const getRecommendation = (slope: number, isSystemic: boolean) => {
      const threshold = isSystemic ? 1.0 : 0.8;
      if (Math.abs(slope) < 0.5) return '✅ Stable - Continue current management';
      if (slope > threshold) return '⚠️ Rising trend - Medical review recommended';
      if (slope < -threshold) return '✅ Improving - Current therapy effective';
      return '📊 Mild trend - Continue monitoring';
    };

    analysisData.push([
      'Systolic Blood Pressure',
      `${recentAnalysisReadings[0].systolic} → ${recentAnalysisReadings[recentAnalysisReadings.length - 1].systolic} mmHg`,
      interpretTrend(sysTrend, 'Systolic BP'),
      getRecommendation(sysTrend, true)
    ]);

    analysisData.push([
      'Diastolic Blood Pressure',
      `${recentAnalysisReadings[0].diastolic} → ${recentAnalysisReadings[recentAnalysisReadings.length - 1].diastolic} mmHg`,
      interpretTrend(diaTrend, 'Diastolic BP'),
      getRecommendation(diaTrend, false)
    ]);

    // Variability Analysis
    analysisData.push(['']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);
    analysisData.push(['BLOOD PRESSURE VARIABILITY ASSESSMENT']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);

    const calculateVariability = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    };

    const sysVariability = calculateVariability(sysValues);
    const diaVariability = calculateVariability(diaValues);

    const variabilityHeaders = ['📊 Parameter', '📈 Standard Deviation', '⚕️ Clinical Assessment', '💡 Clinical Significance'];
    analysisData.push(variabilityHeaders);

    const assessVariability = (sd: number, isSystemic: boolean) => {
      const highThreshold = isSystemic ? 15 : 10;
      const moderateThreshold = isSystemic ? 8 : 6;
      
      if (sd > highThreshold) return '❌ High variability - Concerning';
      if (sd > moderateThreshold) return '⚠️ Moderate variability';
      return '✅ Low variability - Good control';
    };

    const getVariabilitySignificance = (sd: number, isSystemic: boolean) => {
      const highThreshold = isSystemic ? 15 : 10;
      
      if (sd > highThreshold) return 'Consider medication adjustment or underlying causes';
      return 'Variability within acceptable clinical range';
    };

    analysisData.push([
      'Systolic BP Variability',
      `${sysVariability.toFixed(1)} mmHg`,
      assessVariability(sysVariability, true),
      getVariabilitySignificance(sysVariability, true)
    ]);

    analysisData.push([
      'Diastolic BP Variability',
      `${diaVariability.toFixed(1)} mmHg`,
      assessVariability(diaVariability, false),
      getVariabilitySignificance(diaVariability, false)
    ]);

    // Clinical Recommendations
    analysisData.push(['']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);
    analysisData.push(['CLINICAL RECOMMENDATIONS']);
    analysisData.push(['══════════════════════════════════════════════════════════════════════════════════']);

    const recentAvgSysAnalysis = Math.round(recentAnalysisReadings.reduce((sum, r) => sum + r.systolic, 0) / recentAnalysisReadings.length);
    const recentAvgDiaAnalysis = Math.round(recentAnalysisReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentAnalysisReadings.length);

    const recommendationHeaders = ['🎯 Clinical Finding', '⚕️ Medical Assessment', '💡 Recommended Action', '📋 Follow-up'];
    analysisData.push(recommendationHeaders);

    if (recentAvgSysAnalysis >= 140 || recentAvgDiaAnalysis >= 90) {
      analysisData.push([
        'Hypertension Detected',
        `Recent average: ${recentAvgSysAnalysis}/${recentAvgDiaAnalysis} mmHg`,
        '🚨 Immediate medical consultation required',
        'Blood pressure medication review and lifestyle counseling'
      ]);
    } else if (recentAvgSysAnalysis >= 130 || recentAvgDiaAnalysis >= 80) {
      analysisData.push([
        'Elevated Blood Pressure',
        `Recent average: ${recentAvgSysAnalysis}/${recentAvgDiaAnalysis} mmHg`,
        '⚠️ Lifestyle modifications recommended',
        'Monitor weekly and reassess in 3 months'
      ]);
    } else {
      analysisData.push([
        'Normal Blood Pressure Range',
        `Recent average: ${recentAvgSysAnalysis}/${recentAvgDiaAnalysis} mmHg`,
        '✅ Continue current management approach',
        'Annual monitoring or as clinically indicated'
      ]);
    }

    const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
    analysisSheet['!cols'] = [
      { wch: 25 }, // Parameter
      { wch: 30 }, // Analysis/Assessment
      { wch: 35 }, // Interpretation/Assessment
      { wch: 40 }  // Recommendation/Significance
    ];

    XLSX.utils.book_append_sheet(workbook, analysisSheet, '🩺 Clinical Analysis');
  }

  // Generate professional filename
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BP_Clinical_Report_${cleanName}_${dateStr}_${timeStr}.xlsx`;

  // Save the file with enhanced error handling
  try {
    XLSX.writeFile(workbook, filename);
    console.log(`✅ Professional Excel report generated: ${filename}`);
    return filename;
  } catch (error) {
    console.error('❌ Error writing Excel file:', error);
    throw new Error('Failed to generate Excel file. Please check file permissions and try again.');
  }
}
