
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { API } from "../../utils/api";
import { Link as LinkIcon, Search, Filter, Info, Trash2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  user: User;
  clicks: number;
  createdAt: string;
  expiresAt?: string;
}

const AdminLinksManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    userId: "all",
    dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    clicksMin: "",
    clicksMax: "",
  });
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [modalType, setModalType] = useState<"details" | "delete" | "expire" | null>(null);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);

  // Debounced fetch links
  const debouncedFetchLinks = useCallback(
    debounce(async () => {
      if (user?.role !== "admin" && user?.role !== "super_admin") return;
      try {
        setLoading(true);
        setError(null);
        const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
        const response = await api.GET_LINKS();
        const linksData = response.data as any[];
        console.log("Fetched links data:", linksData);
        const transformedLinks = linksData.map((l: any) => ({
          id: l.id,
          shortCode: l.short_code,
          originalUrl: l.original_url,
          user: l.user
            ? {
                id: l.user.id,
                name: l.user.name,
                email: l.user.email,
              }
            : {
                id: "",
                name: "Utilisateur inconnu",
                email: "",
              },
          clicks: l.click_count ?? l.clicks ?? 0,
          createdAt: l.created_at,
          expiresAt: l.expires_at || undefined,
        }));
        setLinks(transformedLinks);
      } catch (err) {
        console.error("Error fetching links:", err);
        setError("Impossible de charger les liens. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des liens.", {
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
    debouncedFetchLinks();
    return () => debouncedFetchLinks.cancel();
  }, [debouncedFetchLinks]);

  // Extract unique users for filter dropdown
  const users = useMemo(() => {
    const uniqueUsers = Array.from(
      new Map(links.map((link) => [link.user.id, link.user])).values()
    );
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
  }, [links]);

  // Filter and search logic
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = filters.userId === "all" || link.user.id === filters.userId;
      const linkDate = new Date(link.createdAt);
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
      const matchesDate =
        (!dateFrom || linkDate >= dateFrom) && (!dateTo || linkDate <= dateTo);
      const matchesClicksMin = filters.clicksMin === "" || link.clicks >= Number(filters.clicksMin);
      const matchesClicksMax = filters.clicksMax === "" || link.clicks <= Number(filters.clicksMax);

      return matchesSearch && matchesUser && matchesDate && matchesClicksMin && matchesClicksMax;
    });
  }, [links, searchTerm, filters]);

  // Handle admin actions
  const handleViewDetails = async (linkId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.GET_LINK(linkId);
      const linkData = response.data as any;
      const transformedLink: Link = {
        id: linkData.id,
        shortCode: linkData.short_code,
        originalUrl: linkData.original_url,
        user: linkData.user
          ? {
              id: linkData.user.id,
              name: linkData.user.name,
              email: linkData.user.email,
            }
          : {
              id: "",
              name: "Utilisateur inconnu",
              email: "",
            },
        clicks: linkData.click_count ?? linkData.clicks ?? 0,
        createdAt: linkData.created_at,
        expiresAt: linkData.expires_at || undefined,
      };
      setSelectedLink(transformedLink);
      setModalType("details");
    } catch (err) {
      console.error("Error fetching link details:", err);
      toast.error("Erreur lors du chargement des détails du lien.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.DELETE_LINK(linkId);
      setLinks(links.filter((l) => l.id !== linkId));
      toast.success("Lien supprimé avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error deleting link:", err);
      toast.error("Erreur lors de la suppression du lien.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleExpireLink = async (linkId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.EXPIRE_LINK(linkId);
      setLinks(
        links.map((l) =>
          l.id === linkId ? { ...l, expiresAt: new Date().toISOString() } : l
        )
      );
      toast.success("Lien expiré avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error expiring link:", err);
      toast.error("Erreur lors de l'expiration du lien.", {
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
          onClick={() => debouncedFetchLinks()}
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
        Gestion des liens raccourcis
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
                placeholder="Rechercher par code, URL, nom ou email..."
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
            <input
              type="number"
              placeholder="Clics min"
              value={filters.clicksMin}
              onChange={(e) => setFilters({ ...filters, clicksMin: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
            />
            <input
              type="number"
              placeholder="Clics max"
              value={filters.clicksMax}
              onChange={(e) => setFilters({ ...filters, clicksMax: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Links Table */}
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
                    Code
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                      theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                    }`}
                  >
                    URL Originale
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
                    Clics
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
                {filteredLinks.map((link) => (
                  <tr
                    key={link.id}
                    className={`${
                      theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                    } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                      theme === "light" ? "hover:bg-light-primary/10" : ""
                    }`}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {link.shortCode}
                    </td>
                    <td
                      className={`px-6 py-4 max-w-xs truncate font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline ${
                          theme === "dark" ? "text-dark-primary" : "text-light-primary"
                        }`}
                        title={link.originalUrl}
                      >
                        {link.originalUrl.slice(0, 10)}
                      </a>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {link.user.name} ({link.user.email})
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {link.clicks}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {format(new Date(link.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {link.expiresAt ? format(new Date(link.expiresAt), "dd/MM/yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(link.id)}
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
                            setSelectedLink(link);
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
                        {!link.expiresAt && (
                          <button
                            onClick={() => {
                              setSelectedLink(link);
                              setModalType("expire");
                            }}
                            className={`p-2 rounded-lg ${
                              theme === "dark"
                                ? "text-dark-text-secondary hover:bg-dark-background/70"
                                : "text-light-text-secondary hover:bg-light-background/70"
                            } transition-all animate-pulse hover:animate-none`}
                            title="Forcer expiration"
                          >
                            <Clock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4 p-4">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className={`rounded-lg border border-dark-primary/30 p-4 ${
                  theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                } shadow animate-slide-up`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedLinkId(expandedLinkId === link.id ? null : link.id)}
                >
                  <div>
                    <p
                      className={`font-medium font-sans text-sm ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {link.shortCode}
                    </p>
                    <p
                      className={`text-xs font-sans truncate max-w-[200px] ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      {link.originalUrl}
                    </p>
                  </div>
                  {expandedLinkId === link.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedLinkId === link.id && (
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
                        className={`font-sans ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                      >
                        {link.user.name} ({link.user.email})
                      </span>
                      <span
                        className={`font-medium font-sans ${
                          theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                        }`}
                      >
                        Clics:
                      </span>
                      <span
                        className={`font-sans ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                      >
                        {link.clicks}
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
                        {format(new Date(link.createdAt), "dd/MM/yyyy")}
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
                        {link.expiresAt ? format(new Date(link.expiresAt), "dd/MM/yyyy") : "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleViewDetails(link.id)}
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
                          setSelectedLink(link);
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
                      {!link.expiresAt && (
                        <button
                          onClick={() => {
                            setSelectedLink(link);
                            setModalType("expire");
                          }}
                          className={`p-2 rounded-lg ${
                            theme === "dark"
                              ? "text-dark-text-secondary hover:bg-dark-background/70"
                              : "text-light-text-secondary hover:bg-light-background/70"
                            } transition-all animate-pulse hover:animate-none`}
                          title="Forcer expiration"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {modalType && selectedLink && (
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
                    Détails du lien
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium font-sans">Code</label>
                      <p className="text-sm font-sans">{selectedLink.shortCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium font-sans">URL Originale</label>
                      <a
                        href={selectedLink.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm font-sans hover:underline ${
                          theme === "dark" ? "text-dark-primary" : "text-light-primary"
                        }`}
                      >
                        {selectedLink.originalUrl}
                      </a>
                    </div>
                    <div>
                      <label className="block text-sm font-medium font-sans">Créateur</label>
                      <p className="text-sm font-sans">
                        {selectedLink.user.name} ({selectedLink.user.email})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium font-sans">Clics</label>
                      <p className="text-sm font-sans">{selectedLink.clicks}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium font-sans">Date de création</label>
                      <p className="text-sm font-sans">{format(new Date(selectedLink.createdAt), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium font-sans">Expiration</label>
                      <p className="text-sm font-sans">
                        {selectedLink.expiresAt
                          ? format(new Date(selectedLink.expiresAt), "dd/MM/yyyy HH:mm")
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
                    Supprimer le lien
                  </h2>
                  <p className="mb-4 font-sans text-sm sm:text-base">
                    Voulez-vous supprimer le lien {selectedLink.shortCode} ? Cette action est irréversible.
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
                      onClick={() => handleDeleteLink(selectedLink.id)}
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

              {modalType === "expire" && (
                <div>
                  <h2
                    className={`text-lg font-semibold mb-4 font-sans ${
                      theme === "dark" ? "text-dark-primary" : "text-light-primary"
                    }`}
                  >
                    Forcer l'expiration
                  </h2>
                  <p className="mb-4 font-sans text-sm sm:text-base">
                    Voulez-vous forcer l'expiration du lien {selectedLink.shortCode} ? Il ne sera plus accessible.
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
                      onClick={() => handleExpireLink(selectedLink.id)}
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

export default AdminLinksManager;