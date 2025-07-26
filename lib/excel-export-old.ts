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

  // Helper function to create Excel table structure
  const createTableData = (headers: string[], data: any[][]) => {
    return [headers, ...data];
  };

  // 1. Summary Sheet with Enhanced Formatting
  const summaryData = [
    ['BLOOD PRESSURE MONITORING REPORT'],
    [''],
    ['Patient Information'],
    ['Patient Name:', userName],
    ['Report Date:', new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })],
    ['Total Readings:', readings.length.toString()],
    ['Period:', `${new Date(sortedReadings[0].datetime).toLocaleDateString('en-GB')} - ${new Date(sortedReadings[sortedReadings.length - 1].datetime).toLocaleDateString('en-GB')}`],
    [''],
    ['OVERALL STATISTICS'],
    [''],
    ['Metric', 'Value', 'Reference Range'],
    ['Average Systolic', Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length) + ' mmHg', '< 120 mmHg (Normal)'],
    ['Average Diastolic', Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length) + ' mmHg', '< 80 mmHg (Normal)'],
  ];

  // Add heart rate summary if available
  const heartRateReadings = readings.filter(r => r.heartRate);
  if (heartRateReadings.length > 0) {
    const avgHR = Math.round(heartRateReadings.reduce((sum, r) => sum + r.heartRate!, 0) / heartRateReadings.length);
    summaryData.push(['Average Heart Rate', avgHR + ' bpm', '60-100 bpm (Normal)']);
  }

  // Enhanced category distribution
  const categoryCount = readings.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  summaryData.push([''], ['BLOOD PRESSURE CATEGORIES'], ['']);
  summaryData.push(['Category', 'Count', 'Percentage']);
  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percentage = Math.round((count / readings.length) * 100);
      summaryData.push([category, count.toString(), `${percentage}%`]);
    });

  // Add health insights
  summaryData.push([''], ['HEALTH INSIGHTS'], ['']);
  const recentReadings = sortedReadings.slice(-7);
  const recentAvgSys = Math.round(recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length);
  const recentAvgDia = Math.round(recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length);
  
  summaryData.push(['Recent 7-Day Average', `${recentAvgSys}/${recentAvgDia} mmHg`, '']);
  summaryData.push(['Trend Analysis', recentAvgSys > 130 ? 'Monitoring recommended' : 'Within target range', '']);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Apply beautiful formatting to summary sheet
  const summaryRange = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1');
  
  // Title formatting
  setCellStyle(summarySheet, 'A1', {
    font: { bold: true, size: 16, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: colors.header } },
    alignment: { horizontal: 'center', vertical: 'center' }
  });
  
  // Section headers
  ['A3', 'A9', 'A17', 'A26'].forEach(cell => {
    setCellStyle(summarySheet, cell, {
      font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: colors.subHeader } },
      alignment: { horizontal: 'left', vertical: 'center' }
    });
  });

  // Column headers
  ['A11', 'B11', 'C11', 'A19', 'B19', 'C19'].forEach(cell => {
    setCellStyle(summarySheet, cell, {
      font: { bold: true, size: 10 },
      fill: { fgColor: { rgb: colors.background } },
      border: {
        top: { style: 'thin', color: { rgb: colors.border } },
        bottom: { style: 'thin', color: { rgb: colors.border } },
        left: { style: 'thin', color: { rgb: colors.border } },
        right: { style: 'thin', color: { rgb: colors.border } }
      }
    });
  });

  // Set column widths
  summarySheet['!cols'] = [
    { wch: 25 }, // Column A
    { wch: 20 }, // Column B  
    { wch: 25 }  // Column C
  ];

  // Merge title cell
  summarySheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Report');

  // 2. Enhanced All Readings Sheet
  const readingsData = [
    ['COMPLETE BLOOD PRESSURE LOG'],
    [''],
    ['Date', 'Time', 'Systolic\n(mmHg)', 'Diastolic\n(mmHg)', 'Heart Rate\n(bpm)', 'BP Category', 'Clinical Notes']
  ];

  sortedReadings.forEach((reading, index) => {
    const date = new Date(reading.datetime);
    readingsData.push([
      date.toLocaleDateString('en-GB'),
      date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      reading.systolic.toString(),
      reading.diastolic.toString(),
      reading.heartRate ? reading.heartRate.toString() : 'N/A',
      reading.category,
      '' // Notes column for healthcare provider
    ]);
  });

  const readingsSheet = XLSX.utils.aoa_to_sheet(readingsData);
  
  // Enhanced formatting for readings sheet
  // Title formatting
  setCellStyle(readingsSheet, 'A1', {
    font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: colors.header } },
    alignment: { horizontal: 'center', vertical: 'center' }
  });

  // Header row formatting
  ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'].forEach(cell => {
    setCellStyle(readingsSheet, cell, {
      font: { bold: true, size: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: colors.subHeader } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: colors.border } },
        bottom: { style: 'thin', color: { rgb: colors.border } },
        left: { style: 'thin', color: { rgb: colors.border } },
        right: { style: 'thin', color: { rgb: colors.border } }
      }
    });
  });

  // Data rows formatting with alternating colors and category-based highlighting
  for (let i = 4; i <= readingsData.length; i++) {
    const rowIndex = i - 4; // Adjust for data array index
    const reading = sortedReadings[rowIndex];
    const isEvenRow = (i % 2) === 0;
    const bgColor = isEvenRow ? 'FFFFFFFF' : colors.background;
    
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
      const cell = col + i;
      let cellStyle: any = {
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: bgColor } },
        border: {
          top: { style: 'thin', color: { rgb: colors.border } },
          bottom: { style: 'thin', color: { rgb: colors.border } },
          left: { style: 'thin', color: { rgb: colors.border } },
          right: { style: 'thin', color: { rgb: colors.border } }
        }
      };

      // Special formatting for BP category column
      if (col === 'F' && reading) {
        cellStyle.fill = { fgColor: { rgb: getCategoryColor(reading.category) } };
        cellStyle.font = { 
          bold: true, 
          color: { rgb: reading.category.includes('Normal') ? 'FFFFFF' : 'FFFFFF' }
        };
      }

      setCellStyle(readingsSheet, cell, cellStyle);
    });
  }

  // Enhanced column widths
  readingsSheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 8 },  // Time
    { wch: 12 }, // Systolic
    { wch: 12 }, // Diastolic
    { wch: 12 }, // Heart Rate
    { wch: 30 }, // Category
    { wch: 25 }  // Clinical Notes
  ];

  // Merge title cell
  if (!readingsSheet['!merges']) readingsSheet['!merges'] = [];
  readingsSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

  XLSX.utils.book_append_sheet(workbook, readingsSheet, 'Detailed Readings');

  // 3. Enhanced Monthly Summary Sheet
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
    const monthlySheetData = [
      ['MONTHLY TRENDS ANALYSIS'],
      [''],
      ['Month', 'Total\nReadings', 'Avg Systolic\n(mmHg)', 'Avg Diastolic\n(mmHg)', 'Avg Heart Rate\n(bpm)', 'Dominant Category', 'Health Status']
    ];

    Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, stats]) => {
        const avgSys = Math.round(stats.totalSys / stats.count);
        const avgDia = Math.round(stats.totalDia / stats.count);
        const avgHR = stats.hrCount > 0 ? Math.round(stats.totalHR / stats.hrCount) : 'N/A';
        
        const mostCommonCategory = Object.entries(stats.categories)
          .sort(([,a], [,b]) => b - a)[0][0];

        const healthStatus = avgSys < 120 && avgDia < 80 ? 'Optimal' : 
                           avgSys < 130 && avgDia < 80 ? 'Normal' :
                           avgSys < 140 || avgDia < 90 ? 'Elevated' : 'High';

        monthlySheetData.push([
          new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          stats.count.toString(),
          avgSys.toString(),
          avgDia.toString(),
          typeof avgHR === 'number' ? avgHR.toString() : avgHR,
          mostCommonCategory,
          healthStatus
        ]);
      });

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlySheetData);
    
    // Enhanced formatting for monthly sheet
    setCellStyle(monthlySheet, 'A1', {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: colors.header } },
      alignment: { horizontal: 'center', vertical: 'center' }
    });

    // Header formatting
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'].forEach(cell => {
      setCellStyle(monthlySheet, cell, {
        font: { bold: true, size: 10, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: colors.subHeader } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: colors.border } },
          bottom: { style: 'thin', color: { rgb: colors.border } },
          left: { style: 'thin', color: { rgb: colors.border } },
          right: { style: 'thin', color: { rgb: colors.border } }
        }
      });
    });

    // Data formatting with health status coloring
    for (let i = 4; i <= monthlySheetData.length; i++) {
      ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
        setCellStyle(monthlySheet, col + i, {
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: colors.border } },
            bottom: { style: 'thin', color: { rgb: colors.border } },
            left: { style: 'thin', color: { rgb: colors.border } },
            right: { style: 'thin', color: { rgb: colors.border } }
          }
        });
      });
      
      // Color code health status
      const healthStatusCell = 'G' + i;
      const rowData = monthlySheetData[i - 1];
      if (rowData && rowData[6]) {
        const status = rowData[6] as string;
        const statusColor = status === 'Optimal' ? colors.normal :
                          status === 'Normal' ? colors.normal :
                          status === 'Elevated' ? colors.elevated : colors.stage1;
        setCellStyle(monthlySheet, healthStatusCell, {
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: statusColor } },
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          border: {
            top: { style: 'thin', color: { rgb: colors.border } },
            bottom: { style: 'thin', color: { rgb: colors.border } },
            left: { style: 'thin', color: { rgb: colors.border } },
            right: { style: 'thin', color: { rgb: colors.border } }
          }
        });
      }
    }

    monthlySheet['!cols'] = [
      { wch: 15 }, // Month
      { wch: 10 }, // Readings
      { wch: 12 }, // Avg Systolic
      { wch: 12 }, // Avg Diastolic  
      { wch: 12 }, // Avg Heart Rate
      { wch: 25 }, // Category
      { wch: 12 }  // Health Status
    ];

    if (!monthlySheet['!merges']) monthlySheet['!merges'] = [];
    monthlySheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Trends');
  }

  // 4. Enhanced Trend Analysis Sheet
  if (sortedReadings.length >= 3) {
    const trendData = [
      ['CLINICAL TREND ANALYSIS & RECOMMENDATIONS'],
      [''],
      ['Analysis Overview'],
      ['Data Points Analyzed:', sortedReadings.length.toString()],
      ['Analysis Period:', `${new Date(sortedReadings[0].datetime).toLocaleDateString('en-GB')} to ${new Date(sortedReadings[sortedReadings.length - 1].datetime).toLocaleDateString('en-GB')}`],
      [''],
      ['Recent Trend Analysis (Last 30% of readings)'],
      ['Parameter', 'Value', 'Interpretation', 'Clinical Significance']
    ];

    // Enhanced trend calculation
    const recentCount = Math.max(3, Math.ceil(sortedReadings.length * 0.3));
    const recentReadings = sortedReadings.slice(-recentCount);
    
    // Linear regression for better trend analysis
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

    const sysValues = recentReadings.map(r => r.systolic);
    const diaValues = recentReadings.map(r => r.diastolic);
    
    const sysTrend = calculateTrend(sysValues);
    const diaTrend = calculateTrend(diaValues);
    
    const interpretTrend = (slope: number, type: string) => {
      if (Math.abs(slope) < 0.5) return `${type} stable`;
      if (slope > 0) return `${type} increasing (${slope.toFixed(1)} mmHg/reading)`;
      return `${type} decreasing (${Math.abs(slope).toFixed(1)} mmHg/reading)`;
    };

    const clinicalSignificance = (slope: number, isSystemic: boolean) => {
      const threshold = isSystemic ? 1.0 : 0.8;
      if (Math.abs(slope) < 0.5) return 'Stable - Continue current management';
      if (slope > threshold) return 'Rising trend - Consider medication review';
      if (slope < -threshold) return 'Improving trend - Current therapy effective';
      return 'Mild trend - Monitor closely';
    };

    trendData.push([
      'Systolic Trend',
      `${recentReadings[0].systolic} → ${recentReadings[recentReadings.length - 1].systolic} mmHg`,
      interpretTrend(sysTrend, 'Systolic'),
      clinicalSignificance(sysTrend, true)
    ]);

    trendData.push([
      'Diastolic Trend', 
      `${recentReadings[0].diastolic} → ${recentReadings[recentReadings.length - 1].diastolic} mmHg`,
      interpretTrend(diaTrend, 'Diastolic'),
      clinicalSignificance(diaTrend, false)
    ]);

    // Enhanced variability analysis
    const calculateVariability = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    };

    const sysVariability = calculateVariability(sysValues);
    const diaVariability = calculateVariability(diaValues);

    trendData.push([''], ['Variability Assessment'], ['']);
    trendData.push(['Parameter', 'Standard Deviation', 'Assessment', 'Clinical Notes']);
    trendData.push([
      'Systolic Variability',
      `${sysVariability.toFixed(1)} mmHg`,
      sysVariability > 15 ? 'High variability' : sysVariability > 8 ? 'Moderate variability' : 'Low variability',
      sysVariability > 15 ? 'Consider medication adjustment' : 'Within acceptable range'
    ]);
    trendData.push([
      'Diastolic Variability',
      `${diaVariability.toFixed(1)} mmHg`, 
      diaVariability > 10 ? 'High variability' : diaVariability > 6 ? 'Moderate variability' : 'Low variability',
      diaVariability > 10 ? 'Investigate underlying causes' : 'Within acceptable range'
    ]);

    // Clinical recommendations
    trendData.push([''], ['Clinical Recommendations'], ['']);
    const avgSys = Math.round(recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length);
    const avgDia = Math.round(recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length);

    if (avgSys >= 140 || avgDia >= 90) {
      trendData.push(['High BP Detected', 'Immediate medical attention recommended', '', '']);
    } else if (avgSys >= 130 || avgDia >= 80) {
      trendData.push(['Elevated BP', 'Lifestyle modifications recommended', '', '']);
    } else {
      trendData.push(['Normal Range', 'Continue current management', '', '']);
    }

    const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
    
    // Enhanced formatting for trend analysis
    setCellStyle(trendSheet, 'A1', {
      font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: colors.header } },
      alignment: { horizontal: 'center', vertical: 'center' }
    });

    // Section headers
    ['A3', 'A7', 'A12', 'A18'].forEach(cell => {
      setCellStyle(trendSheet, cell, {
        font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: colors.subHeader } },
        alignment: { horizontal: 'left', vertical: 'center' }
      });
    });

    // Table headers
    ['A8', 'B8', 'C8', 'D8', 'A14', 'B14', 'C14', 'D14'].forEach(cell => {
      setCellStyle(trendSheet, cell, {
        font: { bold: true, size: 10 },
        fill: { fgColor: { rgb: colors.background } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: colors.border } },
          bottom: { style: 'thin', color: { rgb: colors.border } },
          left: { style: 'thin', color: { rgb: colors.border } },
          right: { style: 'thin', color: { rgb: colors.border } }
        }
      });
    });

    trendSheet['!cols'] = [
      { wch: 20 }, // Parameter
      { wch: 25 }, // Value/SD
      { wch: 30 }, // Interpretation/Assessment
      { wch: 35 }  // Clinical Significance/Notes
    ];

    if (!trendSheet['!merges']) trendSheet['!merges'] = [];
    trendSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

    XLSX.utils.book_append_sheet(workbook, trendSheet, 'Clinical Analysis');
  }

  // Generate professional filename with current date
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BP_Clinical_Report_${cleanName}_${dateStr}_${timeStr}.xlsx`;

  // Save the file with enhanced error handling
  try {
    XLSX.writeFile(workbook, filename);
    console.log(`Excel report generated: ${filename}`);
    return filename;
  } catch (error) {
    console.error('Error writing Excel file:', error);
    throw new Error('Failed to generate Excel file. Please check file permissions and try again.');
  }
}
