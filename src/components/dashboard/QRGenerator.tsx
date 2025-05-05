import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Download, Palette, Settings, Trash } from "lucide-react";
import { API } from "../../utils/api";
import { format } from "date-fns";
import Modal from "../../components/Modal";

const QRGenerator = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrOptions, setQrOptions] = useState({
    foreground: "#000000",
    background: "#ffffff",
    size: 256,
    logo: null as File | null,
  });

  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    qrCode: any | null;
  }>({ open: false, qrCode: null });
  const [newExpiry, setNewExpiry] = useState("");

  useEffect(() => {
    const loadQrCodes = async () => {
      const data = await fetchQrCodes();
      setQrCodes(data || []); // 👈 On met à jour le state ici
    };
    loadQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      const res = await fetch(API.QR_CODES.GET_ALL, {
        method: "GET",
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
      });
      const data = await res.json();
      // console.log("Fetched QR codes:", data);
      if (!res.ok) {
        addToast(data?.error || "Something went wrong", "error");
        return;
      }
      return data.qr_codes;
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      return [];
    }
  };

  const handleGenerate = async () => {
    if (!url) {
      addToast("Please enter a URL or text", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "url");
      formData.append("content", url);
      formData.append("color", qrOptions.foreground);

      if (!user) {
        const email = prompt("Please enter your email to create this QR code");
        if (!email)
          return addToast("Email is required for anonymous users.", "error");
        formData.append("email", email);
      }

      if (qrOptions.logo) {
        formData.append("logo", qrOptions.logo);
      }

      const res = await fetch(API.QR_CODES.CREATE, {
        method: "POST",
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Something went wrong", "error");
        return;
      }

      setQrUrl(data.qr_code_url);
      addToast("QR Code generated successfully!", "success");

      // Envoie du QR Code en image au backend
      setTimeout(() => uploadQrCodeImage(data.qr_code_url), 300); // délai pour garantir le rendu SVG
      const updatedList = await fetchQrCodes(); // 👈 Recharger les données
      setQrCodes(updatedList || []);
    } catch (err) {
      console.error(err);
      addToast("Network error. Try again.", "error");
    }
  };

  const uploadQrCodeImage = async (qrCodeUrl: string) => {
    const svg = document.getElementById("qr-code")?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = async () => {
      canvas.width = qrOptions.size;
      canvas.height = qrOptions.size;

      if (!ctx) return;

      // Dessiner le QR Code
      ctx.drawImage(img, 0, 0);

      // Si un logo est fourni
      if (qrOptions.logo) {
        const logoImg = new Image();
        logoImg.onload = async () => {
          const logoSize = qrOptions.size * 0.2;
          const x = (qrOptions.size - logoSize) / 2;
          const y = (qrOptions.size - logoSize) / 2;

          // Contour blanc autour du logo
          // Contour blanc autour du logo (arrondi)
          const radius = 8;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + logoSize - radius, y);
          ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + radius);
          ctx.lineTo(x + logoSize, y + logoSize - radius);
          ctx.quadraticCurveTo(
            x + logoSize,
            y + logoSize,
            x + logoSize - radius,
            y + logoSize
          );
          ctx.lineTo(x + radius, y + logoSize);
          ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();

          // Logo centré sur le QR
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);

          // Convertir en blob et envoyer
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const uploadForm = new FormData();
            uploadForm.append("file", blob, "qr-code.png");

            try {
              const res = await fetch(API.QR_CODES.UPLOAD, {
                method: "POST",
                headers: user ? { Authorization: `Bearer ${user.token}` } : {},
                body: uploadForm,
              });

              const result = await res.json();
              if (!res.ok) {
                console.error(result);
                addToast(
                  "Erreur lors de l’enregistrement de l’image du QR Code",
                  "error"
                );
              } else {
                addToast("QR Code image saved to your account!", "success");
              }
            } catch (err) {
              console.error(err);
            }
          }, "image/png");
        };

        logoImg.src = URL.createObjectURL(qrOptions.logo);
      } else {
        // Pas de logo, upload direct
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const uploadForm = new FormData();
          uploadForm.append("file", blob, "qr-code.png");

          try {
            const res = await fetch(API.QR_CODES.UPLOAD, {
              method: "POST",
              headers: user ? { Authorization: `Bearer ${user.token}` } : {},
              body: uploadForm,
            });

            const result = await res.json();
            if (!res.ok) {
              console.error(result);
              addToast(
                "Erreur lors de l’enregistrement de l’image du QR Code",
                "error"
              );
            } else {
              addToast("QR Code image saved to your account!", "success");
            }
          } catch (err) {
            console.error(err);
          }
        }, "image/png");
      }
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const updateExpiry = async () => {
    if (!editModal.qrCode || !newExpiry) return;
    try {
      const res = await fetch(`${API.QR_CODES.UPDATE}/${editModal.qrCode.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ expires_at: newExpiry }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Update failed", "error");
        return;
      }
      addToast("Expiration mise à jour.", "success");
      setEditModal({ open: false, qrCode: null });
      const updatedList = await fetchQrCodes(); // 👈 Recharger les données
      setQrCodes(updatedList || []);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la mise à jour.", "error");
    }
  };

  const deleteQrCode = async (qrCodeId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API.QR_CODES.DELETE}/${qrCodeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Delete failed", "error");
        return;
      }
      addToast("QR Code deleted successfully!", "success");
      const updatedList = await fetchQrCodes(); // 👈 Recharger les données
      setQrCodes(updatedList || []);
    } catch (err) {
      console.error(err);
      addToast("Network error. Try again.", "error");
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(
        `http://192.168.1.201:8000/qr-codes/${filename}`,
        {
          mode: "cors",
        }
      );

      if (!response.ok) throw new Error("Téléchargement échoué");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      addToast("Erreur lors du téléchargement", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Create QR Code</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label htmlFor="url" className="form-label">
                Destination URL or Text
              </label>
              <input
                id="url"
                type="text"
                className="form-input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {user?.plan !== "free" && (
              <>
                <div className="form-control">
                  <label className="form-label">Foreground Color</label>
                  <input
                    type="color"
                    value={qrOptions.foreground}
                    onChange={(e) =>
                      setQrOptions({ ...qrOptions, foreground: e.target.value })
                    }
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>

                <div className="form-control">
                  <label className="form-label">Background Color</label>
                  <input
                    type="color"
                    value={qrOptions.background}
                    onChange={(e) =>
                      setQrOptions({ ...qrOptions, background: e.target.value })
                    }
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>

                <div className="form-control">
                  <label className="form-label">Logo (optionnel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) =>
                      setQrOptions({
                        ...qrOptions,
                        logo: e.target.files?.[0] || null,
                      })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="form-label">Size</label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={qrOptions.size}
                    onChange={(e) =>
                      setQrOptions({
                        ...qrOptions,
                        size: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </>
            )}

            <button onClick={handleGenerate} className="btn btn-primary w-full">
              Generate QR Code
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
          </div>

          <div
            className="relative flex items-center justify-center bg-white rounded-lg p-8"
            id="qr-code"
          >
            {qrUrl ? (
              <>
                <QRCode
                  value={qrUrl}
                  size={qrOptions.size}
                  fgColor={qrOptions.foreground}
                  bgColor={qrOptions.background}
                  level="H"
                />
                {qrOptions.logo && (
                  <div
                    className="absolute"
                    style={{
                      width: qrOptions.size * 0.2,
                      height: qrOptions.size * 0.2,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "white",
                      padding: 4,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(qrOptions.logo)}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400">
                <Settings size={48} className="mx-auto mb-2 opacity-50" />
                <p>Enter a URL or text and generate to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {qrCodes.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold mb-4">QR Codes Générés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrCodes.map((qr) => (
              <div key={qr.id} className="border rounded-lg p-4 bg-gray-900">
                <img
                  src={
                    qr.file_path
                      ? `http://192.168.1.201:8000/${qr.file_path}`
                      : "https://via.placeholder.com/256?text=QR+Code"
                  }
                  alt="QR Code"
                  className="w-full rounded mb-2"
                />
                <p className="text-sm text-gray-400 truncate">{qr.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Expire le :{" "}
                  {qr.expires_at
                    ? format(new Date(qr.expires_at), "dd/MM/yyyy")
                    : "Illimité"}
                </p>
                <p className="text-xs text-gray-500">
                  Scans : {qr.scans?.length ?? 0}
                </p>
                <div className="flex justify-between mt-3">
                  {user?.plan !== "free" && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditModal({ open: true, qrCode: qr })}
                    >
                      Modifier
                    </button>
                  )}
                  <a
                    href={`${API} + /download/qr/${qr.file_path
                      .split("/")
                      .pop()}`}
                    className="btn btn-sm btn-outline"
                  >
                    <Download size={14} />
                  </a>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteQrCode(qr.id)}
                    title="Supprimer"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {editModal.open && (
        <Modal
          isOpen={editModal.open}
          title="Modifier l'expiration"
          onClose={() => setEditModal({ open: false, qrCode: null })}
        >
          <div className="space-y-4">
            <input
              type="date"
              className="form-input w-full"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="btn btn-secondary"
                onClick={() => setEditModal({ open: false, qrCode: null })}
              >
                Annuler
              </button>
              <button className="btn btn-primary" onClick={updateExpiry}>
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QRGenerator;
