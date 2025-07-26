import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const readingCount = await prisma.bpReading.count()
    
    // Get a sample reading
    const sampleReading = await prisma.bpReading.findFirst({
      include: {
        user: true
      }
    })

    return NextResponse.json({
      status: "Database connected successfully!",
      stats: {
        users: userCount,
        readings: readingCount
      },
      sampleReading: sampleReading ? {
        datetime: sampleReading.readingDatetime,
        systolic: sampleReading.systolic,
        diastolic: sampleReading.diastolic,
        heartRate: sampleReading.heartRate,
        category: sampleReading.category,
        user: sampleReading.user.name
      } : null
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: "Database connection failed", details: String(error) },
      { status: 500 }
    )
  }
}
