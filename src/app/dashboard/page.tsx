'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title: string
  content: string
  createdAt: string
  published: boolean
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchUserPosts()
  }, [router])

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/posts/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error('Failed to fetch posts')
      
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to delete post')

      // Refresh the posts list
      fetchUserPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="space-x-4">
          <Link 
            href="/tags" 
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Manage Tags
          </Link>
          <Link 
             href="/profile" 
             className="text-gray-600 hover:text-gray-800"
            >
            Profile Settings
            </Link>
          <Link 
            href="/posts/create" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Create New Post
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven't created any posts yet. 
            <Link href="/posts/create" className="text-blue-500 hover:underline ml-2">
              Create your first post
            </Link>
          </p>
        ) : (
          posts.map((post) => (
            <div 
              key={post.id} 
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">
                    {post.content.substring(0, 150)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Link
                    href={`/posts/edit/${post.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-green-500 hover:underline"
                  >
                    View
                  </Link>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  post.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
