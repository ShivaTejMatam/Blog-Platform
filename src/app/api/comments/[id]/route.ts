import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/auth'

export async function PUT(
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

    const { content } = await request.json()

    // Verify the comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: {
        id: params.id,
        authorId: decoded.userId
      }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: {
        id: params.id
      },
      data: {
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // First verify the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: {
        id: params.id,
        authorId: decoded.userId
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the comment
    await prisma.comment.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
