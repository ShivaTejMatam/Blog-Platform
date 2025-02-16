'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Tag = {
  id: string
  name: string
  _count?: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tags', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error('Failed to fetch tags')
      
      const data = await res.json()
      setTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTagName })
      })

      if (!res.ok) throw new Error('Failed to create tag')

      setNewTagName('')
      fetchTags()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to delete tag')

      fetchTags()
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tags</h1>
        <Link 
          href="/dashboard"
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleCreateTag} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter new tag name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Tag
          </button>
        </div>
        {error && (
          <p className="mt-2 text-red-500">{error}</p>
        )}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div 
            key={tag.id}
            className="p-4 border rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{tag.name}</h3>
                <p className="text-sm text-gray-500">
                  {tag._count?.posts || 0} posts
                </p>
              </div>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
