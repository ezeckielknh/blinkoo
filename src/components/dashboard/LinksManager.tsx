import { useState, useEffect } from "react";
import { Link2, Copy, ExternalLink, Trash2, Edit2 } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { API } from "../../utils/api"; // ← fichier centralisé
import { Link } from "react-router-dom";

const LinksManager = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCode, setNewCode] = useState("");

  const fetchLinks = async () => {
    interface ResponseData {
      links: any[];
    }
    try {
      const response = await axios.get<ResponseData>(API.SHORT_LINKS.GET_ALL, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setLinks(response.data.links || []);
    } catch {
      addToast("Impossible de charger vos liens", "error");
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
        email: user ? undefined : prompt("Entrez votre email"),
      };
      const headers = user
        ? { Authorization: `Bearer ${user.token}` }
        : undefined;
      await axios.post(endpoint, payload, { headers });
      addToast("Lien créé avec succès !", "success");
      setUrl("");
      setTitle("");
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

  const handleEditClick = (link: any) => {
    setSelectedLink(link);
    setNewTitle(link.title);
    setNewUrl(link.original_url);
    setNewCode(link.short_code);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedLink) return;
    try {
      await axios.put(
        `${API.SHORT_LINKS.UPDATE}/${selectedLink.id}`,
        {
          code: newCode,
          original_url: newUrl,
          title: newTitle,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      addToast("Lien modifié avec succès", "success");
      setEditModalOpen(false);
      await fetchLinks();
    } catch (err: any) {
      addToast(
        err.response?.data?.error || "Erreur lors de la mise à jour",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gérer vos liens</h1>
      </div>

      {/* Formulaire de création */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Créer un nouveau lien</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <input
              type="url"
              placeholder="Entrez votre URL longue ici"
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="form-label">Titre (optionnel)</label>
            <input
              type="text"
              placeholder="Nom du lien (ex. Campagne Facebook)"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
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

      {/* Tableau des liens */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Modifier le lien</h3>
            <div className="space-y-3">
              <input
                type="text"
                className="form-input w-full"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre"
              />
              <input
                type="url"
                className="form-input w-full"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL originale"
              />
              <input
                type="text"
                className="form-input w-full"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Code personnalisé"
              />
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button onClick={handleUpdate} className="btn btn-primary">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Vos liens</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">Titre</th>
                <th className="text-left py-3 px-4">Lien court</th>
                <th className="text-center py-3 px-4">Clics</th>
                <th className="text-center py-3 px-4">Statut</th>
                <th className="text-center py-3 px-4">Créé le</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr
                  key={link.id}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Link2 size={16} className="text-primary mr-2" />
                      <span className="font-medium">
                        {link.title || "Sans titre"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate max-w-xs">
                      {link.original_url}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-primary">{link.short_link}</span>
                      <CopyToClipboard
                        text={API.SHORT_LINKS.URL + link.short_code}
                        onCopy={() =>
                          addToast(
                            "Lien copié dans le presse-papiers",
                            "success"
                          )
                        }
                      >
                        <button>
                          <Copy size={14} />
                        </button>
                      </CopyToClipboard>
                      <Link to={API.SHORT_LINKS.URL + link.short_code} target="_blank" >
                        <ExternalLink size={14}/>
                      </Link>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    {link.click_count || 0}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        link.is_active
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {link.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-400">
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(link)}
                        className="p-2 hover:bg-gray-800 rounded"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-800 rounded text-danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Aucun lien trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LinksManager;
