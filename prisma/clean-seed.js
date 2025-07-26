const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Delete all existing readings
  await prisma.bpReading.deleteMany({})
  console.log('Deleted all blood pressure readings')

  // Create a demo user for testing
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  })

  console.log('✅ Clean database ready! Demo user:', user.email)
  console.log('📊 Ready to start adding your blood pressure readings!')
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
