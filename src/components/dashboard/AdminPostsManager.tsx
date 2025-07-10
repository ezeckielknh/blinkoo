import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { API } from "../../utils/api";
import ReactQuill, { Value } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { X, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: Value;
  published: boolean;
  created_at: string;
  user?: { id: number; name: string }; // Make user optional
  images: { id: number; image_url: string }[];
  comments: {
    id: number;
    comment: string;
    user: { id: number; name: string };
  }[];
  likes: { id: number; user_id: number }[];
}

const AdminPostsManager: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "" as Value,
    images: [null, null, null] as (File | null)[],
    deleteImages: [] as number[],
  });

  // Fetch posts based on user role
  useEffect(() => {
    const fetchPosts = async () => {
      if (user?.role !== "admin" && user?.role !== "super_admin") return;
      try {
        setLoading(true);
        setError(null);
        const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
        const response = await api.GET_POSTS();
        setPosts(response.data as Post[]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Impossible de charger les articles. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des articles.", {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        });
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user?.role, theme]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    if (index !== undefined && e.target.files) {
      const newImages = [...formData.images];
      newImages[index] = e.target.files[0] || null;
      setFormData({ ...formData, images: newImages });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle Quill content change
  const handleContentChange = (content: Value) => {
    setFormData({ ...formData, content });
  };

  // Handle deleting an existing image
  const handleDeleteImage = (imageId: number, index: number) => {
    const newImages = [...formData.images];
    newImages[index] = null;
    setFormData({
      ...formData,
      images: newImages,
      deleteImages: [...formData.deleteImages, imageId],
    });
  };

  // Open modal for creating/editing post
  const openModal = (post: Post | null = null) => {
    setEditingPost(post);
    setFormData({
      title: post?.title || "",
      content: post?.content || "",
      images: post ? post.images.map(() => null).concat([null, null, null]).slice(0, 3) : [null, null, null],
      deleteImages: [],
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({ title: "", content: "", images: [null, null, null], deleteImages: [] });
  };

  // Submit post (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", JSON.stringify(formData.content));
    formData.images.forEach((image, index) => {
      if (image) {
        form.append(`images[${index}]`, image);
      }
    });
    if (editingPost && formData.deleteImages.length > 0) {
      form.append("delete_images", JSON.stringify(formData.deleteImages));
    }

    try {
      if (editingPost) {
        const response = await api.UPDATE_POST(editingPost.id.toString(), form);
        setPosts(
          posts.map((post) =>
            post.id === editingPost.id ? (response.data as { post: Post }).post : post
          )
        );
        toast.success("Article mis à jour avec succès.", {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        });
      } else {
        const response = await api.CREATE_POST(form);
        setPosts([...posts, (response.data as { post: Post }).post]);
        toast.success("Article créé avec succès.", {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        });
      }
      closeModal();
    } catch (err: any) {
      console.error("Error saving post:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'enregistrement de l'article.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  // Delete post
  const handleDelete = async (postId: number) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    if (!window.confirm("Voulez-vous supprimer cet article ? Cette action est irréversible.")) return;
    const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
    try {
      await api.DELETE_POST(postId.toString());
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success("Article supprimé avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Erreur lors de la suppression de l'article.");
      toast.error("Erreur lors de la suppression de l'article.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (post: Post) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
    try {
      const response = await api.TOGGLE_PUBLISH_POST(post.slug.toString());
      setPosts(posts.map((p) => (p.id === post.id ? (response.data as { post: Post }).post : p)));
      toast.success(`Article ${post.published ? "dépublié" : "publié"} avec succès.`, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    } catch (err: any) {
      console.error("Error toggling publish status:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors du changement de statut de publication.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        Accès réservé aux admins et super-admins.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`text-center py-16 font-sans animate-pulse ${
          theme === "dark"
            ? "text-dark-text-secondary"
            : "text-light-text-secondary"
        }`}
      >
        Chargement...
      </div>
    );
  }

  return (
    <div
      className={`p-6 font-sans ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-2xl font-bold ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Gestion des articles
        </h1>
        <button
          onClick={() => openModal()}
          className={`flex items-center px-4 py-2 rounded-lg font-medium ${
            theme === "dark"
              ? "bg-dark-primary text-dark-text-primary hover:bg-dark-tertiary"
              : "bg-light-primary text-light-text-primary hover:bg-light-tertiary"
          } transition-all animate-pulse hover:animate-none`}
        >
          <Plus size={20} className="mr-2" />
          Nouvel article
        </button>
      </div>

      {error && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            theme === "dark"
              ? "bg-dark-danger/20 text-dark-danger"
              : "bg-light-danger/20 text-dark-danger"
          }`}
        >
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div
          className={`text-center py-8 ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-light-text-secondary"
          }`}
        >
          Aucun article trouvé.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className={`min-w-full ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card"
            } rounded-xl`}
          >
            <thead>
              <tr
                className={`${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                <th className="p-4 text-left">Titre</th>
                <th className="p-4 text-left">Auteur</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-left">Création</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className={`border-t ${
                    theme === "dark" ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <td className="p-4">{post.title}</td>
                  <td className="p-4">{post.user?.name ?? "Inconnu"}</td>
                  <td className="p-4">
                    {post.published ? "Publié" : "Brouillon"}
                  </td>
                  <td className="p-4">
                    {new Date(post.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-secondary hover:bg-dark-card"
                          : "text-light-secondary hover:bg-light-card"
                      } transition-all animate-pulse hover:animate-none`}
                      title={post.published ? "Dépublier" : "Publier"}
                    >
                      {post.published ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(post)}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-secondary hover:bg-dark-card"
                          : "text-light-secondary hover:bg-light-card"
                      } transition-all animate-pulse hover:animate-none`}
                      title="Modifier"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-danger hover:bg-dark-card"
                          : "text-light-danger hover:bg-light-card"
                      } transition-all animate-pulse hover:animate-none`}
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for creating/editing post */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`w-full max-w-2xl p-6 rounded-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card"
            } shadow-lg animate-slide-up`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-xl font-bold ${
                  theme === "dark"
                    ? "text-dark-text-primary"
                    : "text-light-text-primary"
                }`}
              >
                {editingPost ? "Modifier l'article" : "Créer un article"}
              </h2>
              <button
                onClick={closeModal}
                className={`p-2 ${
                  theme === "dark"
                    ? "text-dark-secondary"
                    : "text-light-secondary"
                }`}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className={`block mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Titre
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-lg ${
                    theme === "dark"
                      ? "bg-dark-background text-dark-text-primary border-gray-800"
                      : "bg-light-background text-light-text-primary border-gray-200"
                  } border font-sans`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className={`block mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Contenu
                </label>
                <ReactQuill
                  value={formData.content}
                  onChange={handleContentChange}
                  theme="snow"
                  className={`${
                    theme === "dark"
                      ? "bg-dark-background text-dark-text-primary"
                      : "bg-light-background text-light-text-primary"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label
                  className={`block mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Images (jusqu'à 3 fichiers)
                </label>
                {editingPost && editingPost.images.length > 0 && (
                  <div className="mb-4">
                    <label
                      className={`block mb-2 ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    >
                      Images existantes
                    </label>
                    {editingPost.images.map((image, index) => (
                      !formData.deleteImages.includes(image.id) && (
                        <div key={image.id} className="flex items-center mb-2">
                          <img
                            src={image.image_url}
                            alt={`Image ${index + 1}`}
                            className="w-24 h-24 object-cover mr-2 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id, index)}
                            className={`p-2 rounded-lg ${
                              theme === "dark"
                                ? "text-dark-danger hover:bg-dark-card"
                                : "text-light-danger hover:bg-light-card"
                            }`}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleInputChange(e, index)}
                      className={`w-full p-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-dark-background text-dark-text-primary border-gray-800"
                          : "bg-light-background text-light-text-primary border-gray-200"
                      } border font-sans`}
                    />
                    {image && (
                      <span
                        className={`ml-2 text-sm truncate max-w-xs ${
                          theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-light-text-secondary"
                        }`}
                      >
                        {image.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg font-sans ${
                    theme === "dark"
                      ? "text-dark-text-secondary hover:bg-dark-card"
                      : "text-light-text-secondary hover:bg-light-card"
                  } transition-all`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-sans ${
                    theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary hover:bg-dark-tertiary"
                      : "bg-light-primary text-light-text-primary hover:bg-light-tertiary"
                  } transition-all animate-pulse hover:animate-none`}
                >
                  {editingPost ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPostsManager;