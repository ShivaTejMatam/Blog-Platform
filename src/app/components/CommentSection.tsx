'use client'

import { useState } from 'react'
import { format } from 'date-fns'

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string | null
  }
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, comment])
        setNewComment('')
      } else {
        const error = await response.json()
        setError(error.message)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium">Comments</h3>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          placeholder="Leave a comment..."
          required
        />
        
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        
        <button
          type="submit"
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post Comment
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {comment.author.name || 'Anonymous'}
              </span>
              <span className="text-sm text-gray-500">
                {format(new Date(comment.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
