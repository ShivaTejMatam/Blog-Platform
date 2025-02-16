const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  const hashedPassword = await bcrypt.hash('test123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      name: 'Tejass',
      email: 'tejass@gmail.com',
      password: hashedPassword,
      bio: 'This is a test user bio'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Anusha',
      email: 'anusha@gmail.com',
      password: hashedPassword,
      bio: 'Another test user bio'
    }
  })

  // Create test posts
  const post1 = await prisma.post.create({
    data: {
      title: 'First Test Post',
      content: 'This is the content of the first test post',
      authorId: user1.id
    }
  })

  const post2 = await prisma.post.create({
    data: {
      title: 'Second Test Post',
      content: 'This is the content of the second test post',
      authorId: user2.id
    }
  })

  // Create test comments
  await prisma.comment.create({
    data: {
      content: 'This is a test comment on the first post',
      authorId: user2.id,
      postId: post1.id
    }
  })

  await prisma.comment.create({
    data: {
      content: 'This is another test comment',
      authorId: user1.id,
      postId: post2.id
    }
  })

  // Create test notifications
  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'comment',
      message: 'Someone commented on your post',
      actorId: user2.id,
      postId: post1.id
    }
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 