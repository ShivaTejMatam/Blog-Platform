import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyToken } from '../../../../../lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Prevent self-following
    if (decoded.userId === params.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        following: {
          some: {
            id: params.id
          }
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          following: {
            disconnect: { id: params.id }
          }
        }
      })

      return NextResponse.json({ following: false })
    }

    // Follow user and create notification
    await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.userId },
        data: {
          following: {
            connect: { id: params.id }
          }
        }
      }),
      prisma.notification.create({
        data: {
          userId: params.id,
          type: 'follow',
          message: 'started following you',
          actorId: decoded.userId
        }
      })
    ])

    return NextResponse.json({ following: true })
  } catch (error) {
    console.error('Follow user error:', error)
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const following = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        following: {
          some: {
            id: params.id
          }
        }
      }
    })

    return NextResponse.json({ following: !!following })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    )
  }
} 