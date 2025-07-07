import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileBox,
  Upload,
  Download,
  Trash2,
  Link2,
  Lock,
  BarChart3,
  Loader2,
  Mail,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useTheme } from "../../contexts/ThemeContext";
import { API } from "../../utils/api";
import Modal from "../Modal";
import { Link } from "react-router-dom";
import JSZip from "jszip";

interface FileData {
  id: string;
  original_name: string;
  short_code?: string;
  custom_alias?: string;
  download_count: number;
  expires_at?: string;
  size: number; // Taille du fichier en octets
}

interface UploadProgress {
  fileName: string;
  progress: number;
}

const FileManager = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(API.FILES.GET_ALL, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Erreur de chargement des fichiers", "error");
        return;
      }
      setFiles(data);
    } catch (err) {
      addToast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!user || acceptedFiles.length === 0) return;
      const maxSize = user.plan === "free" ? 100 * 1024 * 1024 : 1024 * 1024 * 1024; // 100 Mo pour free, 1 Go pour Premium/Enterprise
      if (acceptedFiles.some((file) => file.size > maxSize)) {
        addToast(
          `Taille maximale dépassée. Limite : ${
            user.plan === "free" ? "100MB" : "1GB"
          } par fichier`,
          "error"
        );
        return;
      }
      setPendingFiles(acceptedFiles);
      setShowPasswordModal(true);
    },
    [user]
  );

  const confirmUpload = async () => {
    if (!pendingFiles.length || !user) return;

    setUploading(true);
    setShowPasswordModal(false);

    // Calcul de l'espace utilisé à partir des fichiers existants
    const storageUsed = files.reduce((total, file) => {
      return total + file.size;
    }, 0);
    const totalFileSize = pendingFiles.reduce((total, file) => total + file.size, 0);
    const storageLimit = getStorageLimit(user.plan);

    if (storageLimit && storageUsed + totalFileSize > storageLimit) {
      addToast("Espace de stockage dépassé pour votre plan.", "error");
      setUploading(false);
      return;
    }

    let zipFile: File;
    if (pendingFiles.length > 1) {
      const zip = new JSZip();
      pendingFiles.forEach((file) => {
        zip.file(file.name, file);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      zipFile = new File([zipBlob], `archive_${new Date().toISOString().split('T')[0]}.zip`, {
        type: "application/zip",
      });
    } else {
      zipFile = pendingFiles[0];
    }

    const formData = new FormData();
    formData.append("file", zipFile);
    if (tempPassword && user.plan !== "free") formData.append("file_password", tempPassword);
    if (user.plan === "enterprise" && customAlias) formData.append("custom_alias", customAlias);
    if (emailRecipients) formData.append("email_recipients", emailRecipients);

    try {
      // Use XMLHttpRequest for upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", API.FILES.UPLOAD, true);
        xhr.setRequestHeader("Authorization", `Bearer ${user.token}`);

        xhr.upload.onprogress = (progressEvent: ProgressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress([{ fileName: zipFile.name, progress }]);
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              addToast("Fichier(s) téléversé(s) avec succès", "success");
              fetchFiles();
              resolve();
            } else {
              addToast(data?.error || "Erreur lors de l'upload", "error");
              reject(new Error(data?.error || "Erreur lors de l'upload"));
            }
          } catch (e) {
            addToast("Erreur lors de l'upload", "error");
            reject(e);
          }
        };

        xhr.onerror = () => {
          addToast("Erreur réseau", "error");
          reject(new Error("Erreur réseau"));
        };

        xhr.send(formData);
      });
    } catch (err) {
      // Error already handled in xhr.onerror/xhr.onload
    } finally {
      setTempPassword("");
      setCustomAlias("");
      setEmailRecipients("");
      setPendingFiles([]);
      setUploadProgress([]);
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const deleteFile = async (fileId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API.FILES.DELETE}/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Erreur lors de la suppression", "error");
        return;
      }
      addToast("Fichier supprimé", "success");
      fetchFiles();
    } catch (err) {
      addToast("Erreur réseau", "error");
    }
  };

  const copyToClipboard = async (file: FileData) => {
    if (!file.short_code && !file.custom_alias) {
      addToast("Lien du fichier indisponible", "error");
      return;
    }

    const fileUrl = getFileUrl(file);
    if (!fileUrl) {
      addToast("Lien du fichier indisponible", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(fileUrl);
      addToast("Lien copié dans le presse-papier", "success");
    } catch (err) {
      console.error("Clipboard API failed:", err);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = fileUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        addToast("Lien copié dans le presse-papier", "success");
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
        addToast("Impossible de copier le lien", "error");
      }
    }
  };

  const getFileUrl = (file: FileData) => {
    const base = API.DEVBASEURL.endsWith("/") ? API.DEVBASEURL : `${API.DEVBASEURL}/`;
    const code = file.custom_alias || file.short_code;
    return code ? `${base}${code}` : "";
  };

  const getStorageLimit = (plan: string) => {
    switch (plan) {
      case "free":
        return 200 * 1024 * 1024; // 200 Mo
      case "premium":
      case "premium_quarterly":
      case "premium_annual":
        return 10 * 1024 * 1024 * 1024; // 10 Go
      case "enterprise":
        return null; // Illimité
      default:
        return 200 * 1024 * 1024; // Par défaut
    }
  };

  return (
    <div
      className={`min-h-screen p-6 space-y-8 ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <div className="flex items-center justify-between pt-6">
        <h1
          className={`text-3xl font-bold font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Gestion des Fichiers
        </h1>
      </div>

      <div
        className={`rounded-lg border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg p-6 animate-slide-up`}
      >
        <h2
          className={`text-xl font-semibold mb-4 font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Téléverser un Fichier
        </h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-dark-primary bg-dark-primary/10"
              : theme === "dark"
              ? "border-dark-primary/50 hover:border-dark-primary"
              : "border-light-primary/50 hover:border-light-primary"
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            size={48}
            className={`mx-auto mb-4 ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          />
          <p
            className={`text-lg font-medium mb-2 ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            {isDragActive
              ? "Déposez vos fichiers ici"
              : "Glissez & déposez ici"}
          </p>
          <p
            className={`text-sm mb-4 ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            ou cliquez pour choisir
          </p>
          <p
            className={`text-xs ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            Taille max par fichier :{" "}
            {user?.plan === "free" ? "100MB" : "1GB"}
            (plusieurs fichiers possibles, seront zippés)
            <br />
            Stockage total :{" "}
            {getStorageLimit(user?.plan || "free") === null
              ? "Illimité"
              : `${(getStorageLimit(user?.plan || "free")! / (1024 * 1024)).toFixed(
                  0
                )}MB`}
          </p>
        </div>
        {uploading && uploadProgress.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadProgress.map((prog) => (
              <div key={prog.fileName} className="flex flex-col">
                <span
                  className={`text-sm ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  {prog.fileName} ({prog.progress}%)
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      theme === "dark" ? "bg-dark-primary" : "bg-light-primary"
                    }`}
                    style={{ width: `${prog.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className={`rounded-lg border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg p-6 animate-slide-up`}
      >
        <h2
          className={`text-xl font-semibold mb-4 font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Vos Fichiers
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={32}
              className={`animate-spin ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            />
          </div>
        ) : files.length === 0 ? (
          <p
            className={`text-center py-6 ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            Aucun fichier téléversé
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-dark-primary/30">
            <table className="w-full text-sm">
              <thead
                className={`${
                  theme === "dark"
                    ? "bg-dark-background/50"
                    : "bg-light-background/50"
                }`}
              >
                <tr className="border-b border-dark-primary/30">
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Nom
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-medium ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Téléchargements
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-medium ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Statistiques
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-medium ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Expiration
                  </th>
                  <th
                    className={`text-right py-3 px-4 font-medium ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className={`border-b border-dark-primary/30 last:border-0 hover:${
                      theme === "dark"
                        ? "bg-dark-background/30"
                        : "bg-light-background/30"
                    } transition-colors`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FileBox
                          size={20}
                          className={`mr-2 ${
                            theme === "dark"
                              ? "text-dark-primary"
                              : "text-light-primary"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-light-text-primary"
                            }`}
                          >
                            {file.original_name}
                          </p>
                          <a
                            href={file.short_code ? getFileUrl(file) : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm truncate max-w-xs ${
                              theme === "dark"
                                ? "text-dark-text-secondary hover:text-dark-primary"
                                : "text-light-text-secondary hover:text-light-primary"
                            }`}
                          >
                            {file.short_code
                              ? getFileUrl(file)
                              : "Code manquant"}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`text-center py-3 px-4 ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    >
                      {file.download_count}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Link
                        to={`${file.id}/stats`}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "text-dark-primary hover:bg-dark-primary/20"
                            : "text-light-primary hover:bg-light-primary/20"
                        }`}
                        title="Statistiques"
                      >
                        <BarChart3 size={16} />
                        <span className="text-sm">Stats</span>
                      </Link>
                    </td>
                    <td
                      className={`text-center py-3 px-4 ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    >
                      {file.expires_at
                        ? new Date(file.expires_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "Illimité"}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-dark-primary/20 text-dark-text-secondary"
                              : "hover:bg-light-primary/20 text-light-text-secondary"
                          }`}
                          title="Copier lien"
                          onClick={() => copyToClipboard(file)}
                        >
                          <Link2 size={16} />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-dark-primary/20 text-dark-text-secondary"
                              : "hover:bg-light-primary/20 text-light-text-secondary"
                          }`}
                          title="Télécharger"
                          onClick={() => {
                            if (!file.short_code) return;
                            const a = document.createElement("a");
                            a.href = getFileUrl(file);
                            a.download = file.original_name;
                            a.click();
                          }}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            theme === "dark"
                              ? "hover:bg-dark-danger/20 text-dark-danger"
                              : "hover:bg-light-danger/20 text-light-danger"
                          }`}
                          title="Supprimer"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setTempPassword("");
          setCustomAlias("");
          setEmailRecipients("");
          setPendingFiles([]);
        }}
        title="Protection et Partage du Fichier"
      >
        <p
          className={`text-sm mb-4 ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-light-text-secondary"
          }`}
        >
          Protégez votre fichier avec un mot de passe (disponible uniquement pour
          les plans Premium et Enterprise), ajoutez un alias personnalisé
          (Enterprise uniquement), ou partagez le lien par email.{" "}
          {pendingFiles.length > 1 && "Les fichiers sélectionnés seront zippés ensemble."}
        </p>
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Emails des destinataires (séparés par des virgules)
            </label>
            <input
              type="text"
              placeholder="ex: email1@example.com, email2@example.com"
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Mot de passe (facultatif, Premium/Enterprise uniquement)
            </label>
            <input
              type="password"
              placeholder="Laissez vide pour ne pas protéger"
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              disabled={user?.plan === "free"}
            />
          </div>
          {user?.plan === "enterprise" && (
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Alias personnalisé (facultatif)
              </label>
              <input
                type="text"
                placeholder="ex: mon-document"
                className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => confirmUpload()}
            className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background"
                : "bg-light-background/50 text-light-text-secondary hover:bg-light-background"
            }`}
          >
            Sans protection
          </button>
          <button
            onClick={() => confirmUpload()}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary/80"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary-dark"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin inline-block mr-2" />
            ) : (
              <Lock size={16} className="inline-block mr-2" />
            )}
            Continuer
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FileManager;