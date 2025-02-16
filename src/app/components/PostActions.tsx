'use client'

import Link from 'next/link'

export default function PostActions({ postId }: { postId: string }) {
  async function handleDelete(postId: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      window.location.reload()
    }
  }

  return (
    <div className="flex space-x-2">
      <Link
        href={`/dashboard/edit/${postId}`}
        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
      >
        Edit
      </Link>
      <button
        onClick={() => handleDelete(postId)}
        className="text-red-600 hover:text-red-900 text-sm font-medium"
      >
        Delete
      </button>
    </div>
  )
} 