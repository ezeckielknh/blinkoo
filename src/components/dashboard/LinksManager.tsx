import { useState, useEffect, useMemo } from "react";
import {
  Link2,
  Copy,
  ExternalLink,
  Trash2,
  Edit2,
  BarChart2,
  X,
  ChevronDown,
  ChevronRight,
  Download,
  Type,
  Hash,
} from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import axios from "axios";
import { API } from "../../utils/api";
import { Link } from "react-router-dom";

interface ShortLink {
  id: string;
  title: string | null;
  original_url: string;
  short_code: string;
  short_link: string;
  click_count: number;
  is_active: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const LinksManager = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShortLink | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCode, setNewCode] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);

  const fetchLinks = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get<{ links: ShortLink[] }>(
        API.SHORT_LINKS.GET_ALL,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setLinks(response.data.links || []);
      setCurrentPage(1);
    } catch {
      addToast("Impossible de charger vos liens", "error");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLinks();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return addToast("Veuillez entrer une URL", "error");

    setLoading(true);
    try {
      const endpoint = user
        ? API.SHORT_LINKS.CREATE_AUTH
        : API.SHORT_LINKS.CREATE;
      const payload = {
        original_url: url,
        title: title || null,
        code: newCode || undefined,
        email: user ? undefined : prompt("Entrez votre email"),
      };
      const headers = user
        ? { Authorization: `Bearer ${user.token}` }
        : undefined;
      await axios.post(endpoint, payload, { headers });
      addToast("Lien créé avec succès !", "success");
      setUrl("");
      setTitle("");
      setNewCode("");
      await fetchLinks();
    } catch (err: any) {
      addToast(
        err.response?.data?.error || "Une erreur est survenue.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (link: ShortLink) => {
    setSelectedLink(link);
    setNewTitle(link.title || "");
    setNewUrl(link.original_url);
    setNewCode(link.short_code);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedLink) return;
    setLoading(true);
    try {
      await axios.put(
        `${API.SHORT_LINKS.UPDATE}/${selectedLink.id}`,
        {
          code: newCode,
          original_url: newUrl,
          title: newTitle || null,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      addToast("Lien modifié avec succès", "success");
      setEditModalOpen(false);
      setSelectedLink(null);
      await fetchLinks();
    } catch (err: any) {
      addToast(
        err.response?.data?.error || "Erreur lors de la mise à jour",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (link: ShortLink) => {
    setSelectedLink(link);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLink) return;
    setLoading(true);
    try {
      await axios.delete(
        `${API.SHORT_LINKS.DELETE}/${selectedLink.short_code}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      addToast("Lien supprimé avec succès", "success");
      setDeleteModalOpen(false);
      setSelectedLink(null);
      await fetchLinks();
    } catch (err: any) {
      addToast(
        err.response?.data?.error || "Erreur lors de la suppression du lien",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (linkId: string) => {
    setExpandedLinkId(expandedLinkId === linkId ? null : linkId);
  };

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && link.is_active) ||
        (statusFilter === "inactive" && !link.is_active);
      const matchesSearch =
        !searchQuery ||
        (link.title || "Sans titre")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [links, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLinks.length / ITEMS_PER_PAGE);
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedLinkId(null);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    setExpandedLinkId(null);
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = [
        "ID",
        "Title",
        "Original URL",
        "Short Code",
        "Short Link",
        "Click Count",
        "Status",
        "Created At",
      ];
      const csvRows = [
        headers.map((header: string) => `"${header}"`).join(","),
        ...filteredLinks.map((link) =>
          [
            link.id,
            `"${String(link.title || "Sans titre").replace(/"/g, '""')}"`,
            `"${String(link.original_url).replace(/"/g, '""')}"`,
            link.short_code,
            link.short_link,
            link.click_count,
            link.is_active ? "Active" : "Inactive",
            new Date(link.created_at).toISOString(),
          ].join(",")
        ),
      ];
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `short_links_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast("Liste exportée en CSV avec succès", "success");
    } catch (err) {
      console.error("CSV export error:", err);
      addToast("Erreur lors de l'exportation en CSV", "error");
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    try {
      const jsonContent = JSON.stringify(filteredLinks, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `short_links_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast("Liste exportée en JSON avec succès", "success");
    } catch (err) {
      console.error("JSON export error:", err);
      addToast("Erreur lors de l'exportation en JSON", "error");
    }
  };

  // Ensure selectedLink is in scope here
  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-9">
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Gérer vos liens
        </h1>
      </div>

      {/* Create Link Form */}
      <div
        className={`rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up p-4 sm:p-6`}
      >
        <h2
          className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Créer un nouveau lien
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className={`block text-sm font-medium font-sans mb-1 transition-colors ${
                theme === "dark"
                  ? "text-dark-text-secondary hover:text-dark-text-primary"
                  : "text-light-text-secondary hover:text-light-text-primary"
              }`}
            >
              URL Originale
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Link2
                  size={16}
                  className={`${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                />
              </span>
              <input
                id="url"
                type="url"
                placeholder="Entrez votre URL longue (ex. https://example.com)"
                className={`w-full pl-10 pr-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="title"
              className={`block text-sm font-medium font-sans mb-1 transition-colors ${
                theme === "dark"
                  ? "text-dark-text-secondary hover:text-dark-text-primary"
                  : "text-light-text-secondary hover:text-light-text-primary"
              }`}
            >
              Titre (optionnel)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Type
                  size={16}
                  className={`${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                />
              </span>
              <input
                id="title"
                type="text"
                placeholder="Nom du lien (ex. Campagne Facebook)"
                className={`w-full pl-10 pr-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="newCode"
              className={`block text-sm font-medium font-sans mb-1 transition-colors ${
                theme === "dark"
                  ? "text-dark-text-secondary hover:text-dark-text-primary"
                  : "text-light-text-secondary hover:text-light-text-primary"
              }`}
            >
              Code Personnalisé (optionnel, max 25 caractères)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Hash
                  size={16}
                  className={`${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                />
              </span>
              <input
                id="newCode"
                type="text"
                placeholder="Code personnalisé (ex. mylink)"
                className={`w-full pl-10 pr-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.slice(0, 25))}
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-sans text-sm sm:text-base ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
            } transition-all hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                Création en cours...
              </>
            ) : (
              "Créer le lien court"
            )}
          </button>
        </form>
      </div>

      {/* Links Table */}
      <div
        className={`rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up overflow-hidden`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2
              className={`text-lg sm:text-xl font-semibold font-sans ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
            >
              Vos liens
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className={`px-3 py-2 rounded-lg font-sans text-sm flex items-center ${
                  theme === "dark"
                    ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                    : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                } transition-all`}
                title="Exporter en CSV"
              >
                <Download size={16} className="mr-2" />
                CSV
              </button>
              <button
                onClick={exportToJSON}
                className={`px-3 py-2 rounded-lg font-sans text-sm flex items-center ${
                  theme === "dark"
                    ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                    : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                } transition-all`}
                title="Exporter en JSON"
              >
                <Download size={16} className="mr-2" />
                JSON
              </button>
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 animate-slide-up">
            <div className="flex-1">
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Rechercher par titre
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className={`w-full px-4 py-2 rounded-lg border font-medium font-sans text-sm ${
                    theme === "dark"
                      ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                      : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                  } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all pr-10 ${
                    theme === "light" ? "focus:ring-light-primary" : ""
                  }`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                />
                {searchQuery && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    onClick={() => {
                      setSearchQuery("");
                      handleFilterChange();
                    }}
                  >
                    <X
                      size={16}
                      className={`theme-dark-text-secondary ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
            <div className="w-full sm:w-40">
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Statut
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  );
                  handleFilterChange();
                }}
              >
                <option value="all">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          {tableLoading ? (
            <div
              className={`flex justify-center items-center py-6 font-sans animate-pulse text-sm sm:text-base ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Chargement...
            </div>
          ) : filteredLinks.length === 0 ? (
            <div
              className={`text-center py-6 text-sm font-semibold font-sans ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Aucun lien trouvé
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-primary/20">
                  <thead>
                    <tr
                      className={`${
                        theme === "dark"
                          ? "bg-dark-background/50"
                          : "bg-light-background/50"
                      }`}
                    >
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                          theme === "dark"
                            ? "text-dark-tertiary"
                            : "text-light-tertiary"
                        }`}
                      >
                        Titre
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                          theme === "dark"
                            ? "text-dark-tertiary"
                            : "text-light-tertiary"
                        }`}
                      >
                        Lien court
                      </th>
                      <th
                        className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider font-sans ${
                          theme === "dark"
                            ? "text-dark-tertiary"
                            : "text-light-tertiary"
                        }`}
                      >
                        Clics
                      </th>
                      <th
                        className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider font-sans ${
                          theme === "dark"
                            ? "text-dark-tertiary"
                            : "text-light-tertiary"
                        }`}
                      >
                        Statut
                      </th>
                      <th
                        className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider font-sans ${
                          theme === "dark"
                            ? "text-dark-tertiary"
                            : "text-light-tertiary"
                        }`}
                      >
                        Créé le
                      </th>
                      <th
                        className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider font-sans ${
                          theme === "dark"
                            ? "text-dark-tertiary"
                            : "text-light-tertiary"
                        }`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-primary/20">
                    {paginatedLinks.map((link) => (
                      <tr
                        key={link.id}
                        className={`${
                          theme === "dark"
                            ? "bg-dark-background/30"
                            : "bg-light-background/30"
                        } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                          theme === "light" ? "hover:bg-light-primary/10" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Link2
                              size={16}
                              className={`mr-2 ${
                                theme === "dark"
                                  ? "text-dark-primary"
                                  : "text-light-primary"
                              }`}
                            />
                            <span
                              className={`font-medium font-sans text-sm ${
                                theme === "dark"
                                  ? "text-dark-text-primary"
                                  : "text-light-text-primary"
                              }`}
                            >
                              {link.title || "Sans titre"}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-sans truncate max-w-xs ${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-light-text-secondary"
                            }`}
                          >
                            {link.original_url}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-sans ${
                                theme === "dark"
                                  ? "text-dark-primary"
                                  : "text-light-primary"
                              }`}
                            >
                              {link.short_link}
                            </span>
                            <CopyToClipboard
                              text={API.SHORT_LINKS.URL + link.short_code}
                              onCopy={() =>
                                addToast(
                                  "Lien copié dans le presse-papiers",
                                  "success"
                                )
                              }
                            >
                              <button
                                className={`p-1 hover:bg-dark-primary/20 rounded transition-all ${
                                  theme === "light"
                                    ? "hover:bg-light-primary/20"
                                    : ""
                                }`}
                                title="Copier le lien court"
                              >
                                <Copy size={14} />
                              </button>
                            </CopyToClipboard>
                            <Link
                              to={API.SHORT_LINKS.URL + link.short_code}
                              target="_blank"
                              className={`p-1 hover:bg-dark-primary/20 rounded transition-all ${
                                theme === "light"
                                  ? "hover:bg-light-primary/20"
                                  : ""
                              }`}
                              title="Ouvrir le lien court"
                            >
                              <ExternalLink size={14} />
                            </Link>
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 text-center font-sans text-sm ${
                            theme === "dark"
                              ? "text-dark-text-primary"
                              : "text-light-text-primary"
                          }`}
                        >
                          {link.click_count || 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full font-sans ${
                              link.is_active
                                ? "bg-green-500/20 text-green-500"
                                : "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {link.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-center font-sans text-sm ${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        >
                          {new Date(link.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`${link.short_code}/stats`}
                              className={`p-2 hover:bg-dark-primary/20 rounded transition-all ${
                                theme === "light"
                                  ? "hover:bg-light-primary/20"
                                  : ""
                              }`}
                              title="Statistiques"
                            >
                              <BarChart2
                                size={16}
                                className={`${
                                  theme === "dark"
                                    ? "text-dark-primary"
                                    : "text-light-primary"
                                }`}
                              />
                            </Link>

                            <button
                              onClick={() => handleEditClick(link)}
                              className={`p-2 hover:bg-dark-primary/20 rounded transition-all ${
                                theme === "light"
                                  ? "hover:bg-light-primary/20"
                                  : ""
                              }`}
                              title="Modifier"
                            >
                              <Edit2
                                size={16}
                                className={`${
                                  theme === "dark"
                                    ? "text-dark-primary"
                                    : "text-light-primary"
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(link)}
                              className={`p-2 hover:bg-dark-danger/20 rounded transition-all ${
                                theme === "light"
                                  ? "hover:bg-light-danger/20"
                                  : ""
                              }`}
                              title="Supprimer"
                            >
                              <Trash2
                                size={16}
                                className={`${
                                  theme === "dark"
                                    ? "text-dark-danger"
                                    : "text-light-danger"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Accordion Layout */}
              <div className="md:hidden space-y-4 p-4">
                {paginatedLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`rounded-lg border border-dark-primary/30 ${
                      theme === "dark"
                        ? "bg-dark-background/30"
                        : "bg-light-background/30"
                    } shadow animate-slide-up overflow-hidden`}
                  >
                    <button
                      className="w-full flex items-center justify-between p-4 focus:outline-none"
                      onClick={() => toggleAccordion(link.id)}
                    >
                      <div className="flex items-center">
                        <Link2
                          size={16}
                          className={`mr-2 ${
                            theme === "dark"
                              ? "text-dark-primary"
                              : "text-light-primary"
                          }`}
                        />
                        <span
                          className={`font-medium font-sans text-sm truncate max-w-[200px] ${
                            theme === "dark"
                              ? "text-dark-text-primary"
                              : "text-light-text-primary"
                          }`}
                        >
                          {link.title || "Sans titre"}
                        </span>
                      </div>
                      {expandedLinkId === link.id ? (
                        <ChevronDown
                          size={16}
                          className={`${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                          className={`${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        />
                      )}
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        expandedLinkId === link.id ? "max-h-96" : "max-h-0"
                      } overflow-hidden`}
                    >
                      <div className="px-4 pb-4 space-y-2">
                        <p
                          className={`text-xs font-sans truncate max-w-[200px] ${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        >
                          {link.original_url}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-sans ${
                              theme === "dark"
                                ? "text-dark-primary"
                                : "text-light-primary"
                            }`}
                          >
                            {link.short_link}
                          </span>
                          <CopyToClipboard
                            text={API.SHORT_LINKS.URL + link.short_code}
                            onCopy={() =>
                              addToast(
                                "Lien copié dans le presse-papiers",
                                "success"
                              )
                            }
                          >
                            <button
                              className={`p-1 hover:bg-dark-primary/20 rounded transition-all ${
                                theme === "light"
                                  ? "hover:bg-light-primary/20"
                                  : ""
                              }`}
                            >
                              <Copy size={14} />
                            </button>
                          </CopyToClipboard>
                          <Link
                            to={API.SHORT_LINKS.URL + link.short_code}
                            target="_blank"
                            className={`p-1 hover:bg-dark-primary/20 rounded transition-all ${
                              theme === "light"
                                ? "hover:bg-light-primary/20"
                                : ""
                            }`}
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm font-sans">
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-light-text-secondary"
                            }`}
                          >
                            Clics:
                          </span>
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-light-text-primary"
                            }`}
                          >
                            {link.click_count || 0}
                          </span>
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-light-text-secondary"
                            }`}
                          >
                            Statut:
                          </span>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              link.is_active
                                ? "bg-green-500/20 text-green-500"
                                : "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {link.is_active ? "Actif" : "Inactif"}
                          </span>
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-light-text-secondary"
                            }`}
                          >
                            Créé le:
                          </span>
                          <span
                            className={`${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-light-text-primary"
                            }`}
                          >
                            {new Date(link.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-end space-x-2">
                          {(user?.plan === "premium" ||
                            user?.plan === "enterprise") && (
                            <Link
                              to={`${link.short_code}/stats`}
                              className={`p-2 hover:bg-dark-primary/20 rounded transition-all ${
                                theme === "light"
                                  ? "hover:bg-light-primary/20"
                                  : ""
                              }`}
                              title="Statistiques"
                            >
                              <BarChart2
                                size={16}
                                className={`${
                                  theme === "dark"
                                    ? "text-dark-primary"
                                    : "text-light-primary"
                                }`}
                              />
                            </Link>
                          )}
                          <button
                            onClick={() => handleEditClick(link)}
                            className={`p-2 hover:bg-dark-primary/20 rounded transition-all ${
                              theme === "light"
                                ? "hover:bg-light-primary/20"
                                : ""
                            }`}
                            title="Modifier"
                          >
                            <Edit2
                              size={16}
                              className={`${
                                theme === "dark"
                                  ? "text-dark-primary"
                                  : "text-light-primary"
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(link)}
                            className={`p-2 hover:bg-dark-danger/20 rounded transition-all ${
                              theme === "light"
                                ? "hover:bg-light-danger/20"
                                : ""
                            }`}
                            title="Supprimer"
                          >
                            <Trash2
                              size={16}
                              className={`${
                                theme === "dark"
                                  ? "text-dark-danger"
                                  : "text-light-danger"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 p-4 animate-slide-up">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg font-sans text-sm ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-primary/50"
                        : "bg-light-background/50 text-light-text-secondary hover:bg-light-primary/50"
                    } transition-all disabled:opacity-50 disabled:cursor-not-allowed md:flex hidden`}
                  >
                    Précédent
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg font-sans text-sm ${
                            currentPage === page
                              ? theme === "dark"
                                ? "bg-dark-primary text-dark-text-primary"
                                : "bg-light-primary text-light-text-primary"
                              : theme === "dark"
                              ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-primary/50"
                              : "bg-light-background/50 text-light-text-secondary hover:bg-light-primary/50"
                          } transition-all`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={page}
                          className={`px-3 py-1 font-sans text-sm ${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg font-sans text-sm ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-primary/50"
                        : "bg-light-background/50 text-light-text-secondary hover:bg-light-primary/50"
                    } transition-all disabled:opacity-50 disabled:cursor-not-allowed md:flex hidden`}
                  >
                    Suivant
                  </button>
                  {/* Mobile Prev/Next */}
                  <div className="flex gap-2 md:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg font-sans text-sm ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-primary/50"
                          : "bg-light-background/50 text-light-text-secondary hover:bg-light-primary/50"
                      } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Préc
                    </button>
                    <span
                      className={`px-3 py-1 font-sans text-sm ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg font-sans text-sm ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-primary/50"
                          : "bg-light-background/50 text-light-text-secondary hover:bg-light-primary/50"
                      } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Suiv
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`p-4 sm:p-6 rounded-xl w-11/12 max-w-md border border-dark-primary/50 ${
              theme === "dark" ? "bg-dark-card" : "bg-light-card"
            } shadow-lg animate-slide-up`}
          >
            <h3
              className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 font-sans ${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              }`}
            >
              Modifier le lien
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium font-sans ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Titre
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                    theme === "dark"
                      ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                      : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                  } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
                    theme === "light" ? "focus:ring-light-primary" : ""
                  }`}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titre"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium font-sans ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  URL originale
                </label>
                <input
                  type="url"
                  className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                    theme === "dark"
                      ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                      : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                  } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
                    theme === "light" ? "focus:ring-light-primary" : ""
                  }`}
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="URL originale"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium font-sans ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Code personnalisé
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                    theme === "dark"
                      ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                      : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                  } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
                    theme === "light" ? "focus:ring-light-primary" : ""
                  }`}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.slice(0, 25))}
                  placeholder="Code personnalisé"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2 sm:gap-3 justify-end">
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedLink(null);
                  }}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                    theme === "dark"
                      ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                      : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                  } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                    theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                      : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                  } transition-all animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? "Mise à jour..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`p-4 sm:p-6 rounded-xl w-11/12 max-w-md border border-dark-primary/50 ${
              theme === "dark" ? "bg-dark-card" : "bg-light-card"
            } shadow-lg animate-slide-up`}
          >
            <h3
              className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 font-sans ${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              }`}
            >
              Confirmer la suppression
            </h3>
            <p
              className={`text-sm font-sans mb-4 ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Êtes-vous sûr de vouloir supprimer le lien{" "}
              <span className="font-medium">
                {selectedLink?.title || "Sans titre"} (
                {selectedLink?.short_link})
              </span>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedLink(null);
                }}
                disabled={loading}
                className={`px-3 sm:px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                    : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className={`px-3 sm:px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-dark-danger text-dark-text-primary hover:bg-dark-accent/80"
                    : "bg-light-danger text-light-text-primary hover:bg-light-danger/80"
                } transition-all animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinksManager;
