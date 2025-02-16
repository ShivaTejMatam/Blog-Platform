import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Blog Platform
        </h1>
        <p className="text-xl mb-8">
          Share your thoughts with the world
        </p>
        <div className="space-x-4">
          <Link 
            href="/auth/register" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Sign Up
          </Link>
          <Link 
            href="/auth/login" 
            className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Login
          </Link>
          <Link 
            href="/blog" 
            className="inline-block bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
          >
            Read Blog Posts
          </Link>
        </div>
      </div>
    </main>
  )
}
