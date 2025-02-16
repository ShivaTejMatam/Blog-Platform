'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Comments from '../../components/Comments';
import { useRouter } from 'next/navigation';

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
  tags: {
    name: string;
  }[];
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    id: string;
  };
  parentId: string | null;
  replies?: Comment[];
};

export default function BlogPost() {
  const router = useRouter();
  const { id } = useParams(); // Use `useParams` to get the `id`
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Fetching post with id:', id);
    fetchPost();
    fetchComments();
  }, [id]); // Use the unwrapped `id`

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
  
      const res = await fetch(`/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (res.status === 401) {
        console.error('Unauthorized access. Token might be expired.');
        router.push('/auth/login');
        return;
      }
  
      if (!res.ok) {
        console.error('Failed to fetch post:', res.status, res.statusText);
        throw new Error('Failed to fetch post');
      }
  
      const data = await res.json();
      console.log('Fetched post data:', data);
      setPost(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    }
  };
  
  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const res = await fetch(`/api/comments?postId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch comments:', res.status, res.statusText);
        throw new Error('Failed to fetch comments');
      }
      const data = await res.json();
      console.log('Fetched comments data:', data);
      setComments(data);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch notifications:', res.status, res.statusText);
        throw new Error('Failed to fetch notifications');
      }
      const data = await res.json();
      console.log('Fetched notifications data:', data);
      setNotifications(data);
    } catch (err: any){
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !post) {
    return <div className="text-red-500 text-center mt-8">{error || 'Post not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <article className="prose lg:prose-xl">
        <h1>{post.title}</h1>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <span>By {post.author?.name}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        {post.tags?.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag.name} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4">{post.content}</div>
      </article>

      <hr className="my-8" />

      <Comments postId={post.id} initialComments={comments} />
    </div>
  );
}
