'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Blog Platform</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/blog"
              className={`px-3 py-2 rounded-md ${
                pathname === '/blog' ? 'bg-gray-100' : ''
              }`}
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md ${
                pathname === '/dashboard' ? 'bg-gray-100' : ''
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
