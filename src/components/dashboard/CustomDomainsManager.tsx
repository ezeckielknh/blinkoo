import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Lock, Plus, CheckCircle, Info, X } from "lucide-react"; // Ajout d'icônes supplémentaires
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API } from "../../utils/api";

type Domain = {
  id: string;
  domain: string;
  status: string;
  verification_token?: string;
};

const CustomDomainsManager = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null); // Instructions globales
  const [showDomainInfo, setShowDomainInfo] = useState<string | null>(null); // État pour l'info d'un domaine spécifique

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await API.CUSTOM_DOMAINS.GET_ALL();
      if (response.status === 200) {
        setDomains((response.data as { data: Domain[] }).data || []);
      } else {
        toast.error("Erreur lors du chargement des domaines.");
      }
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  const handleAddDomain = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const trimmedDomain = newDomain.trim();
    if (!trimmedDomain) {
      toast.error("Veuillez entrer un domaine.");
      return;
    }

    if (!/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(trimmedDomain)) {
      toast.error("Veuillez entrer un domaine valide (ex: monlien.com).");
      return;
    }

    setLoading(true);
    try {
      const response = await API.CUSTOM_DOMAINS.CREATE(trimmedDomain );
      if (response.status === 201) {
        toast.success("Domaine ajouté avec succès.");
        setNewDomain("");
        fetchDomains();
        const data = response.data as { instructions?: string };
        setInstructions(data.instructions || "Aucune instruction disponible.");
      } else {
        toast.error(
          typeof response.data === "object" &&
            response.data &&
            "message" in response.data
            ? (response.data as { message?: string }).message
            : "Erreur lors de l'ajout du domaine."
        );
      }
    } catch (error) {
      toast.error(
        "Une erreur est survenue: " +
          (typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as any).response === "object"
            ? (error as any).response?.data?.message
            : (error as Error).message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const response = (await API.CUSTOM_DOMAINS.VERIFY(id)) as {
        status: number;
        data: { message?: string; [key: string]: any };
      };
      if (response.status === 200) {
        toast.success("Domaine vérifié avec succès!");
        fetchDomains();
      } else {
        toast.error(response.data.message || "Vérification échouée.");
      }
    } catch (error) {
      toast.error(
        "Une erreur est survenue: " +
          (typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as any).response === "object"
            ? (error as any).response?.data?.message
            : error instanceof Error
            ? error.message
            : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInstructions = () => {
    setInstructions(null);
  };

  const handleShowDomainInfo = (id: string) => {
    const domain = domains.find((d) => d.id === id);
    if (domain) {
      setShowDomainInfo(id);
      setInstructions(
        domain.status === "verified"
          ? "Ce domaine a été vérifié avec succès le " +
            new Date().toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) +
            " WAT."
          : `Instructions pour ${domain.domain} :\n- Ajoutez cet enregistrement TXT à votre panneau DNS :\n  - Nom: @\n  - Type: TXT\n  - Valeur: ${domain.verification_token}\n  - TTL: 3600`
      );
    }
  };

  const handleCloseDomainInfo = () => {
    setShowDomainInfo(null);
    setInstructions(null);
  };

  if (
    !user ||
    (!user.plan &&
      !((user.access as { trial_status?: string })?.trial_status === "active"))
  ) {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-4" />
          <p>Cette fonctionnalité est réservée aux plans Premium et Enterprise.</p>
          <button
            className={`mt-4 px-4 py-2 rounded-lg font-sans text-sm font-medium ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
            }`}
          >
            <Plus size={16} className="inline mr-2" />
            Passer à Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2
        className={`text-2xl font-semibold mb-6 font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        <CheckCircle size={24} className="inline mr-2" />
        Gestion des Domaines Personnalisés
      </h2>

      {/* Formulaire d'ajout de domaine */}
      <form onSubmit={handleAddDomain} className="mb-8">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="Entrez votre domaine (ex: monlien.com)"
            className={`flex-1 p-2 rounded-lg border ${
              theme === "dark"
                ? "bg-dark-card border-dark-primary/30 text-dark-text-primary"
                : "bg-light-card border-light-primary/30 text-light-text-primary"
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium flex items-center ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
            } ${loading ? "opacity-50" : ""}`}
          >
            {loading ? (
              <>
                <X size={16} className="mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </form>

      {/* Liste des domaines */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className={`p-4 rounded-lg border ${
              theme === "dark"
                ? "bg-dark-card border-dark-primary/30"
                : "bg-light-card border-light-primary/30"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p
                  className={`text-lg font-medium ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  {domain.domain}
                </p>
                <p
                  className={`text-sm ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Statut: {domain.status}
                </p>
                {domain.verification_token && domain.status === "pending" && (
                  <p
                    className={`text-sm mt-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Token: {domain.verification_token}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {domain.status === "pending" && (
                  <button
                    onClick={() => handleVerifyDomain(domain.id)}
                    disabled={loading}
                    className={`px-2 py-1 rounded-lg font-sans text-sm font-medium flex items-center ${
                      theme === "dark"
                        ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                        : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                    } ${loading ? "opacity-50" : ""}`}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Vérifier
                  </button>
                )}
                <button
                  onClick={() => handleShowDomainInfo(domain.id)}
                  className={`p-1 rounded-full ${
                    theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                      : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                  }`}
                >
                  <Info size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {domains.length === 0 && (
          <p
            className={`text-center ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Aucun domaine personnalisé ajouté.
          </p>
        )}
      </div>

      {/* Affichage des instructions après ajout ou info domaine */}
      {instructions && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            theme === "dark"
              ? "bg-dark-card border-dark-primary/30 text-dark-text-primary"
              : "bg-light-card border-light-primary/30 text-light-text-primary"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
            }`}
          >
            {showDomainInfo ? "Détails du Domaine" : "Instructions de Configuration DNS"}
          </h3>
          <p className="mt-2 whitespace-pre-wrap">{instructions}</p>
          <button
            onClick={handleCloseDomainInfo}
            className={`mt-4 px-4 py-2 rounded-lg font-sans text-sm font-medium ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
            }`}
          >
            <X size={16} className="inline mr-2" />
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomDomainsManager;