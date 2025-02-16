import Link from 'next/link'
import { format } from 'date-fns'

interface PostCardProps {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    name: string | null
  }
}

export default function PostCard({ id, title, content, createdAt, author }: PostCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Link href={`/blog/${id}`}>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
      </Link>
      <p className="text-gray-600 mb-4">{content.substring(0, 150)}...</p>
      <div className="text-sm text-gray-500">
        <span>{author.name || 'Anonymous'}</span>
        <span className="mx-2">•</span>
        <span>{format(new Date(createdAt), 'MMM d, yyyy')}</span>
      </div>
    </div>
  )
}
