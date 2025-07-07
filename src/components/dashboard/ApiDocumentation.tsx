import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Copy, Key } from "lucide-react";
import axios from "axios";
import { API } from "../../utils/api";

interface ApiKeyResponse {
  api_key: string;
}

const ApiDocumentation = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch API key on component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user?.token) {
        setError("Utilisateur non authentifié.");
        return;
      }
      try {
        const response = await axios.get<ApiKeyResponse>(API.USERS.GET_API_KEY, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setApiKey(response.data.api_key);
        console.log("API Key fetched:", response.data.api_key);
      } catch (err: any) {
        console.error("API Key fetch error:", err);
        setError(
          err?.response?.data?.error || "Erreur lors de la récupération de la clé API."
        );
      }
    };
    fetchApiKey();
  }, [user]);

  // Copy text to clipboard with fallback
  const copyToClipboard = (text: string, key: string) => {
    if (!text) {
      console.warn(`No text to copy for key: ${key}`);
      return;
    }

    // Check if clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied((prev) => ({ ...prev, [key]: true }));
          setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
        })
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          setError("Impossible de copier le texte. Essayez manuellement.");
        });
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
        setError("Impossible de copier le texte. Essayez manuellement.");
      }
      document.body.removeChild(textArea);
    }
  };

  // Helper to format endpoint URLs
  const formatEndpointUrl = (base: string | ((param: string) => string), param?: string) => {
    if (typeof base === "function") {
      return base(param || "example");
    }
    return base;
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-lg max-w-4xl mx-auto ${
        theme === "dark" ? "bg-dark-card text-dark-text-primary" : "bg-light-card text-light-text-primary"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">Documentation de l'API</h1>

      {/* API Key Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Votre Clé API</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {apiKey ? (
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-lg flex-1 ${
                theme === "dark" ? "bg-dark-background" : "bg-gray-100"
              }`}
            >
              <code className="text-sm">{apiKey}</code>
            </div>
            <button
              onClick={() => copyToClipboard(apiKey, "apiKey")}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-dark-primary text-white hover:bg-dark-primary/80"
                  : "bg-light-primary text-white hover:bg-light-primary/80"
              }`}
              title="Copier la clé API"
            >
              <Copy size={20} />
            </button>
          </div>
        ) : (
          <p>Chargement de la clé API...</p>
        )}
        {copied.apiKey && (
          <p className="text-green-500 text-sm mt-2">Clé copiée dans le presse-papiers !</p>
        )}
      </section>

      {/* API Endpoints Documentation */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Endpoints Disponibles</h2>

        {/* Create Short Link */}
        <div className="mb-6">
          <h3 className="text-lg font-medium">Créer un Lien Raccourci</h3>
          <div className="flex items-center mt-2">
            <p>
              <strong>POST</strong>{" "}
              <code>{formatEndpointUrl(API.EXTERNAL_LINKS.CREATE)}</code>
            </p>
            <button
              onClick={() => copyToClipboard(formatEndpointUrl(API.EXTERNAL_LINKS.CREATE), "create")}
              className={`ml-2 p-1 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-dark-primary text-white hover:bg-dark-primary/80"
                  : "bg-light-primary text-white hover:bg-light-primary/80"
              }`}
              title="Copier l'URL"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied.create && (
            <p className="text-green-500 text-sm mt-1">URL copiée !</p>
          )}
          <p className="mt-2">Crée un nouveau lien raccourci.</p>
          <div
            className={`p-4 rounded-lg mt-2 ${
              theme === "dark" ? "bg-dark-background" : "bg-gray-100"
            }`}
          >
            <p className="font-semibold">En-têtes:</p>
            <pre className="text-sm">
              Authorization: Bearer {"{votre_clé_api}"}
            </pre>
            <p className="font-semibold mt-2">Corps de la requête (JSON):</p>
            <pre className="text-sm">
              {`{
  "original_url": "https://example.com",
  "title": "Mon lien",
  "code": "customCode" // Optionnel
}`}
            </pre>
            <p className="font-semibold mt-2">Réponse (succès):</p>
            <pre className="text-sm">
              {`{
  "message": "Lien raccourci créé avec succès.",
  "short_link": "http://yourdomain.com/customCode",
  "expires_at": "2025-07-11T14:38:00Z",
  "user": { ... }
}`}
            </pre>
          </div>
        </div>

        {/* List Short Links */}
        <div className="mb-6">
          <h3 className="text-lg font-medium">Lister les Liens Raccourcis</h3>
          <div className="flex items-center mt-2">
            <p>
              <strong>GET</strong>{" "}
              <code>{formatEndpointUrl(API.EXTERNAL_LINKS.LIST)}</code>
            </p>
            <button
              onClick={() => copyToClipboard(formatEndpointUrl(API.EXTERNAL_LINKS.LIST), "list")}
              className={`ml-2 p-1 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-dark-primary text-white hover:bg-dark-primary/80"
                  : "bg-light-primary text-white hover:bg-light-primary/80"
              }`}
              title="Copier l'URL"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied.list && (
            <p className="text-green-500 text-sm mt-1">URL copiée !</p>
          )}
          <p className="mt-2">Récupère la liste des liens raccourcis de l'utilisateur.</p>
          <div
            className={`p-4\{\{continued\}\} rounded-lg mt-2 ${
              theme === "dark" ? "bg-dark-background" : "bg-gray-100"
            }`}
          >
            <p className="font-semibold">En-têtes:</p>
            <pre className="text-sm">
              Authorization: Bearer {"{votre_clé_api}"}
sony
            </pre>
            <p className="font-semibold mt-2">Réponse:</p>
            <pre className="text-sm">
              {`{
  "links": [
    {
      "id": 1,
      "original_url": "https://example.com",
      "short_code": "abc123",
      "title": "Mon lien",
      "is_active": true,
      "expires_at": "2025-07-11T14:38:00Z",
      "clicks": [ ... ]
    },
    ...
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Show Short Link */}
        <div className="mb-6">
          <h3 className="text-lg font-medium">Voir les Détails d'un Lien</h3>
          <div className="flex items-center mt-2">
            <p>
              <strong>GET</strong>{" "}
              <code>{formatEndpointUrl(API.EXTERNAL_LINKS.SHOW, "short_code")}</code>
            </p>
            <button
              onClick={() =>
                copyToClipboard(formatEndpointUrl(API.EXTERNAL_LINKS.SHOW, "short_code"), "show")
              }
              className={`ml-2 p-1 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-dark-primary text-white hover:bg-dark-primary/80"
                  : "bg-light-primary text-white hover:bg-light-primary/80"
              }`}
              title="Copier l'URL"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied.show && (
            <p className="text-green-500 text-sm mt-1">URL copiée !</p>
          )}
          <p className="mt-2">Récupère les détails d'un lien raccourci spécifique.</p>
          <div
            className={`p-4 rounded-lg mt-2 ${
              theme === "dark" ? "bg-dark-background" : "bg-gray-100"
            }`}
          >
            <p className="font-semibold">En-têtes:</p>
            <pre className="text-sm">
              Authorization: Bearer {"{votre_clé_api}"}
            </pre>
            <p className="font-semibold mt-2">Réponse:</p>
            <pre className="text-sm">
              {`{
  "link": {
    "id": 1,
    "original_url": "https://example.com",
    "short_code": "abc123",
    "title": "Mon lien",
    "is_active": true,
    "expires_at": "2025-07-11T14:38:00Z",
    "clicks": [ ... ]
  },
  "clicks": [ ... ]
}`}
            </pre>
          </div>
        </div>

        {/* Update Short Link */}
        <div className="mb-6">
          <h3 className="text-lg font-medium">Mettre à Jour un Lien</h3>
          <div className="flex items-center mt-2">
            <p>
              <strong>PUT</strong>{" "}
              <code>{formatEndpointUrl(API.EXTERNAL_LINKS.UPDATE, "id")}</code>
            </p>
            <button
              onClick={() =>
                copyToClipboard(formatEndpointUrl(API.EXTERNAL_LINKS.UPDATE, "id"), "update")
              }
              className={`ml-2 p-1 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-dark-primary text-white hover:bg-dark-primary/80"
                  : "bg-light-primary text-white hover:bg-light-primary/80"
              }`}
              title="Copier l'URL"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied.update && (
            <p className="text-green-500 text-sm mt-1">URL copiée !</p>
          )}
          <p className="mt-2">Met à jour les détails d'un lien raccourci.</p>
          <div
            className={`p-4 rounded-lg mt-2 ${
              theme === "dark" ? "bg-dark-background" : "bg-gray-100"
            }`}
          >
            <p className="font-semibold">En-têtes:</p>
            <pre className="text-sm">
              Authorization: Bearer {"{votre_clé_api}"}
            </pre>
            <p className="font-semibold mt-2">Corps de la requête (JSON):</p>
            <pre className="text-sm">
              {`{
  "code": "newCode",
  "original_url": "https://new-example.com",
  "title": "Nouveau titre",
  "is_active": true,
  "expires_at": "2025-08-11T14:38:00Z"
}`}
            </pre>
            <p className="font-semibold mt-2">Réponse:</p>
            <pre className="text-sm">
              {`{
  "message": "Lien mis à jour avec succès.",
  "short_link": {
    "id": 1,
    "original_url": "https://new-example.com",
    "short_code": "newCode",
    ...
  },
  "full_short_link": "http://yourdomain.com/newCode"
}`}
            </pre>
          </div>
        </div>

        {/* Delete Short Link */}
        <div className="mb-6">
          <h3 className="text-lg font-medium">Supprimer un Lien</h3>
          <div className="flex items-center mt-2">
            <p>
              <strong>DELETE</strong>{" "}
              <code>{formatEndpointUrl(API.EXTERNAL_LINKS.DELETE, "short_code")}</code>
            </p>
            <button
              onClick={() =>
                copyToClipboard(formatEndpointUrl(API.EXTERNAL_LINKS.DELETE, "short_code"), "delete")
              }
              className={`ml-2 p-1 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-dark-primary text-white hover:bg-dark-primary/80"
                  : "bg-light-primary text-white hover:bg-light-primary/80"
              }`}
              title="Copier l'URL"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied.delete && (
            <p className="text-green-500 text-sm mt-1">URL copiée !</p>
          )}
          <p className="mt-2">Supprime un lien raccourci.</p>
          <div
            className={`p-4 rounded-lg mt-2 ${
              theme === "dark" ? "bg-dark-background" : "bg-gray-100"
            }`}
          >
            <p className="font-semibold">En-têtes:</p>
            <pre className="text-sm">
              Authorization: Bearer {"{votre_clé_api}"}
            </pre>
            <p className="font-semibold mt-2">Réponse:</p>
            <pre className="text-sm">
              {`{
  "message": "Lien supprimé avec succès."
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Notes Importantes</h2>
        <ul
          className={`list-disc pl-5 space-y-2 ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          }`}
        >
          <li>Utilisez votre clé API dans l'en-tête <code>Authorization</code> pour toutes les requêtes.</li>
          <li>Les utilisateurs du plan gratuit sont limités à 15 liens par mois.</li>
          <li>Les liens expirent après 14 jours pour le plan gratuit, 2 mois pour le plan premium, et sont illimités pour le plan enterprise.</li>
          <li>Assurez-vous que l'<code>original_url</code> est une URL valide.</li>
          <li>Le champ <code>code</code> est optionnel ; un code aléatoire est généré si non spécifié.</li>
        </ul>
      </section>
    </div>
  );
};

export default ApiDocumentation;