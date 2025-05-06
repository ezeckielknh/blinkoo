import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileBox,
  Upload,
  Download,
  Trash2,
  Calendar,
  Link2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { API } from "../../utils/api";

const FileManager = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;

    try {
      const res = await fetch(API.FILES.GET_ALL, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Erreur de chargement", "error");
        return;
      }
      setFiles(data);
    } catch (err) {
      addToast("Erreur réseau", "error");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) return;

      setUploading(true);

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch(
            API.FILES.UPLOAD,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
              body: formData,
            }
          );

          const data = await res.json();
          if (!res.ok) {
            addToast(data?.error || "Erreur upload", "error");
          } else {
            addToast("Fichier téléversé avec succès.", "success");
            fetchFiles(); // rafraîchir la liste
          }
        } catch (err) {
          addToast("Erreur réseau", "error");
        }
      }

      setUploading(false);
    },
    [user, addToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: user?.plan === "free" ? 5 * 1024 * 1024 : 100 * 1024 * 1024, // 5MB for free, 100MB for premium
    multiple: user?.plan !== "free",
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const deleteFile = async (fileId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API.FILES.DELETE}/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Erreur suppression", "error");
        return;
      }
      addToast("Fichier supprimé.", "success");
      fetchFiles(); // rafraîchir la liste
    } catch (err) {
      addToast("Erreur réseau", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">File Manager</h1>
      </div>

      {/* Upload Zone */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-700 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? "Déposez vos fichiers ici" : "Glissez & déposez ici"}
          </p>
          <p className="text-sm text-gray-400 mb-4">ou cliquez pour choisir</p>
          <p className="text-xs text-gray-500">
            Taille max : {user?.plan === "free" ? "5MB" : "100MB"}
          </p>
        </div>
      </div>

      {/* Files Table */}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Vos fichiers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">Nom</th>
                <th className="text-center py-3 px-4">Téléchargements</th>
                <th className="text-center py-3 px-4">Expiration</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-gray-800 last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FileBox size={20} className="text-primary mr-2" />
                      <div>
                        <p className="font-medium">{file.original_name}</p>
                        <p className="text-sm text-gray-400">
                        {API.DEVBASEURL}f/{file.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-400">{file.download_count}</td>
                  <td className="text-center py-3 px-4 text-gray-400">
                    {file.expires_at
                      ? new Date(file.expires_at).toLocaleDateString()
                      : "Illimité"}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="p-2 hover:bg-gray-800 rounded"
                        title="Copier lien"
                        onClick={() => {
                          navigator.clipboard.writeText(`${API.DEVBASEURL}f/${file.id}`);
                          addToast("Lien copié dans le presse-papier", "success");
                        }}
                      >
                        <Link2 size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-800 rounded"
                        title="Télécharger"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = `${API.DEVBASEURL}f/${file.id}`;
                          a.download = file.original_name;
                          a.click();
                        }}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-800 rounded text-danger"
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
      </div>
    </div>
  );
};

export default FileManager;
