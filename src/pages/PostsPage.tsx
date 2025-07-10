import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { API } from "../utils/api";
import { Link } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  created_at: string;
  user: { id: number; name: string };
  images: { id: number; image_url: string }[];
  comments: { id: number; comment: string; user: { id: number; name: string } }[];
  likes: { id: number; user_id: number }[];
}

const PostsPage: React.FC = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.POSTS.GET_ALL({ search: searchTerm });
        setPosts(response.data as Post[]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Impossible de charger les articles");
        setLoading(false);
      }
    };
    fetchPosts();
  }, [searchTerm]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark"
            ? "bg-dark-background text-dark-text-secondary"
            : "bg-light-background text-light-text-secondary"
        }`}
      >
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark"
            ? "bg-dark-background text-dark-danger"
            : "bg-light-background text-light-danger"
        }`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header with Search */}
        <header className="mb-12">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
            }`}
          >
            Tous les Articles
          </h1>
          <div className="max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un article..."
              className={`w-full p-3 rounded-lg border ${
                theme === "dark"
                  ? "bg-dark-card text-dark-text-primary border-dark-border"
                  : "bg-light-card text-light-text-primary border-light-border"
              } focus:outline-none focus:ring-2 focus:ring-${
                theme === "dark" ? "dark-primary" : "light-primary"
              } transition duration-200`}
            />
          </div>
        </header>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentPosts.map((post) => (
            <Link
              to={`/posts/${post.slug}`}
              key={post.id}
              className={`block rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
                theme === "dark" ? "bg-dark-card/90" : "bg-light-card"
              } overflow-hidden`}
            >
              {post.images.length > 0 && (
                <img
                  src={API.DEVBASEURL + post.images[0].image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                />
              )}
              <div className="p-4">
                <h2
                  className={`text-xl font-semibold mb-2 ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  {post.title}
                </h2>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                  } mb-4 line-clamp-2`}
                >
                  {post.content.replace(/<\/?p>/g, "").substring(0, 100)}...
                </p>
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                  }`}
                >
                  Par {post.user.name} •{" "}
                  {new Date(post.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentPage === number
                    ? theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary"
                      : "bg-light-primary text-light-text-primary"
                    : theme === "dark"
                    ? "text-dark-text-secondary hover:text-dark-primary"
                    : "text-light-text-secondary hover:text-light-primary"
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;