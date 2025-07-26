import ExcelJS from 'exceljs';

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

  // Create workbook with enhanced settings
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BP Monitor App';
  workbook.lastModifiedBy = 'BP Monitor App';
  workbook.created = new Date();

  // Define color scheme
  const colors = {
    primaryBlue: '2563EB',
    lightBlue: 'E0F2FE',
    normalGreen: '10B981',
    lightGreen: 'ECFDF5',
    elevatedYellow: 'F59E0B',
    lightYellow: 'FFFBEB',
    stage1Orange: 'F97316',
    lightOrange: 'FFF7ED',
    stage2Red: 'EF4444',
    lightRed: 'FEF2F2',
    crisisRed: '991B1B',
    darkRed: '450A0A',
    grayBorder: 'E5E7EB',
    lightGray: 'F9FAFB',
    darkGray: '6B7280',
    white: 'FFFFFF'
  };

  // Helper function to get category colors
  const getCategoryColors = (category: string) => {
    if (category.includes('Normal')) return { bg: colors.lightGreen, text: colors.normalGreen };
    if (category.includes('Elevated')) return { bg: colors.lightYellow, text: colors.elevatedYellow };
    if (category.includes('Stage 1')) return { bg: colors.lightOrange, text: colors.stage1Orange };
    if (category.includes('Stage 2')) return { bg: colors.lightRed, text: colors.stage2Red };
    if (category.includes('Crisis')) return { bg: colors.darkRed, text: colors.white };
    return { bg: colors.lightGray, text: colors.darkGray };
  };

  // Helper function to get BP status colors
  const getBPStatusColors = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { bg: colors.crisisRed, text: colors.white };
    if (sys >= 140 || dia >= 90) return { bg: colors.stage2Red, text: colors.white };
    if (sys >= 130 || dia >= 80) return { bg: colors.stage1Orange, text: colors.white };
    if (sys >= 120) return { bg: colors.elevatedYellow, text: colors.white };
    return { bg: colors.normalGreen, text: colors.white };
  };

  // 1. Executive Summary Sheet
  const summarySheet = workbook.addWorksheet('📊 Executive Summary', {
    properties: {
      showGridLines: false, // Remove gridlines
      defaultRowHeight: 18,
      defaultColWidth: 15
    },
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      margins: {
        left: 0.75, right: 0.75, top: 1.0, bottom: 1.0,
        header: 0.3, footer: 0.3
      }
    }
  });

  // Set column widths
  summarySheet.columns = [
    { width: 30 }, // A
    { width: 25 }, // B
    { width: 30 }, // C
    { width: 40 }  // D
  ];

  let currentRow = 1;

  // Title
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = '🏥 BLOOD PRESSURE MONITORING REPORT - CLINICAL SUMMARY';
  titleCell.style = {
    font: { bold: true, size: 16, color: { argb: colors.white } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thick', color: { argb: colors.primaryBlue } },
      left: { style: 'thick', color: { argb: colors.primaryBlue } },
      bottom: { style: 'thick', color: { argb: colors.primaryBlue } },
      right: { style: 'thick', color: { argb: colors.primaryBlue } }
    }
  };
  summarySheet.mergeCells('A1:D1');
  currentRow += 2;

  // Patient Information Section
  const patientHeaderCell = summarySheet.getCell(`A${currentRow}`);
  patientHeaderCell.value = '👤 PATIENT INFORMATION';
  patientHeaderCell.style = {
    font: { bold: true, size: 12, color: { argb: colors.white } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.darkGray } },
    alignment: { horizontal: 'left', vertical: 'middle' }
  };
  summarySheet.mergeCells(`A${currentRow}:D${currentRow}`);
  currentRow++;

  const patientInfo = [
    ['Patient Name:', userName, '', ''],
    ['Report Date:', new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }), '', ''],
    ['Total Readings:', readings.length.toString(), '', ''],
    ['Monitoring Period:', `${new Date(sortedReadings[0].datetime).toLocaleDateString('en-GB')} to ${new Date(sortedReadings[sortedReadings.length - 1].datetime).toLocaleDateString('en-GB')}`, '', '']
  ];

  patientInfo.forEach(([label, value]) => {
    const labelCell = summarySheet.getCell(`A${currentRow}`);
    const valueCell = summarySheet.getCell(`B${currentRow}`);
    
    labelCell.value = label;
    labelCell.style = {
      font: { bold: true, size: 10 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightBlue } },
      alignment: { horizontal: 'left', vertical: 'middle' }
    };
    
    valueCell.value = value;
    valueCell.style = {
      font: { size: 10 },
      alignment: { horizontal: 'left', vertical: 'middle' }
    };
    
    currentRow++;
  });
  currentRow++;

  // Clinical Statistics Section
  const statsHeaderCell = summarySheet.getCell(`A${currentRow}`);
  statsHeaderCell.value = '📊 CLINICAL STATISTICS';
  statsHeaderCell.style = {
    font: { bold: true, size: 12, color: { argb: colors.white } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.darkGray } },
    alignment: { horizontal: 'left', vertical: 'middle' }
  };
  summarySheet.mergeCells(`A${currentRow}:D${currentRow}`);
  currentRow++;

  // Stats table header
  const statsHeaders = ['📊 Metric', '📈 Value', '🎯 Target Range', '⚕️ Status'];
  statsHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 1);
    cell.value = header;
    cell.style = {
      font: { bold: true, size: 10, color: { argb: colors.white } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: colors.grayBorder } },
        left: { style: 'thin', color: { argb: colors.grayBorder } },
        bottom: { style: 'thin', color: { argb: colors.grayBorder } },
        right: { style: 'thin', color: { argb: colors.grayBorder } }
      }
    };
  });
  currentRow++;

  // Stats data
  const avgSys = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
  const avgDia = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
  
  const statsData = [
    ['Average Systolic BP', `${avgSys} mmHg`, '< 120 mmHg', avgSys < 120 ? '✅ NORMAL' : avgSys < 130 ? '⚠️ ELEVATED' : avgSys < 140 ? '⚠️ STAGE 1 HIGH' : avgSys < 180 ? '❌ STAGE 2 HIGH' : '🚨 CRISIS'],
    ['Average Diastolic BP', `${avgDia} mmHg`, '< 80 mmHg', avgDia < 80 ? '✅ NORMAL' : avgDia < 90 ? '⚠️ STAGE 1 HIGH' : avgDia < 120 ? '❌ STAGE 2 HIGH' : '🚨 CRISIS'],
    ['Overall BP Classification', `${avgSys}/${avgDia} mmHg`, 'Normal < 120/80', '']
  ];

  // Add heart rate if available
  const heartRateReadings = readings.filter(r => r.heartRate);
  if (heartRateReadings.length > 0) {
    const avgHR = Math.round(heartRateReadings.reduce((sum, r) => sum + r.heartRate!, 0) / heartRateReadings.length);
    const hrStatus = (avgHR >= 60 && avgHR <= 100) ? '✅ NORMAL' : 
                    (avgHR < 60) ? '⚠️ BRADYCARDIA' : '⚠️ TACHYCARDIA';
    statsData.push(['Average Heart Rate', `${avgHR} bpm`, '60-100 bpm', hrStatus]);
  }

  statsData.forEach((row, rowIndex) => {
    const bpColors = getBPStatusColors(avgSys, avgDia);
    
    row.forEach((cell, colIndex) => {
      const cellRef = summarySheet.getCell(currentRow, colIndex + 1);
      cellRef.value = cell;
      
      // Apply status coloring for the status column
      if (colIndex === 3 && cell) {
        const statusColors = cell.includes('NORMAL') ? { bg: colors.normalGreen, text: colors.white } :
                           cell.includes('ELEVATED') ? { bg: colors.elevatedYellow, text: colors.white } :
                           cell.includes('STAGE 1') ? { bg: colors.stage1Orange, text: colors.white } :
                           cell.includes('STAGE 2') ? { bg: colors.stage2Red, text: colors.white } :
                           cell.includes('CRISIS') ? { bg: colors.crisisRed, text: colors.white } :
                           { bg: colors.lightGray, text: colors.darkGray };
        
        cellRef.style = {
          font: { bold: true, size: 10, color: { argb: statusColors.text } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors.bg } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin', color: { argb: colors.grayBorder } },
            left: { style: 'thin', color: { argb: colors.grayBorder } },
            bottom: { style: 'thin', color: { argb: colors.grayBorder } },
            right: { style: 'thin', color: { argb: colors.grayBorder } }
          }
        };
      } else {
        cellRef.style = {
          font: { size: 10, bold: colIndex === 0 },
          alignment: { horizontal: colIndex === 0 ? 'left' : 'center', vertical: 'middle' },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIndex % 2 === 0 ? colors.white : colors.lightGray } },
          border: {
            top: { style: 'thin', color: { argb: colors.grayBorder } },
            left: { style: 'thin', color: { argb: colors.grayBorder } },
            bottom: { style: 'thin', color: { argb: colors.grayBorder } },
            right: { style: 'thin', color: { argb: colors.grayBorder } }
          }
        };
      }
    });
    currentRow++;
  });
  currentRow += 2;

  // Category Distribution Section
  const categoryHeaderCell = summarySheet.getCell(`A${currentRow}`);
  categoryHeaderCell.value = '🏷️ BLOOD PRESSURE CATEGORY DISTRIBUTION';
  categoryHeaderCell.style = {
    font: { bold: true, size: 12, color: { argb: colors.white } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.darkGray } },
    alignment: { horizontal: 'left', vertical: 'middle' }
  };
  summarySheet.mergeCells(`A${currentRow}:D${currentRow}`);
  currentRow++;

  // Category table
  const categoryHeaders = ['🏷️ BP Category', '📊 Count', '📈 Percentage', '⚕️ Health Impact'];
  categoryHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(currentRow, index + 1);
    cell.value = header;
    cell.style = {
      font: { bold: true, size: 10, color: { argb: colors.white } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: colors.grayBorder } },
        left: { style: 'thin', color: { argb: colors.grayBorder } },
        bottom: { style: 'thin', color: { argb: colors.grayBorder } },
        right: { style: 'thin', color: { argb: colors.grayBorder } }
      }
    };
  });
  currentRow++;

  const categoryCount = readings.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count], index) => {
      const percentage = Math.round((count / readings.length) * 100);
      const categoryColors = getCategoryColors(category);
      
      const data = [
        category,
        count.toString(),
        `${percentage}%`,
        category.includes('Normal') ? '✅ Optimal cardiovascular health' :
        category.includes('Elevated') ? '⚠️ Increased cardiovascular risk' :
        category.includes('Stage 1') ? '⚠️ Moderate cardiovascular risk' :
        category.includes('Stage 2') ? '❌ High cardiovascular risk' :
        category.includes('Crisis') ? '🚨 IMMEDIATE MEDICAL ATTENTION' : 'Monitor regularly'
      ];

      data.forEach((cellValue, colIndex) => {
        const cell = summarySheet.getCell(currentRow, colIndex + 1);
        cell.value = cellValue;
        
        // Apply category-specific coloring to the category column
        if (colIndex === 0) {
          cell.style = {
            font: { bold: true, size: 10, color: { argb: categoryColors.text } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: categoryColors.bg } },
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: {
              top: { style: 'thin', color: { argb: colors.grayBorder } },
              left: { style: 'thin', color: { argb: colors.grayBorder } },
              bottom: { style: 'thin', color: { argb: colors.grayBorder } },
              right: { style: 'thin', color: { argb: colors.grayBorder } }
            }
          };
        } else {
          cell.style = {
            font: { size: 10 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? colors.white : colors.lightGray } },
            border: {
              top: { style: 'thin', color: { argb: colors.grayBorder } },
              left: { style: 'thin', color: { argb: colors.grayBorder } },
              bottom: { style: 'thin', color: { argb: colors.grayBorder } },
              right: { style: 'thin', color: { argb: colors.grayBorder } }
            }
          };
        }
      });
      currentRow++;
    });

  // 2. Detailed Readings Sheet
  const readingsSheet = workbook.addWorksheet('📋 Detailed Readings', {
    properties: {
      showGridLines: false, // Remove gridlines
      defaultRowHeight: 20,
      defaultColWidth: 15
    }
  });

  // Set column widths for readings sheet
  readingsSheet.columns = [
    { width: 18 }, // Date
    { width: 10 }, // Time
    { width: 15 }, // Systolic
    { width: 15 }, // Diastolic
    { width: 15 }, // Heart Rate
    { width: 35 }, // Category
    { width: 25 }  // Notes
  ];

  let readingsRow = 1;

  // Title for readings sheet
  const readingsTitleCell = readingsSheet.getCell('A1');
  readingsTitleCell.value = '📋 COMPLETE BLOOD PRESSURE LOG - DETAILED READINGS';
  readingsTitleCell.style = {
    font: { bold: true, size: 14, color: { argb: colors.white } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.primaryBlue } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };
  readingsSheet.mergeCells('A1:G1');
  readingsRow += 2;

  // Headers for readings table
  const readingsHeaders = ['📅 Date', '🕐 Time', '📊 Systolic', '📊 Diastolic', '❤️ Heart Rate', '🏷️ BP Category', '📝 Clinical Notes'];
  readingsHeaders.forEach((header, index) => {
    const cell = readingsSheet.getCell(readingsRow, index + 1);
    cell.value = header;
    cell.style = {
      font: { bold: true, size: 11, color: { argb: colors.white } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.darkGray } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: colors.grayBorder } },
        left: { style: 'thin', color: { argb: colors.grayBorder } },
        bottom: { style: 'thin', color: { argb: colors.grayBorder } },
        right: { style: 'thin', color: { argb: colors.grayBorder } }
      }
    };
  });
  readingsRow++;

  // Readings data
  sortedReadings.forEach((reading, index) => {
    const date = new Date(reading.datetime);
    const dayOfWeek = date.toLocaleDateString('en-GB', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-GB');
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    const rowData = [
      `${dayOfWeek} ${dateStr}`,
      timeStr,
      reading.systolic.toString(),
      reading.diastolic.toString(),
      reading.heartRate ? reading.heartRate.toString() : 'N/A',
      reading.category,
      '' // Notes
    ];

    const categoryColors = getCategoryColors(reading.category);
    const isHighReading = reading.systolic >= 140 || reading.diastolic >= 90;

    rowData.forEach((cellValue, colIndex) => {
      const cell = readingsSheet.getCell(readingsRow, colIndex + 1);
      cell.value = cellValue;
      
      let cellStyle: any = {
        font: { size: 10 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? colors.white : colors.lightGray } },
        border: {
          top: { style: 'thin', color: { argb: colors.grayBorder } },
          left: { style: 'thin', color: { argb: colors.grayBorder } },
          bottom: { style: 'thin', color: { argb: colors.grayBorder } },
          right: { style: 'thin', color: { argb: colors.grayBorder } }
        }
      };

      // Special styling for high readings
      if ((colIndex === 2 || colIndex === 3) && isHighReading) {
        cellStyle.font = { size: 10, bold: true, color: { argb: colors.stage2Red } };
        cellStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.lightRed } };
      }

      // Category column gets category-specific coloring
      if (colIndex === 5) {
        cellStyle.font = { size: 10, bold: true, color: { argb: categoryColors.text } };
        cellStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: categoryColors.bg } };
        cellStyle.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      cell.style = cellStyle;
    });
    readingsRow++;
  });

  // Generate filename
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BP_Clinical_Report_${cleanName}_${dateStr}_${timeStr}.xlsx`;

  // Save the file
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Beautiful colored Excel report generated: ${filename}`);
    return filename;
  } catch (error) {
    console.error('❌ Error writing Excel file:', error);
    throw new Error('Failed to generate Excel file. Please check browser permissions and try again.');
  }
}
