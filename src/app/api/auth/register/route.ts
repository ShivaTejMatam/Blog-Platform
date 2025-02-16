import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hashPassword, generateToken } from '../../../../lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    const token = generateToken(user.id)
    
    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}
