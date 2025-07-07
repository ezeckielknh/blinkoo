import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { API } from "../../utils/api";
import {
  QrCode,
  Search,
  Filter,
  Info,
  Trash2,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";

interface User {
  id: string;
  name: string;
  email: string;
}

interface QRCode {
  id: string;
  shortCode: string;
  type: "text" | "url" | "email" | "phone" | "tel" | "sms" | "vcard" | "wifi" | "geo" | "whatsapp";
  content: string;
  user: User;
  hasLogo: boolean;
  createdAt: string;
  expires_at?: string;
}

const QR_TYPES = [
  { value: "all", label: "Tous les types" },
  { value: "text", label: "Texte" },
  { value: "url", label: "URL" },
  { value: "tel", label: "Téléphone" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "vcard", label: "VCard" },
  { value: "wifi", label: "WiFi" },
  { value: "geo", label: "Géolocalisation" },
  { value: "whatsapp", label: "WhatsApp" },
];

const AdminQrManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    userId: "all",
    type: "all",
    hasLogo: "all",
    expires: "all",
  });
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [modalType, setModalType] = useState<"details" | "delete" | "extend" | null>(null);
  const [extendDays, setExtendDays] = useState<number>(7);
  const [expandedQRId, setExpandedQRId] = useState<string | null>(null);

  // Debounced fetch QR codes
  const debouncedFetchQrCodes = useCallback(
    debounce(async () => {
      if (user?.role !== "admin" && user?.role !== "super_admin") return;
      try {
        setLoading(true);
        setError(null);
        const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
        const response = await api.GET_QR_CODES();
        console.log("QR codes API response:", response);
        let qrCodesData: unknown = response.data;
        console.log("QR codes API response:", response.data);

        if (!Array.isArray(qrCodesData)) {
          qrCodesData =
            (qrCodesData && typeof qrCodesData === "object"
              ? (qrCodesData as any)?.data || (qrCodesData as any)?.qr_codes
              : undefined) || [];
        }
        if (!Array.isArray(qrCodesData)) qrCodesData = [];
        console.log("QR codes data after extraction:", qrCodesData);

        const transformedQRCodes = (qrCodesData as any[]).map((qr: any) => ({
          id: qr.id.toString(),
          shortCode: qr.short_code,
          type: qr.type as QRCode["type"],
          content: qr.content,
          user: qr.user
            ? {
                id: qr.user.id.toString(),
                name: qr.user.name,
                email: qr.user.email,
              }
            : {
                id: "",
                name: "Utilisateur inconnu",
                email: "",
              },
          hasLogo: !!qr.logo_path,
          createdAt: qr.created_at,
          expires_at: qr.expires_at || undefined,
        }));
        setQRCodes(transformedQRCodes);
      } catch (err) {
        console.error("Error fetching QR codes:", err);
        setError("Impossible de charger les QR codes. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des QR codes.", {
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
    debouncedFetchQrCodes();
    return () => debouncedFetchQrCodes.cancel();
  }, [debouncedFetchQrCodes]);

  // Extract unique users for filter dropdown
  const users = useMemo(() => {
    const uniqueUsers = Array.from(
      new Map(qrCodes.map((qr) => [qr.user.id, qr.user])).values()
    );
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
  }, [qrCodes]);

  // Filter and search logic (frontend-only)
  const filteredQRCodes = useMemo(() => {
    return qrCodes.filter((qr) => {
      const matchesSearch =
        qr.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = filters.userId === "all" || qr.user.id === filters.userId;
      const matchesType = filters.type === "all" || qr.type === filters.type;
      const matchesLogo =
        filters.hasLogo === "all" ||
        (filters.hasLogo === "withLogo" ? qr.hasLogo : !qr.hasLogo);
      const matchesExpires =
        filters.expires === "all" ||
        (filters.expires === "active"
          ? !qr.expires_at || new Date(qr.expires_at) > new Date()
          : qr.expires_at && new Date(qr.expires_at) <= new Date());

      return matchesSearch && matchesUser && matchesType && matchesLogo && matchesExpires;
    });
  }, [qrCodes, searchTerm, filters]);

  // Handle admin actions
  const handleViewDetails = async (qrId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.GET_QR_CODE(qrId);
      const qrData = response.data as any;
      const transformedQR: QRCode = {
        id: qrData.id.toString(),
        shortCode: qrData.short_code,
        type: qrData.type as QRCode["type"],
        content: qrData.content,
        user: qrData.user
          ? {
              id: qrData.user.id.toString(),
              name: qrData.user.name,
              email: qrData.user.email,
            }
          : {
              id: "",
              name: "Utilisateur inconnu",
              email: "",
            },
        hasLogo: !!qrData.logo_path,
        createdAt: qrData.created_at,
        expires_at: qrData.expires_at || undefined,
      };
      setSelectedQRCode(transformedQR);
      setModalType("details");
    } catch (err) {
      console.error("Error fetching QR code details:", err);
      toast.error("Erreur lors du chargement des détails du QR code.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleDeleteQRCode = async (qrId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.DELETE_QR_CODE(qrId);
      setQRCodes(qrCodes.filter((q) => q.id !== qrId));
      toast.success("QR code supprimé avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error deleting QR code:", err);
      toast.error("Erreur lors de la suppression du QR code.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleExtendQRCode = async (qrId: string, days: number | null) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.EXPIRE_QR_CODE(qrId, days ? { days } : {});
      const data = response.data as { expires_at?: string };
      const newExpiresAt = data.expires_at || undefined;
      setQRCodes(
        qrCodes.map((q) =>
          q.id === qrId ? { ...q, expires_at: newExpiresAt } : q
        )
      );
      toast.success(
        newExpiresAt
          ? `Expiration définie à ${format(
              new Date(newExpiresAt),
              "dd/MM/yyyy HH:mm"
            )}`
          : "Expiration supprimée.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        }
      );
      setModalType(null);
    } catch (err) {
      console.error("Error extending QR code:", err);
      toast.error("Erreur lors de la mise à jour de l'expiration.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleDownloadQRCode = async (qrId: string, shortCode: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.DOWNLOAD_QR_CODE(qrId);
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `qr_${shortCode}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR code téléchargé avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    } catch (err) {
      console.error("Error downloading QR code:", err);
      toast.error("Erreur lors du téléchargement du QR code.", {
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
          onClick={() => debouncedFetchQrCodes()}
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
        Gestion des QR codes
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
                placeholder="Rechercher par code, contenu, nom ou email..."
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
              {QR_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filters.hasLogo}
              onChange={(e) => setFilters({ ...filters, hasLogo: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                theme === "light" ? "focus:ring-light-primary" : ""
              }`}
            >
              <option value="all">Tous</option>
              <option value="withLogo">Avec logo</option>
              <option value="withoutLogo">Sans logo</option>
            </select>
            <select
              value={filters.expires}
              onChange={(e) => setFilters({ ...filters, expires: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                theme === "light" ? "focus:ring-light-primary" : ""
              }`}
            >
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* QR Codes Table */}
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
                  Type
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Contenu
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
                  Logo
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
              {filteredQRCodes.map((qr) => (
                <tr
                  key={qr.id}
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
                    {qr.shortCode}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {qr.type.charAt(0).toUpperCase() + qr.type.slice(1)}
                  </td>
                  <td
                    className={`px-6 py-4 max-w-xs truncate font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {qr.type === "url" ? (
                      <a
                        href={qr.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline ${
                          theme === "dark" ? "text-dark-primary" : "text-light-primary"
                        }`}
                        title={qr.content}
                      >
                        {qr.content.slice(0, 10)}
                      </a>
                    ) : (
                      <span title={qr.content}>{qr.content.slice(0, 10)}</span>
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {qr.user.name.slice(0, 10)} ({qr.user.email.slice(0, 10)})
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {qr.hasLogo ? "Oui" : "Non"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {format(new Date(qr.createdAt), "dd/MM/yyyy")}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {qr.expires_at ? format(new Date(qr.expires_at), "dd/MM/yyyy") : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(qr.id)}
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
                          setSelectedQRCode(qr);
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
                          setSelectedQRCode(qr);
                          setModalType("extend");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title={qr.expires_at ? "Prolonger expiration" : "Définir expiration"}
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadQRCode(qr.id, qr.shortCode)}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Télécharger"
                      >
                        <Download size={16} />
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
          {filteredQRCodes.map((qr) => (
            <div
              key={qr.id}
              className={`rounded-lg border border-dark-primary/30 p-4 ${
                theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
              } shadow animate-slide-up`}
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedQRId(expandedQRId === qr.id ? null : qr.id)}
              >
                <div>
                  <p
                    className={`font-medium font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {qr.shortCode}
                  </p>
                  <p
                    className={`text-xs font-sans ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {qr.type.charAt(0).toUpperCase() + qr.type.slice(1)}
                  </p>
                </div>
                {expandedQRId === qr.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedQRId === qr.id && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Contenu:
                    </span>
                    <span
                      className={`font-sans truncate max-w-[150px] ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                      title={qr.content}
                    >
                      {qr.type === "url" ? (
                        <a
                          href={qr.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`hover:underline ${
                            theme === "dark" ? "text-dark-primary" : "text-light-primary"
                          }`}
                        >
                          {qr.content}
                        </a>
                      ) : (
                        qr.content
                      )}
                    </span>
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
                      {qr.user.name} ({qr.user.email})
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Logo:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {qr.hasLogo ? "Oui" : "Non"}
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
                      {format(new Date(qr.createdAt), "dd/MM/yyyy")}
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
                      {qr.expires_at ? format(new Date(qr.expires_at), "dd/MM/yyyy") : "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(qr.id)}
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
                        setSelectedQRCode(qr);
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
                        setSelectedQRCode(qr);
                        setModalType("extend");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                      } transition-all animate-pulse hover:animate-none`}
                      title={qr.expires_at ? "Prolonger expiration" : "Définir expiration"}
                    >
                      <Clock size={16} />
                    </button>
                    <button
                      onClick={() => handleDownloadQRCode(qr.id, qr.shortCode)}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                      } transition-all animate-pulse hover:animate-none`}
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modalType && selectedQRCode && (
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
                  Détails du QR code
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Code</label>
                    <p className="text-sm font-sans">{selectedQRCode.shortCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Type</label>
                    <p className="text-sm font-sans">
                      {selectedQRCode.type.charAt(0).toUpperCase() + selectedQRCode.type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Contenu</label>
                    {selectedQRCode.type === "url" ? (
                      <a
                        href={selectedQRCode.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm font-sans hover:underline ${
                          theme === "dark" ? "text-dark-primary" : "text-light-primary"
                        }`}
                      >
                        {selectedQRCode.content}
                      </a>
                    ) : (
                      <p className="text-sm font-sans" title={selectedQRCode.content}>
                        {selectedQRCode.content}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Créateur</label>
                    <p className="text-sm font-sans">
                      {selectedQRCode.user.name} ({selectedQRCode.user.email})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Logo</label>
                    <p className="text-sm font-sans">{selectedQRCode.hasLogo ? "Oui" : "Non"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Date de création</label>
                    <p className="text-sm font-sans">
                      {format(new Date(selectedQRCode.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Expiration</label>
                    <p className="text-sm font-sans">
                      {selectedQRCode.expires_at
                        ? format(new Date(selectedQRCode.expires_at), "dd/MM/yyyy HH:mm")
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
                  Supprimer le QR code
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous supprimer le QR code {selectedQRCode.shortCode} ? Cette action est irréversible.
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
                    onClick={() => handleDeleteQRCode(selectedQRCode.id)}
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
                  {selectedQRCode.expires_at ? "Prolonger" : "Définir"} expiration
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
                    {selectedQRCode.expires_at && (
                      <button
                        onClick={() => handleExtendQRCode(selectedQRCode.id, null)}
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
                      onClick={() => handleExtendQRCode(selectedQRCode.id, extendDays)}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQrManager;