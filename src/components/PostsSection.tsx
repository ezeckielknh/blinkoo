import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {API} from '../utils/api'; // Import API configuration
import { useTheme } from '../contexts/ThemeContext';

// Define Post type (same as before, for reference)
interface Post {
  id: number;
  title: string;
  slug: string;
  content: { ops: { insert: string }[] };
  published: boolean;
  created_at: string;
  user: { id: number; name: string };
  images: { id: number; image_url: string }[];
  comments: { id: number; comment: string; user: { id: number; name: string } }[];
  likes: { id: number; user_id: number }[];
}

const PostsSection: React.FC = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the 3 latest posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.POSTS.GET_ALL({ limit: 3, sort: 'created_at,desc' });
        setPosts(response.data as Post[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load posts');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Extract plain text from Quill Delta JSON for preview
  const getPostExcerpt = (content: { ops: { insert: string }[] }, maxLength: number = 100): string => {
    const text = content.ops.map(op => op.insert).join('').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <section className={`py-16 ${theme === 'dark' ? 'bg-dark-background' : 'bg-light-background'}`}>
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold text-center mb-12 ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          Latest Blog Posts
        </h2>

        {loading && (
          <div className="text-center">
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Loading posts...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className={`${theme === 'dark' ? 'text-dark-danger' : 'text-light-danger'}`}>
              {error}
            </p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center">
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              No posts available.
            </p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div
                key={post.id}
                className={`${
                  theme === 'dark' ? 'bg-dark-card/90' : 'bg-light-card'
                } rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl animate-slide-up`}
              >
                {/* Post Image (show first image if available) */}
                {post.images.length > 0 && (
                  <img
                    src={post.images[0].image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')} // Fallback image
                  />
                )}

                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    {post.title}
                  </h3>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    {getPostExcerpt(post.content)}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                    }`}>
                      By {post.user.name} • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                    }`}>
                      {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'} •{' '}
                      {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                    </span>
                  </div>
                  <Link
                    to={`/posts/${post.slug}`}
                    className={`inline-block px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-dark-primary text-dark-text-primary hover:bg-dark-tertiary'
                        : 'bg-light-primary text-light-text-primary hover:bg-light-tertiary'
                    }`}
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PostsSection;