import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { API } from "../../utils/api";
import { CreditCard, Search, Info, Repeat, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Transaction {
  id: string;
  token: string;
  user: User;
  amount: number;
  type: "subscription" | "purchase";
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

const AdminTransactionManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    userId: "all",
    type: "all",
    dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<"details" | "replay" | "markSuccess" | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  // Debounced fetch transactions
  const debouncedFetchTransactions = useCallback(
    debounce(async () => {
      if (user?.role !== "admin" && user?.role !== "super_admin") return;
      try {
        setLoading(true);
        setError(null);
        const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
        const response = await api.GET_TRANSACTIONS({});
        const transactionsData = response.data as any[];
        const transformedTransactions = transactionsData.map((txn: any) => ({
          id: txn.id.toString(),
          token: txn.token,
          user: txn.user
            ? {
                id: txn.user.id.toString(),
                name: txn.user.name,
                email: txn.user.email,
              }
            : {
                id: "",
                name: "Utilisateur inconnu",
                email: "",
              },
          amount: parseFloat(txn.amount) || 0,
          type: txn.type as "subscription" | "purchase",
          status: txn.status as "pending" | "completed" | "failed",
          createdAt: txn.created_at,
        }));
        setTransactions(transformedTransactions);
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        setError("Impossible de charger les transactions. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des transactions.", {
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
    debouncedFetchTransactions();
    return () => debouncedFetchTransactions.cancel();
  }, [debouncedFetchTransactions]);

  // Extract unique users for filter dropdown
  const users = useMemo(() => {
    const uniqueUsers = Array.from(
      new Map(transactions.map((txn) => [txn.user.id, txn.user])).values()
    );
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  // Filter transactions on frontend
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = filters.userId === "all" || txn.user.id === "all";
      const matchesType = filters.type === "all" || txn.type === filters.type;
      const txnDate = new Date(txn.createdAt);
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
      const matchesDate = (!dateFrom || txnDate >= dateFrom) && (!dateTo || txnDate <= dateTo);

      return matchesSearch && matchesUser && matchesType && matchesDate;
    });
  }, [transactions, searchTerm, filters]);

  // Handle admin actions
  const handleViewDetails = async (transactionId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      const response = await api.GET_TRANSACTION(transactionId);
      const txnData = response.data as any;
      const transformedTransaction: Transaction = {
        id: txnData.id.toString(),
        token: txnData.token,
        user: txnData.user
          ? {
              id: txnData.user.id.toString(),
              name: txnData.user.name,
              email: txnData.user.email,
            }
          : {
              id: "",
              name: "Utilisateur inconnu",
              email: "",
            },
        amount: parseFloat(txnData.amount) || 0,
        type: txnData.type as "subscription" | "purchase",
        status: txnData.status as "pending" | "completed" | "failed",
        createdAt: txnData.created_at,
      };
      setSelectedTransaction(transformedTransaction);
      setModalType("details");
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      toast.error("Erreur lors du chargement des détails de la transaction.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleReplayTransaction = async (transactionId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      // Optimistic update
      setTransactions(
        transactions.map((t) =>
          t.id === transactionId ? { ...t, status: "pending" } : t
        )
      );
      const response = await api.REPLAY_TRANSACTION(transactionId);
      toast.success((response.data as { message: string }).message, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err: any) {
      console.error("Error replaying transaction:", err);
      // Revert optimistic update
      setTransactions(
        transactions.map((t) =>
          t.id === transactionId ? { ...t, status: "failed" } : t
        )
      );
      toast.error(
        err.response?.data?.message || "Erreur lors du rejeu de la transaction.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        }
      );
    }
  };

  const handleMarkSuccess = async (transactionId: string) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      // Optimistic update
      setTransactions(
        transactions.map((t) =>
          t.id === transactionId ? { ...t, status: "completed" } : t
        )
      );
      const response = await api.MARK_SUCCESS_TRANSACTION(transactionId);
      toast.success((response.data as { message: string }).message, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err: any) {
      console.error("Error marking transaction as success:", err);
      // Revert optimistic update
      setTransactions(
        transactions.map((t) =>
          t.id === transactionId ? { ...t, status: "pending" } : t
        )
      );
      toast.error(
        err.response?.data?.message || "Erreur lors du marquage comme réussi.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        }
      );
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
          onClick={() => debouncedFetchTransactions()}
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
        Gestion des Transactions
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
                placeholder="Rechercher par jeton ou utilisateur..."
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
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
              <option value="subscription">Abonnement</option>
              <option value="purchase">Achat</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
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
      </div>

      {/* Transactions Table */}
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
                  Jeton
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Utilisateur
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Montant
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
                  Statut
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Date
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
              {filteredTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={`${
                    theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                  } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                    theme === "light" ? "hover:bg-light-primary/10" : ""
                  }`}
                >
                  <td
                    className={`px-6 py-4 max-w-[120px] truncate font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    <span title={txn.token}>{txn.token}</span>
                  </td>
                  <td
                    className={`px-6 py-4 max-w-[200px] truncate font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    <span title={`${txn.user.name} (${txn.user.email})`}>
                      {txn.user.name} ({txn.user.email})
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {txn.amount.toFixed(2)} FCFA
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {txn.type === "subscription" ? "Abonnement" : "Achat"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      txn.status === "completed"
                        ? "text-green-500"
                        : txn.status === "failed"
                        ? theme === "dark"
                          ? "text-dark-danger"
                          : "text-light-danger"
                        : "text-yellow-500"
                    }`}
                  >
                    {txn.status === "completed"
                      ? "Réussi"
                      : txn.status === "failed"
                      ? "Échoué"
                      : "En attente"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {format(new Date(txn.createdAt), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(txn.id)}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Détails"
                      >
                        <Info size={16} />
                      </button>
                      {txn.status === "failed" && (
                        <button
                          onClick={() => {
                            setSelectedTransaction(txn);
                            setModalType("replay");
                          }}
                          className={`p-2 rounded-lg ${
                            theme === "dark"
                              ? "text-yellow-500 hover:bg-dark-background/70"
                              : "text-yellow-500 hover:bg-light-background/70"
                          } transition-all animate-pulse hover:animate-none`}
                          title="Rejouer vérification"
                        >
                          <Repeat size={16} />
                        </button>
                      )}
                      {txn.status !== "completed" && (
                        <button
                          onClick={() => {
                            setSelectedTransaction(txn);
                            setModalType("markSuccess");
                          }}
                          className={`p-2 rounded-lg ${
                            theme === "dark"
                              ? "text-green-500 hover:bg-dark-background/70"
                              : "text-green-500 hover:bg-light-background/70"
                          } transition-all animate-pulse hover:animate-none`}
                          title="Marquer comme réussi"
                        >
                          <CheckCircle size={16} />
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
          {filteredTransactions.map((txn) => (
            <div
              key={txn.id}
              className={`rounded-lg border border-dark-primary/30 p-4 ${
                theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
              } shadow animate-slide-up`}
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedTransactionId(expandedTransactionId === txn.id ? null : txn.id)}
              >
                <div>
                  <p
                    className={`font-medium font-sans text-sm truncate max-w-[200px] ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                    title={txn.token}
                  >
                    {txn.token}
                  </p>
                  <p
                    className={`text-xs font-sans ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {txn.amount.toFixed(2)} FCFA
                  </p>
                </div>
                {expandedTransactionId === txn.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedTransactionId === txn.id && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Utilisateur:
                    </span>
                    <span
                      className={`font-sans truncate max-w-[150px] ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                      title={`${txn.user.name} (${txn.user.email})`}
                    >
                      {txn.user.name} ({txn.user.email})
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Type:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {txn.type === "subscription" ? "Abonnement" : "Achat"}
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
                        txn.status === "completed"
                          ? "text-green-500"
                          : txn.status === "failed"
                          ? theme === "dark"
                            ? "text-dark-danger"
                            : "text-light-danger"
                          : "text-yellow-500"
                      }`}
                    >
                      {txn.status === "completed"
                        ? "Réussi"
                        : txn.status === "failed"
                        ? "Échoué"
                        : "En attente"}
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Date:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {format(new Date(txn.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(txn.id)}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                      title="Détails"
                    >
                      <Info size={16} />
                    </button>
                    {txn.status === "failed" && (
                      <button
                        onClick={() => {
                          setSelectedTransaction(txn);
                          setModalType("replay");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-yellow-500 hover:bg-dark-background/70"
                            : "text-yellow-500 hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Rejouer vérification"
                      >
                        <Repeat size={16} />
                      </button>
                    )}
                    {txn.status !== "completed" && (
                      <button
                        onClick={() => {
                          setSelectedTransaction(txn);
                          setModalType("markSuccess");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-green-500 hover:bg-dark-background/70"
                            : "text-green-500 hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Marquer comme réussi"
                      >
                        <CheckCircle size={16} />
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
      {modalType && selectedTransaction && (
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
                  Détails de la transaction
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Jeton</label>
                    <p className="text-sm font-sans">{selectedTransaction.token}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Utilisateur</label>
                    <p className="text-sm font-sans">
                      {selectedTransaction.user.name} ({selectedTransaction.user.email})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Montant</label>
                    <p className="text-sm font-sans">{selectedTransaction.amount.toFixed(2)} FCFA</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Type</label>
                    <p className="text-sm font-sans">
                      {selectedTransaction.type === "subscription" ? "Abonnement" : "Achat"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Statut</label>
                    <p
                      className={`text-sm font-sans ${
                        selectedTransaction.status === "completed"
                          ? "text-green-500"
                          : selectedTransaction.status === "failed"
                          ? theme === "dark"
                            ? "text-dark-danger"
                            : "text-light-danger"
                          : "text-yellow-500"
                      }`}
                    >
                      {selectedTransaction.status === "completed"
                        ? "Réussi"
                        : selectedTransaction.status === "failed"
                        ? "Échoué"
                        : "En attente"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Date</label>
                    <p className="text-sm font-sans">
                      {format(new Date(selectedTransaction.createdAt), "dd/MM/yyyy HH:mm")}
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

            {modalType === "replay" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Rejouer la vérification
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous rejouer la vérification de la transaction {selectedTransaction.token} ? Cela tentera de vérifier à nouveau le paiement.
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
                    onClick={() => handleReplayTransaction(selectedTransaction.id)}
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

            {modalType === "markSuccess" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Marquer comme réussi
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous marquer la transaction {selectedTransaction.token} comme réussie ? Cette action est irréversible.
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
                    onClick={() => handleMarkSuccess(selectedTransaction.id)}
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

export default AdminTransactionManager;