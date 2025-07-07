import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { API } from "../../utils/api";
import { File, Search, Filter, Info, Trash2, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";

interface User {
  id: string;
  name: string;
  email: string;
}

interface SharedFile {
  id: string;
  originalName: string;
  storedName: string;
  shortCode: string;
  customAlias: string | null;
  filePassword: string | null;
  user: User;
  downloads: number;
  createdAt: string;
  expiresAt?: string;
  type: "pdf" | "image" | "video" | "document" | "other";
}

// Utility to derive file type from extension
const getFileType = (fileName: string): "pdf" | "image" | "video" | "document" | "other" => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "pdf";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return "image";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return "video";
    case "doc":
    case "docx":
    case "xls":
    case "xlsx":
    case "ppt":
    case "pptx":
      return "document";
    default:
      return "other";
  }
};

const AdminFileManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    userId: "all",
    type: "all",
    dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  });
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [modalType, setModalType] = useState<"details" | "delete" | "extend" | "reset" | null>(null);
  const [extendDays, setExtendDays] = useState<number>(7);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  // Debounced fetch files
  const debouncedFetchFiles = useCallback(
    debounce(async () => {
      if (user?.role !== "admin" && user?.role !== "super_admin") return;
      try {
        setLoading(true);
        setError(null);
        const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
        const response = await api.GET_FILES();
        const filesData = response.data as any[];
        const transformedFiles = filesData.map((file: any) => ({
          id: file.id,
          originalName: file.original_name,
          storedName: file.storage_path.split("/").pop() || file.storage_path,
          shortCode: file.short_code,
          customAlias: file.custom_alias || null,
          filePassword: file.file_password || null,
          type: getFileType(file.original_name),
          user: file.user
            ? {
                id: file.user.id.toString(),
                name: file.user.name,
                email: file.user.email,
              }
            : {
                id: "",
                name: "Utilisateur inconnu",
                email: "",
              },
          downloads: file.download_count || 0,
          createdAt: file.created_at,
          expiresAt: file.expires_at || undefined,
        }));
        setFiles(transformedFiles);
      } catch (err) {
        console.error("Error fetching files:", err);
        setError("Impossible de charger les fichiers. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des fichiers.", {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        });
      } finally {
        setLoading(false);
      }
    }, 500),
    [user?.role, theme]
  );

  useEffect(() => {
    debouncedFetchFiles();
    return () => debouncedFetchFiles.cancel();
  }, [debouncedFetchFiles]);

  // Extract unique users for filter dropdown
  const users = useMemo(() => {
    const uniqueUsers = Array.from(
      new Map(files.map((file) => [file.user.id, file.user])).values()
    );
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
  }, [files]);

  // Filter and search logic (frontend-only)
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch =
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.customAlias && file.customAlias.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesUser = filters.userId === "all" || file.user.id === filters.userId;
      const matchesType = filters.type === "all" || file.type === filters.type;
      const fileDate = new Date(file.createdAt);
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
      const matchesDate = (!dateFrom || fileDate >= dateFrom) && (!dateTo || fileDate <= dateTo);

      return matchesSearch && matchesUser && matchesType && matchesDate;
    });
  }, [files, searchTerm, filters]);

  // Handle admin actions
  const handleViewDetails = async (fileId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.GET_FILE(fileId);
      const fileData = response.data as any;
      const transformedFile: SharedFile = {
        id: fileData.id,
        originalName: fileData.original_name,
        storedName: fileData.storage_path.split("/").pop() || fileData.storage_path,
        shortCode: fileData.short_code,
        customAlias: fileData.custom_alias || null,
        filePassword: fileData.file_password || null,
        type: getFileType(fileData.original_name),
        user: fileData.user
          ? {
              id: fileData.user.id.toString(),
              name: fileData.user.name,
              email: fileData.user.email,
            }
          : {
              id: "",
              name: "Utilisateur inconnu",
              email: "",
            },
        downloads: fileData.download_count || 0,
        createdAt: fileData.created_at,
        expiresAt: fileData.expires_at || undefined,
      };
      setSelectedFile(transformedFile);
      setModalType("details");
    } catch (err) {
      console.error("Error fetching file details:", err);
      toast.error("Erreur lors du chargement des détails du fichier.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.DELETE_FILE(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      toast.success("Fichier supprimé avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Erreur lors de la suppression du fichier.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleExtendFile = async (fileId: string, days: number | null) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.EXTEND_FILE(fileId, days ? { days } : {});
      const data = response.data as { expires_at?: string };
      const newExpiresAt = data.expires_at || undefined;
      setFiles(
        files.map((f) =>
          f.id === fileId ? { ...f, expiresAt: newExpiresAt } : f
        )
      );
      toast.success(
        newExpiresAt
          ? `Expiration prolongée à ${format(new Date(newExpiresAt), "dd/MM/yyyy HH:mm")}`
          : "Expiration supprimée.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        }
      );
      setModalType(null);
    } catch (err) {
      console.error("Error extending file:", err);
      toast.error("Erreur lors de la mise à jour de l'expiration.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleResetDownloads = async (fileId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.RESET_FILE_DOWNLOADS(fileId);
      setFiles(
        files.map((f) =>
          f.id === fileId ? { ...f, downloads: 0 } : f
        )
      );
      toast.success("Compteur de téléchargements remis à zéro.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error resetting downloads:", err);
      toast.error("Erreur lors de la réinitialisation des téléchargements.", {
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
        className={`flex justify-center items-center h-screen font-sans animate-pulse ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col justify-center items-center h-screen font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        <p>{error}</p>
        <button
          onClick={() => debouncedFetchFiles()}
          className={`mt-4 px-4 py-2 rounded-lg font-sans ${
            theme === "dark"
              ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
              : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
          } transition-all animate-pulse hover:animate-none`}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <ToastContainer />
      <h1
        className={`text-2xl font-bold tracking-tight font-sans ${
          theme === "dark" ? "text-dark-primary" : "text-light-primary"
        }`}
      >
        Gestion des fichiers partagés
      </h1>

      {/* Search and Filters */}
      <div
        className={`p-4 sm:p-6 rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search
                size={20}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                }`}
              />
              <input
                type="text"
                placeholder="Rechercher par nom de fichier, nom, email, code ou alias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
              />
            </div>
          </div>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full sm:w-auto">
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                theme === "light" ? "focus:ring-light-primary" : ""
              }`}
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                theme === "light" ? "focus:ring-light-primary" : ""
              }`}
            >
              <option value="all">Tous les types</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="document">Document</option>
              <option value="other">Autre</option>
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                theme === "light" ? "focus:ring-light-primary" : ""
              }`}
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                theme === "light" ? "focus:ring-light-primary" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div
        className={`rounded-xl overflow-hidden border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-primary/20">
            <thead>
              <tr
                className={`${
                  theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
                }`}
              >
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Nom du fichier
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Type
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Créateur
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Téléchargements
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Création
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Expiration
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-primary/20">
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className={`${
                    theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                  } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                    theme === "light" ? "hover:bg-light-primary/10" : ""
                  }`}
                >
                  <td
                    className={`px-6 py-4 max-w-xs truncate font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    <span title={file.originalName}>{file.originalName}</span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {file.user.name} ({file.user.email})
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {file.downloads}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {format(new Date(file.createdAt), "dd/MM/yyyy")}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {file.expiresAt ? format(new Date(file.expiresAt), "dd/MM/yyyy") : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(file.id)}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Détails"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setModalType("delete");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-danger hover:bg-dark-danger/20"
                            : "text-light-danger hover:bg-light-danger/20"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setModalType("extend");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title={file.expiresAt ? "Prolonger expiration" : "Définir expiration"}
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setModalType("reset");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Réinitialiser téléchargements"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 p-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`rounded-lg border border-dark-primary/30 p-4 ${
                theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
              } shadow animate-slide-up`}
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedFileId(expandedFileId === file.id ? null : file.id)}
              >
                <div>
                  <p
                    className={`font-medium font-sans text-sm truncate max-w-[200px] ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                    title={file.originalName}
                  >
                    {file.originalName}
                  </p>
                  <p
                    className={`text-xs font-sans ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                  </p>
                </div>
                {expandedFileId === file.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedFileId === file.id && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Créateur:
                    </span>
                    <span
                      className={`font-sans truncate max-w-[150px] ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                      title={`${file.user.name} (${file.user.email})`}
                    >
                      {file.user.name} ({file.user.email})
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Téléchargements:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {file.downloads}
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Création:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {format(new Date(file.createdAt), "dd/MM/yyyy")}
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Expiration:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {file.expiresAt ? format(new Date(file.expiresAt), "dd/MM/yyyy") : "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(file.id)}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                      title="Détails"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setModalType("delete");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-danger hover:bg-dark-danger/20"
                          : "text-light-danger hover:bg-light-danger/20"
                        } transition-all animate-pulse hover:animate-none`}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setModalType("extend");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                      title={file.expiresAt ? "Prolonger expiration" : "Définir expiration"}
                    >
                      <Clock size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setModalType("reset");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                      title="Réinitialiser téléchargements"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modalType && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`p-4 sm:p-6 rounded-xl w-11/12 max-w-md border border-dark-primary/50 ${
              theme === "dark" ? "bg-dark-card text-dark-text-primary" : "bg-light-card text-light-text-primary"
            } shadow-lg transform transition-all duration-300 animate-slide-up`}
          >
            {modalType === "details" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Détails du fichier
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Nom original</label>
                    <p className="text-sm font-sans" title={selectedFile.originalName}>
                      {selectedFile.originalName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Nom stocké</label>
                    <p className="text-sm font-sans" title={selectedFile.storedName}>
                      {selectedFile.storedName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Type</label>
                    <p className="text-sm font-sans">
                      {selectedFile.type.charAt(0).toUpperCase() + selectedFile.type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Code court</label>
                    <p className="text-sm font-sans">{selectedFile.shortCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Alias personnalisé</label>
                    <p className="text-sm font-sans">{selectedFile.customAlias || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Protégé par mot de passe</label>
                    <p className="text-sm font-sans">{selectedFile.filePassword ? "Oui" : "Non"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Créateur</label>
                    <p className="text-sm font-sans">
                      {selectedFile.user.name} ({selectedFile.user.email})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Téléchargements</label>
                    <p className="text-sm font-sans">{selectedFile.downloads}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Date de création</label>
                    <p className="text-sm font-sans">
                      {format(new Date(selectedFile.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Expiration</label>
                    <p className="text-sm font-sans">
                      {selectedFile.expiresAt
                        ? format(new Date(selectedFile.expiresAt), "dd/MM/yyyy HH:mm")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setModalType(null)}
                      className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                          : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === "delete" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Supprimer le fichier
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous supprimer le fichier {selectedFile.originalName} ? Cette action est irréversible.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setModalType(null)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                        : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteFile(selectedFile.id)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-danger text-dark-text-primary hover:bg-dark-danger/80"
                        : "bg-light-danger text-light-text-primary hover:bg-light-danger/80"
                      } transition-all animate-pulse hover:animate-none`}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            {modalType === "extend" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  {selectedFile.expiresAt ? "Prolonger" : "Définir"} expiration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Prolonger de (jours)</label>
                    <input
                      type="number"
                      value={extendDays}
                      onChange={(e) => setExtendDays(Number(e.target.value))}
                      min="1"
                      className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setModalType(null)}
                      className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                          : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                    >
                      Annuler
                    </button>
                    {selectedFile.expiresAt && (
                      <button
                        onClick={() => handleExtendFile(selectedFile.id, null)}
                        className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                          theme === "dark"
                            ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                            : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                        } transition-all`}
                      >
                        Supprimer expiration
                      </button>
                    )}
                    <button
                      onClick={() => handleExtendFile(selectedFile.id, extendDays)}
                      className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                          : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                      } transition-all animate-pulse hover:animate-none`}
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === "reset" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Réinitialiser les téléchargements
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous réinitialiser le compteur de téléchargements pour {selectedFile.originalName} ? Le compteur sera remis à zéro.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setModalType(null)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                        : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleResetDownloads(selectedFile.id)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                        : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                      } transition-all animate-pulse hover:animate-none`}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFileManager;