'use client'

import { useState } from 'react'

type Comment = {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    id: string
  }
  parentId: string | null
  replies?: Comment[]
}

type CommentsProps = {
  postId: string
  initialComments: Comment[]
}

export default function Comments({ postId, initialComments }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.filter(c => !c.parentId) // Only root comments
  )
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Group replies with their parent comments
  const commentTree = comments.map(comment => ({
    ...comment,
    replies: initialComments.filter(c => c.parentId === comment.id)
  }))

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const content = parentId ? replyContent : newComment

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to comment')
        return
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          postId,
          parentId
        })
      })

      if (!res.ok) throw new Error('Failed to post comment')

      const newComment = await res.json()
      
      if (parentId) {
        // Add reply to the comments list
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), newComment] }
            : comment
        ))
        setReplyingTo(null)
        setReplyContent('')
      } else {
        // Add new root comment
        setComments(prev => [newComment, ...prev])
        setNewComment('')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      setEditingId(null)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to edit comments')
        return
      }

      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      })

      if (!res.ok) throw new Error('Failed to update comment')

      const updatedComment = await res.json()
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ))
      setEditingId(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setDeletingId(commentId)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to delete comments')
        return
      }

      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to delete comment')

      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditContent('')
  }

  // Function to check if the current user is the author of a comment
  const isCommentAuthor = (authorId: string) => {
    // You might want to store the user's ID in localStorage or context
    const userId = localStorage.getItem('userId')
    return userId === authorId
  }

  const CommentComponent = ({ comment, level = 0 }: { comment: Comment, level?: number }) => (
    <div className={`${level > 0 ? 'ml-8 border-l pl-4' : ''}`}>
      <div className="border-b pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="font-medium">{comment.author.name}</p>
            {editingId === comment.id ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{comment.content}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="space-x-2">
            {isCommentAuthor(comment.author.id) && !editingId && (
              <>
                <button
                  onClick={() => startEditing(comment)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
            {level < 2 && ( // Limit reply depth to 2 levels
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Reply
              </button>
            )}
          </div>
        </div>

        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
              required
            />
            <div className="mt-2 space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => (
              <CommentComponent key={reply.id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      
      <form onSubmit={(e) => handleSubmit(e)} className="mb-6">
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={3}
            required
          />
        </div>
        {error && (
          <p className="text-red-500 mb-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-6">
        {commentTree.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          commentTree.map(comment => (
            <CommentComponent key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  )
}