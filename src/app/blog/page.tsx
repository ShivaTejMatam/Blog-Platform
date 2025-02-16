import { prisma } from '../../lib/prisma'
import PostCard from '../components/PostCard'

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  )
}
