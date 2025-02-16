import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { verifyToken } from '../../../lib/auth'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        published: true
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const json = await request.json()
    const post = await prisma.post.create({
      data: {
        title: json.title,
        content: json.content,
        published: json.published || false,
        authorId: decoded.userId, // Use the authenticated user's ID
        tags: {
          connect: json.tagIds?.map((id: string) => ({ id })) || []
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
