import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const hashedPassword = await hashPassword('demo123')
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  // Create sample blood pressure readings
  const readings = [
    {
      userId: user.id,
      readingDate: new Date('2024-01-15'),
      readingTime: '08:30:00',
      readingDatetime: new Date('2024-01-15T08:30:00Z'),
      systolic: 118,
      diastolic: 78,
      heartRate: 72,
      category: 'Normal',
    },
    {
      userId: user.id,
      readingDate: new Date('2024-01-15'),
      readingTime: '20:15:00',
      readingDatetime: new Date('2024-01-15T20:15:00Z'),
      systolic: 122,
      diastolic: 82,
      heartRate: 75,
      category: 'Elevated',
    },
    {
      userId: user.id,
      readingDate: new Date('2024-01-16'),
      readingTime: '09:00:00',
      readingDatetime: new Date('2024-01-16T09:00:00Z'),
      systolic: 135,
      diastolic: 85,
      heartRate: 78,
      category: 'Hypertension Stage 1',
    },
    {
      userId: user.id,
      readingDate: new Date('2024-01-16'),
      readingTime: '21:30:00',
      readingDatetime: new Date('2024-01-16T21:30:00Z'),
      systolic: 128,
      diastolic: 79,
      heartRate: 74,
      category: 'Elevated',
    },
    {
      userId: user.id,
      readingDate: new Date('2024-01-17'),
      readingTime: '07:45:00',
      readingDatetime: new Date('2024-01-17T07:45:00Z'),
      systolic: 142,
      diastolic: 92,
      heartRate: 80,
      category: 'Hypertension Stage 2',
    },
    {
      userId: user.id,
      readingDate: new Date('2024-01-17'),
      readingTime: '19:20:00',
      readingDatetime: new Date('2024-01-17T19:20:00Z'),
      systolic: 138,
      diastolic: 88,
      heartRate: 76,
      category: 'Hypertension Stage 1',
    },
    {
      userId: user.id,
      readingDate: new Date('2024-01-18'),
      readingTime: '08:15:00',
      readingDatetime: new Date('2024-01-18T08:15:00Z'),
      systolic: 145,
      diastolic: 95,
      heartRate: 82,
      category: 'Hypertension Stage 2',
    },
  ]

  for (const reading of readings) {
    await prisma.bpReading.upsert({
      where: {
        userId_readingDatetime: {
          userId: reading.userId,
          readingDatetime: reading.readingDatetime,
        },
      },
      update: {},
      create: reading,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
