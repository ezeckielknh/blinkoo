import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";
import { Heart, MessageSquare } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  created_at: string;
  user: { id: number; name: string };
  images: { id: number; image_url: string }[];
  comments: {
    id: number;
    comment: string;
    user: { id: number; name: string };
    created_at: string;
    updated_at: string;
  }[];
  likes: { id: number; user_id: number }[];
}

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLikeModal, setShowLikeModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          setError("Aucun article spécifié");
          setLoading(false);
          return;
        }
        const response = await API.POSTS.GET_ONE(slug);
        const postData = response.data as Post;
        postData.content = cleanContent(postData.content);
        setPost(postData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Impossible de charger l'article");
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const cleanContent = (content: string): string => {
    try {
      // Attempt to parse as JSON to unescape, if it's a stringified object
      return JSON.parse(`"${content.replace(/\\"/g, '"')}"`)
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/^"(.*)"$/, "$1");
    } catch (e) {
      // If not JSON, remove backslashes and extra quotes manually
      return content.replace(/\\"/g, '"').replace(/\\/g, "").trim();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;

    try {
      await API.POSTS.CREATE_COMMENT(post.slug, { comment: commentText });
      setCommentText("");
      setShowCommentModal(false);
      const response = await API.POSTS.GET_ONE(slug ? slug : "");
      setPost(response.data as Post);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleToggleLike = async () => {
    if (!post) return;

    try {
      await API.POSTS.TOGGLE_LIKE(post.slug);
      setShowLikeModal(false);
      const response = await API.POSTS.GET_ONE(slug ? slug : "");
      setPost(response.data as Post);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

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

  if (error || !post) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark"
            ? "bg-dark-background text-dark-danger"
            : "bg-light-background text-light-danger"
        }`}
      >
        {error || "Article non trouvé"}
      </div>
    );
  }

  // Inside the component, define liked variable
  const userData = localStorage.getItem("bliic_user");
  const userId = userData ? JSON.parse(userData).id : null;
  const liked = userId
    ? post.likes.some((like) => like.user_id === parseInt(userId))
    : false;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-dark-background text-dark-text-primary"
          : "bg-light-background text-light-text-primary"
      }`}
    >
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb Menu */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                to="/posts"
                className={`hover:underline ${
                  theme === "dark"
                    ? "text-dark-text-secondary hover:text-dark-primary"
                    : "text-light-text-secondary hover:text-light-primary"
                }`}
              >
                Blogs
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <span
                className={`font-medium ${
                  theme === "dark"
                    ? "text-dark-text-primary"
                    : "text-light-text-primary"
                }`}
              >
                {post.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <h1
            className={`text-4xl md:text-5xl font-bold leading-tight ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            {post.title}
          </h1>
          <div
            className={`mt-4 text-sm ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            Par {post.user.name} •{" "}
            {new Date(post.created_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Image Gallery */}
        {post.images.length > 0 && (
          <div className="mb-12">
            <div
              className={`grid gap-4 ${
                post.images.length === 1
                  ? "grid-cols-1"
                  : post.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {post.images.map((image) => (
                <img
                  key={image.id}
                  src={API.DEVBASEURL + image.image_url}
                  alt={`${post.title} - Image ${image.id}`}
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  onError={(e) =>
                    (e.currentTarget.src = "/placeholder-image.jpg")
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <article
          className={`prose prose-lg max-w-none ${
            theme === "dark" ? "prose-invert" : ""
          }`}
        >
          <div
            className={`p-6 bg-${
              theme === "dark" ? "dark-card/90" : "light-card"
            } rounded-lg shadow-md`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Action Buttons */}
        {localStorage.getItem("bliic_token") && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setShowCommentModal(true)}
              className={`p-2 rounded-full focus:outline-none transition-colors duration-200 ${
                theme === "dark"
                  ? "text-dark-text-secondary hover:text-dark-primary"
                  : "text-light-text-secondary hover:text-light-primary"
              }`}
              aria-label="Ajouter un commentaire"
            >
              <MessageSquare size={24} />
            </button>
            <button
              onClick={() => setShowLikeModal(true)}
              className={`p-2 rounded-full focus:outline-none transition-colors duration-200 ${
                theme === "dark"
                  ? "text-dark-text-secondary hover:text-dark-primary"
                  : "text-light-text-secondary hover:text-light-primary"
              }`}
              aria-label="Like ou Unlike"
            >
              <Heart
                size={24}
                fill={
                  liked ? (theme === "dark" ? "#eab308" : "#7c3aed") : "none"
                }
                color={theme === "dark" ? "#ffffff" : "#000000"} // Adjust icon color based on theme
              />
            </button>
          </div>
        )}

        {/* Comments Section */}
        {post.comments.length > 0 && (
          <section className="mt-12">
            <h2
              className={`text-2xl font-semibold mb-6 ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
            >
              Commentaires
            </h2>
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg shadow-md ${
                    theme === "dark" ? "bg-dark-card/90" : "bg-light-card"
                  }`}
                >
                  <div
                    className={`flex justify-between items-center ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } text-sm mb-2`}
                  >
                    <span>{comment.user.name}</span>
                    <span>
                      {new Date(comment.created_at).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <p
                    className={`${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    }`}
                  >
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sticky Footer for Stats */}
        <footer
          className={`mt-12 p-4 ${
            theme === "dark"
              ? "bg-dark-card/90 text-dark-text-secondary"
              : "bg-light-card text-light-text-secondary"
          } rounded-lg shadow-md sticky bottom-4`}
        >
          <div className="flex justify-between items-center">
            <span>
              {post.comments.length}{" "}
              {post.comments.length === 1 ? "Commentaire" : "Commentaires"}
            </span>
            <span>
              {post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}
            </span>
          </div>
        </footer>

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`w-full max-w-md p-6 rounded-lg ${
                theme === "dark"
                  ? "bg-dark-card/90 text-dark-text-primary"
                  : "bg-light-card text-light-text-primary"
              } shadow-lg`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ajouter un commentaire</h2>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`w-full p-3 mb-4 rounded-lg ${
                    theme === "dark"
                      ? "bg-dark-background text-dark-text-primary"
                      : "bg-light-background text-light-text-primary"
                  } border border-gray-300`}
                  placeholder="Écrivez votre commentaire..."
                  rows={4}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary hover:bg-dark-tertiary"
                      : "bg-light-primary text-light-text-primary hover:bg-light-tertiary"
                  }`}
                >
                  Soumettre
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Like Modal */}
        {showLikeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`w-full max-w-md p-6 rounded-lg ${
                theme === "dark"
                  ? "bg-dark-card/90 text-dark-text-primary"
                  : "bg-light-card text-light-text-primary"
              } shadow-lg`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Confirmer l'action</h2>
                <button
                  onClick={() => setShowLikeModal(false)}
                  className="text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="mb-4">
                Voulez-vous{" "}
                {post.likes.some(
                  (like) =>
                    like.user_id ===
                    parseInt(localStorage.getItem("userId") || "0")
                )
                  ? "supprimer votre like"
                  : "ajouter un like"}{" "}
                ?
              </p>
              <button
                onClick={handleToggleLike}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  theme === "dark"
                    ? "bg-dark-primary text-dark-text-primary hover:bg-dark-tertiary"
                    : "bg-light-primary text-light-text-primary hover:bg-light-tertiary"
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
