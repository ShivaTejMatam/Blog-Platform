import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'

export async function POST(request: Request) {
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

    const body = await request.json()
    const { content, postId, parentId } = body

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Content and Post ID are required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: decoded.userId } },
        post: { connect: { id: postId } },
        parentId: parentId || null,  // Add support for replies
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        replies: {  // Include replies
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        // Only fetch root comments (those without a parent)
        parentId: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        replies: {  // Include replies
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            },
            replies: {  // Include nested replies (up to 2 levels)
              include: {
                author: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
