import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const readings = await prisma.bpReading.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        readingDatetime: 'desc'
      },
      take: 50 // Limit to last 50 readings
    })

    // Transform the data to match the expected format
    const formattedReadings = readings.map(reading => ({
      id: reading.id.toString(),
      date: `${reading.readingDate.getFullYear()}-${String(reading.readingDate.getMonth() + 1).padStart(2, '0')}-${String(reading.readingDate.getDate()).padStart(2, '0')}`,
      time: reading.readingTime,
      datetime: reading.readingDatetime.toISOString(),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heartRate: reading.heartRate,
      category: reading.category
    }))

    return NextResponse.json(formattedReadings)
  } catch (error) {
    console.error('Error fetching readings:', error)
    return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/readings - checking authentication...')
    
    // Get authenticated user
    const user = await getUserFromRequest(request)
    console.log('User from request:', user)
    
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reading = await request.json()
    console.log('Reading data:', reading)
    
    const readingDatetime = new Date(reading.datetime)
    // Fix timezone issue: extract date components without timezone conversion
    const year = readingDatetime.getFullYear()
    const month = readingDatetime.getMonth()
    const day = readingDatetime.getDate()
    const readingDate = new Date(year, month, day) // Local date without timezone conversion
    const readingTime = readingDatetime.toTimeString().split(' ')[0]

    const newReading = await prisma.bpReading.upsert({
      where: {
        userId_readingDatetime: {
          userId: user.id,
          readingDatetime: readingDatetime
        }
      },
      update: {
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heartRate: reading.heartRate,
        category: reading.category
      },
      create: {
        userId: user.id,
        readingDate: readingDate,
        readingTime: readingTime,
        readingDatetime: readingDatetime,
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heartRate: reading.heartRate,
        category: reading.category
      }
    })

    return NextResponse.json({ success: true, reading: newReading })
  } catch (error) {
    console.error('Error saving reading:', error)
    return NextResponse.json({ error: "Failed to save reading" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const readingId = searchParams.get('id')

    if (!readingId) {
      return NextResponse.json({ error: "Reading ID is required" }, { status: 400 })
    }

    // Verify the reading belongs to the authenticated user before deleting
    const reading = await prisma.bpReading.findFirst({
      where: {
        id: parseInt(readingId),
        userId: user.id
      }
    })

    if (!reading) {
      return NextResponse.json({ error: "Reading not found or unauthorized" }, { status: 404 })
    }

    // Delete the reading
    await prisma.bpReading.delete({
      where: {
        id: parseInt(readingId)
      }
    })

    return NextResponse.json({ success: true, message: "Reading deleted successfully" })
  } catch (error) {
    console.error('Error deleting reading:', error)
    return NextResponse.json({ error: "Failed to delete reading" }, { status: 500 })
  }
}
