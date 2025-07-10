import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { Value } from 'react-quill';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: Value; // Use Value from react-quill to handle both string and object
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
        // Parse content if it's a JSON string
        const parsedPosts = (response.data as Post[]).map(post => ({
          ...post,
          content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
        }));
        setPosts(parsedPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError('Impossible de charger les articles.');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Extract plain text from Quill Delta JSON for preview
  const getPostExcerpt = (content: Value, maxLength: number = 100): string => {
    try {
      let text = '';
      if (typeof content === 'string') {
        // If content is still a string (in case parsing failed elsewhere)
        text = JSON.parse(content).ops?.map((op: { insert: string }) => op.insert).join('').trim() || '';
      } else {
        // Content is already a Delta object
        (op: { insert?: string }) => op.insert
      }
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    } catch (err) {
      console.error("Error parsing content:", err);
      return 'Contenu non disponible';
    }
  };

  return (
    <section className={`py-16 ${theme === 'dark' ? 'bg-dark-background' : 'bg-light-background'}`}>
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold text-center mb-12 ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          Derniers articles
        </h2>

        {loading && (
          <div className="text-center">
            <p className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              Chargement des articles...
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
              Aucun article disponible.
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
                {post.images.length > 0 && (
                  <img
                    src={post.images[0].image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
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
                      Par {post.user.name} • {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                    }`}>
                      {post.comments.length} {post.comments.length === 1 ? 'Commentaire' : 'Commentaires'} •{' '}
                      {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                    </span>
                  </div>
                  <Link
                    to={`/posts/${post.id}`}
                    className={`inline-block px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-dark-primary text-dark-text-primary hover:bg-dark-tertiary'
                        : 'bg-light-primary text-light-text-primary hover:bg-light-tertiary'
                    }`}
                  >
                    Lire la suite
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