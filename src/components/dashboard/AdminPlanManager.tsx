import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Package, Plus, Edit, Users, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  limits: {
    links: number;
    qrCodes: number;
    downloads: number;
    fileSize: number;
  };
  features: string[];
}

interface Subscription {
  id: string;
  user: User;
  plan: { id: string; name: string };
  startDate: string;
  endDate: string;
  status: "active" | "expired";
}

const AdminPlanManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "1",
      name: "Free",
      price: 0,
      limits: { links: 15, qrCodes: 10, downloads: 10, fileSize: 100 },
      features: ["Basic Links", "Basic QR Codes"],
    },
    {
      id: "2",
      name: "Premium",
      price: 5000,
      limits: { links: 50, qrCodes: 20, downloads: 100, fileSize: 100 },
      features: ["Analytics", "Custom Logo", "Priority Support"],
    },
  ]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      user: { id: "u1", name: "Alice Dupont", email: "alice@example.com" },
      plan: { id: "2", name: "Premium" },
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "active",
    },
    {
      id: "2",
      user: { id: "u2", name: "Bob Martin", email: "bob@example.com" },
      plan: { id: "1", name: "Free" },
      startDate: "2025-02-01",
      endDate: "2025-03-01",
      status: "expired",
    },
  ]);
  const [users] = useState<User[]>([
    { id: "u1", name: "Alice Dupont", email: "alice@example.com" },
    { id: "u2", name: "Bob Martin", email: "bob@example.com" },
    { id: "u3", name: "Clara Sow", email: "clara@example.com" },
  ]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"plans" | "subscriptions">("plans");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalType, setModalType] = useState<"edit" | "add" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    limits: { links: 0, qrCodes: 0, downloads: 0, fileSize: 0 },
    features: [] as string[],
  });
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    // Static data loaded, no API calls
    setLoading(false);
  }, [user]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, filterStatus]);

  const handleUpdatePlan = () => {
    if (!selectedPlan) return;
    setPlans(
      plans.map((p) => (p.id === selectedPlan.id ? { ...p, ...formData } : p))
    );
    setModalType(null);
    setSelectedPlan(null);
  };

  const handleCreatePlan = () => {
    const newPlan: Plan = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
    };
    setPlans([...plans, newPlan]);
    setModalType(null);
    setFormData({
      name: "",
      price: 0,
      limits: { links: 0, qrCodes: 0, downloads: 0, fileSize: 0 },
      features: [],
    });
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

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          }`}
        >
          Gestion des Plans et Abonnements
        </h1>
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setViewMode("plans")}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base font-sans ${
              viewMode === "plans"
                ? "bg-dark-primary text-dark-text-primary"
                : theme === "dark"
                ? "bg-dark-background/50 text-dark-text-secondary"
                : "bg-light-background/50 text-light-text-secondary"
            } hover:bg-dark-secondary transition-all animate-pulse hover:animate-none ${
              theme === "light" && viewMode === "plans"
                ? "bg-light-primary text-dark-text-primary"
                : theme === "light"
                ? "hover:bg-dark-secondary"
                : ""
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setViewMode("subscriptions")}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base font-sans ${
              viewMode === "subscriptions"
                ? "bg-dark-primary text-dark-text-primary"
                : theme === "dark"
                ? "bg-dark-background/50 text-dark-text-secondary"
                : "bg-light-background/50 text-light-text-secondary"
            } hover:bg-dark-secondary transition-all animate-pulse hover:animate-none ${
              theme === "light" && viewMode === "subscriptions"
                ? "bg-light-primary text-dark-text-primary"
                : theme === "light"
                ? "hover:bg-dark-secondary"
                : ""
            }`}
          >
            Abonnements
          </button>
        </div>
      </div>

      {viewMode === "plans" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 sm:p-6 rounded-xl border border-dark-primary/30 ${
                  theme === "dark" ? "bg-dark-card" : "bg-light-card"
                } shadow-lg hover:shadow-xl transition-all animate-slide-up`}
              >
                <h2
                  className={`text-lg sm:text-xl font-semibold font-sans ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-2 ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  {plan.price.toFixed(2)} FCFA/mois
                </p>
                <div className="mt-4 space-y-2">
                  <p
                    className={`font-medium text-sm sm:text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    <strong>Limites :</strong>
                  </p>
                  <ul
                    className={`list-disc pl-5 text-sm sm:text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    <li>Liens: {plan.limits.links}</li>
                    <li>QR Codes: {plan.limits.qrCodes}</li>
                    <li>Téléchargements: {plan.limits.downloads}</li>
                    <li>Taille fichier: {plan.limits.fileSize} MB</li>
                  </ul>
                  <p
                    className={`font-medium text-sm sm:text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    <strong>Fonctionnalités :</strong>
                  </p>
                  <ul
                    className={`list-disc pl-5 text-sm sm:text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setFormData({
                      name: plan.name,
                      price: plan.price,
                      limits: { ...plan.limits },
                      features: [...plan.features],
                    });
                    setModalType("edit");
                  }}
                  className={`mt-4 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-sans bg-dark-primary text-dark-text-primary hover:bg-dark-secondary transition-all animate-pulse hover:animate-none ${
                    theme === "light" ? "bg-light-primary text-dark-text-primary hover:bg-dark-secondary" : ""
                  }`}
                >
                  <Edit size={16} className="inline mr-2" />
                  Modifier
                </button>
              </div>
            ))}
            <div
              className={`p-4 sm:p-6 rounded-xl border border-dark-primary/30 ${
                theme === "dark" ? "bg-dark-card" : "bg-light-card"
              } shadow-lg hover:shadow-xl transition-all flex items-center justify-center animate-slide-up`}
            >
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    price: 0,
                    limits: { links: 0, qrCodes: 0, downloads: 0, fileSize: 0 },
                    features: [],
                  });
                  setModalType("add");
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-lg font-semibold font-sans bg-dark-primary text-dark-text-primary hover:bg-dark-secondary transition-all animate-pulse hover:animate-none ${
                  theme === "light" ? "bg-light-primary text-dark-text-primary hover:bg-dark-secondary" : ""
                }`}
              >
                <Plus size={16} className="inline mr-2 sm:mr-2" />
                Ajouter un plan
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={`p-4 sm:p-6 rounded-xl border border-dark-primary/30 ${
              theme === "dark" ? "bg-dark-card" : "bg-light-card"
            } shadow-lg animate-slide-up`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    size={20}
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher par utilisateur ou plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                        : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                    } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                      theme === "light" ? "focus:ring-light-primary" : ""
                    }`}
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "expired")}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary"
                    : "bg-light-background/50 text-light-text-primary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </div>

          {/* Desktop Table */}
          <div
            className={`rounded-xl overflow-hidden border border-dark-primary/30 ${
              theme === "dark" ? "bg-dark-card" : "bg-light-card"
            } shadow-lg animate-slide-up`}
          >
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-primary/20">
                <thead>
                  <tr
                    className={`${
                      theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
                    }`}
                  >
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                      }`}
                    >
                      Utilisateur
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                      }`}
                    >
                      Plan
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                      }`}
                    >
                      Début
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                      }`}
                    >
                      Fin
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                      }`}
                    >
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-primary/20">
                  {filteredSubscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className={`${
                        theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                      } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                        theme === "light" ? "hover:bg-light-primary/10" : ""
                      }`}
                    >
                      <td
                        className={`px-6 py-4 max-w-[200px] truncate font-sans text-sm ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                      >
                        <span title={`${sub.user.name} (${sub.user.email})`}>
                          {sub.user.name} ({sub.user.email})
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                      >
                        {sub.plan.name}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                      >
                        {format(new Date(sub.startDate), "dd/MM/yyyy")}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                      >
                        {format(new Date(sub.endDate), "dd/MM/yyyy")}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                          sub.status === "active" ? "text-green-500" : theme === "dark" ? "text-dark-danger" : "text-light-danger"
                        }`}
                      >
                        {sub.status === "active" ? "Actif" : "Expiré"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4 p-4">
              {filteredSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={`rounded-lg border border-dark-primary/30 p-4 ${
                    theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                  } shadow animate-slide-up`}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedSubscriptionId(expandedSubscriptionId === sub.id ? null : sub.id)}
                  >
                    <div>
                      <p
                        className={`font-medium font-sans text-sm truncate max-w-[200px] ${
                          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                        }`}
                        title={`${sub.user.name} (${sub.user.email})`}
                      >
                        {sub.user.name} ({sub.user.email})
                      </p>
                      <p
                        className={`text-xs font-sans ${
                          theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                        }`}
                      >
                        {sub.plan.name}
                      </p>
                    </div>
                    {expandedSubscriptionId === sub.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  {expandedSubscriptionId === sub.id && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span
                          className={`font-medium font-sans ${
                            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                          }`}
                        >
                          Début:
                        </span>
                        <span
                          className={`font-sans ${
                            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                          }`}
                        >
                          {format(new Date(sub.startDate), "dd/MM/yyyy")}
                        </span>
                        <span
                          className={`font-medium font-sans ${
                            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                          }`}
                        >
                          Fin:
                        </span>
                        <span
                          className={`font-sans ${
                            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                          }`}
                        >
                          {format(new Date(sub.endDate), "dd/MM/yyyy")}
                        </span>
                        <span
                          className={`font-medium font-sans ${
                            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                          }`}
                        >
                          Statut:
                        </span>
                        <span
                          className={`font-sans ${
                            sub.status === "active" ? "text-green-500" : theme === "dark" ? "text-dark-danger" : "text-light-danger"
                          }`}
                        >
                          {sub.status === "active" ? "Actif" : "Expiré"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`p-4 sm:p-6 rounded-xl w-11/12 max-w-md border border-dark-primary/50 ${
              theme === "dark"
                ? "bg-dark-card text-dark-text-primary"
                : "bg-light-card text-light-text-primary"
            } shadow-lg transform transition-all duration-300 animate-slide-up`}
          >
            {modalType === "edit" && selectedPlan && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 font-sans">Modifier le plan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Nom</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Prix (FCFA/mois)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Limites</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-sans">Liens</label>
                        <input
                          type="number"
                          value={formData.limits.links}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, links: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                            theme === "dark"
                              ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                              : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                          } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                            theme === "light" ? "focus:ring-light-primary" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans">QR Codes</label>
                        <input
                          type="number"
                          value={formData.limits.qrCodes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, qrCodes: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                            theme === "dark"
                              ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                              : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                          } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                            theme === "light" ? "focus:ring-light-primary" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans">Téléchargements</label>
                        <input
                          type="number"
                          value={formData.limits.downloads}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, downloads: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                            theme === "dark"
                              ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                              : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                          } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                            theme === "light" ? "focus:ring-light-primary" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans">Taille fichier (MB)</label>
                        <input
                          type="number"
                          value={formData.limits.fileSize}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, fileSize: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
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
                  <div>
                    <label className="block text-sm font-medium font-sans">
                      Fonctionnalités (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.features.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: e.target.value.split(",").map((f) => f.trim()).filter((f) => f),
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3 justify-end">
                    <button
                      onClick={() => setModalType(null)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                          : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleUpdatePlan}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-sans bg-dark-primary text-dark-text-primary hover:bg-dark-secondary transition-all animate-pulse hover:animate-none ${
                        theme === "light" ? "bg-light-primary text-dark-text-primary hover:bg-dark-secondary" : ""
                      }`}
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === "add" && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 font-sans">Ajouter un plan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Nom</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Prix (FCFA/mois)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Limites</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-sans">Liens</label>
                        <input
                          type="number"
                          value={formData.limits.links}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { links: Number(e.target.value), qrCodes: Number(formData.limits.qrCodes), downloads: Number(formData.limits.downloads), fileSize: Number(formData.limits.fileSize)},
                            })
                          }
                        min="0"
                        className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                          theme === "dark"
                          ? "bg-dark-text-primary" : "bg-light-text-dark"
                        } focus:outline-none bg-dark-bg-dark text-dark-text-dark hover:bg-dark:hover:bg-dark-bg-dark text-dark-text-dark-bg-dark transition-all ${
                          theme === "light" ? "bg-light-bg-light text-dark-bg-light" : ""
                        }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans">QR Codes</label>
                        <input
                          type="number"
                          value={formData.limits.qrCodes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, qrCodes: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                            theme === "dark"
                              ? "bg-dark-bg-dark text-dark-text-dark" : "bg-light-bg-light text-dark-bg-light"
                          } focus:outline-none bg-dark-bg-dark text-dark-text-dark hover:bg-dark-bg-dark text-dark-bg-dark transition-all ${
                            theme === "light" ? "bg-light-bg-light text-dark-bg-light" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans">Téléchargements</label>
                        <input
                          type="number"
                          value={formData.limits.downloads}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, downloads: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                            theme === "dark"
                              ? "bg-dark-bg-dark text-dark-text-dark" : "bg-light-bg-light text-dark-bg-light"
                          } focus:outline-none bg-dark-bg-dark text-dark-text-dark hover:bg-dark-bg-dark text-dark-bg-dark transition-all ${
                            theme === "light" ? "bg-light-bg-light text-dark-bg-light" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans">Taille fichier (MB)</label>
                        <input
                          type="number"
                          value={formData.limits.fileSize}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, fileSize: Number(e.target.value) },
                            })
                          }
                          min="0"
                          className={`w-full px-4 py-2 rounded-lg border-none text-sm font-sans ${
                            theme === "dark"
                              ? "bg-dark-bg-dark text-dark-text-dark" : "bg-light-bg-light text-dark-bg-light"
                          } focus:outline-none bg-dark-bg-dark text-dark-text-dark hover:bg-dark-bg-dark text-dark-bg-dark transition-all ${
                            theme === "light" ? "bg-light-bg-dark text-dark-text-dark-bg-dark" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Fonctionnalités (séparées par des virgules)</label>
                    <input
                      type="text"
                      value={formData.features.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: e.target.value.split(",").map((f) => f.trim()).filter((f) => f),
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border-none text-sm sm:text-base font-sans ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                    <div className="flex gap-2 sm:gap-3 justify-end">
                      <button
                        onClick={() => setModalType(null)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-sans ${
                          theme === "dark"
                            ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                            : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                        } transition-all`}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleCreatePlan}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-sans bg-dark-primary text-dark-text-primary hover:bg-dark-secondary transition-all animate-pulse hover:animate-none ${
                          theme === "light" ? "bg-light-primary text-dark-text-primary hover:bg-dark-secondary" : ""
                        }`}
                      >
                        Créer
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

export default AdminPlanManager;