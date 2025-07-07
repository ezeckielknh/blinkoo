import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  BarChart3,
  Download,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { API } from "../../utils/api";
import { format } from "date-fns";
import Modal from "../../components/Modal";
import { Link } from "react-router-dom";

interface QrCodeType {
  id: string | number;
  file_path?: string;
  type?: string;
  content?: string;
  short_code?: string;
  expires_at?: string;
  logo_path?: string;
  background?: string;
  [key: string]: any;
}

type DotsType =
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "square"
  | "extra-rounded";
type CornersType =
  | "dot"
  | "square"
  | "extra-rounded"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded";

const QRGenerator = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [theme] = useState<"light" | "dark">("dark"); // Assuming dark theme to match LinksManager
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    qrCode: QrCodeType | null;
  }>({
    open: false,
    qrCode: null,
  });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    qrCode: QrCodeType | null;
  }>({
    open: false,
    qrCode: null,
  });
  const [formData, setFormData] = useState({
    type: "url" as
      | "url"
      | "text"
      | "tel"
      | "email"
      | "sms"
      | "vcard"
      | "whatsapp"
      | "wifi"
      | "geo",
    content: "",
    email: "",
    color: "#000000",
    background: "#ffffff",
    logo: null as File | null,
    shape: "square" as "square" | "rounded" | "circle",
    pixelStyle: "square" as DotsType,
    angleStyle: "square" as CornersType,
    cornersDotStyle: "dot" as CornersType,
    pixelGradient: null as null | {
      type: string;
      rotation: number;
      colorStops: { offset: number; color: string }[];
    },
    backgroundGradient: null as null | {
      type: string;
      rotation: number;
      colorStops: { offset: number; color: string }[];
    },
    usePixelColorForAngles: true,
    max_scans: "",
    password: "",
    wifi_ssid: "",
    wifi_password: "",
    wifi_encryption: "WPA" as "WPA" | "WEP" | "none",
    lat: "",
    lng: "",
    vcard: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      organization: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });
  const [qrUrl, setQrUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(
    `${window.location.origin}/incomplete`
  );
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
  const [newExpiry, setNewExpiry] = useState("");
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg" | "svg">(
    "png"
  );
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const predefinedColors = [
    "#000000",
    "#FF0000",
    "#FFA500",
    "#008000",
    "#0000FF",
    "#800080",
    "#FF00FF",
  ];
  const allowedPixelStylesFree = ["square", "rounded"];
  const allowedAngleStylesFree = ["square", "rounded"];
  const allowedCornersDotStylesFree = ["dot", "square"];

  const isPremiumOrEnterprise =
    user && (user.plan === "premium" || user.plan === "premium_quarterly" || user.plan === "premium_annual" || user.plan === "enterprise");

  useEffect(() => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 256,
        height: 256,
        data: previewUrl,
        image: formData.logo ? URL.createObjectURL(formData.logo) : undefined,
        dotsOptions: {
          color: formData.color,
          gradient: formData.pixelGradient
            ? {
                ...formData.pixelGradient,
                type: formData.pixelGradient.type as "linear" | "radial",
              }
            : undefined,
          type: formData.pixelStyle,
          roundSize: true,
        },
        cornersSquareOptions: {
          color: formData.usePixelColorForAngles ? formData.color : "#000000",
          type: formData.angleStyle,
        },
        cornersDotOptions: {
          color: formData.usePixelColorForAngles ? formData.color : "#000000",
          type: formData.cornersDotStyle,
        },
        backgroundOptions: {
          color: formData.background,
          gradient: formData.backgroundGradient
            ? {
                ...formData.backgroundGradient,
                type: formData.backgroundGradient.type as "linear" | "radial",
              }
            : undefined,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
          imageSize: 0.2,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (qrCodeInstance.current && qrCodeRef.current) {
      qrCodeInstance.current.update({
        data: previewUrl,
        dotsOptions: {
          color: formData.color,
          gradient: formData.pixelGradient
            ? {
                ...formData.pixelGradient,
                type: formData.pixelGradient.type as "linear" | "radial",
              }
            : undefined,
          type: formData.pixelStyle,
          roundSize: true,
        },
        cornersSquareOptions: {
          color: formData.usePixelColorForAngles ? formData.color : "#000000",
          type: formData.angleStyle,
        },
        cornersDotOptions: {
          color: formData.usePixelColorForAngles ? formData.color : "#000000",
          type: formData.cornersDotStyle,
        },
        backgroundOptions: {
          color: formData.background,
          gradient: formData.backgroundGradient
            ? {
                ...formData.backgroundGradient,
                type: formData.backgroundGradient.type as "linear" | "radial",
              }
            : undefined,
        },
        image:
          formData.logo && isPremiumOrEnterprise
            ? URL.createObjectURL(formData.logo)
            : undefined,
      });

      qrCodeRef.current.innerHTML = "";
      qrCodeInstance.current.append(qrCodeRef.current);
    }
  }, [formData, previewUrl, isPremiumOrEnterprise]);

  useEffect(() => {
    const loadQrCodes = async () => {
      const data = await fetchQrCodes();
      setQrCodes(data || []);
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
      if (!res.ok) {
        addToast(
          data?.error || "Erreur lors de la récupération des QR codes",
          "error"
        );
        return [];
      }
      return data.qr_codes;
    } catch (error) {
      addToast("Erreur réseau lors de la récupération des QR codes", "error");
      return [];
    }
  };

  const handleGenerate = async () => {
    try {
      // Step 1: Validate input
      addToast("Validation des données...", "info");
      if (
        !formData.content &&
        !["vcard", "wifi", "geo", "tel", "sms", "email", "whatsapp"].includes(
          formData.type
        )
      ) {
        addToast("Veuillez entrer un contenu valide", "error");
        return;
      }
      if (!user && !formData.email) {
        addToast("Email requis pour les utilisateurs non connectés", "error");
        return;
      }
      if (formData.type === "geo" && (!formData.lat || !formData.lng)) {
        addToast("Veuillez entrer des coordonnées valides", "error");
        return;
      }

      // Step 2: Prepare data
      addToast("Préparation des données...", "info");
      const data = new FormData();
      data.append("type", formData.type);

      if (formData.type === "wifi") {
        const wifiContent = `WIFI:S:${formData.wifi_ssid};T:${formData.wifi_encryption};P:${formData.wifi_password};;`;
        data.append("wifi_raw", wifiContent);
        data.append("content", wifiContent);
      } else if (formData.type === "geo") {
        data.append("lat", formData.lat);
        data.append("lng", formData.lng);
        data.append("content", `geo:${formData.lat},${formData.lng}`);
      } else if (formData.type === "vcard") {
        const vcardContent = `BEGIN:VCARD\nVERSION:3.0\nN:${formData.vcard.lastName};${formData.vcard.firstName};;;\nFN:${formData.vcard.firstName} ${formData.vcard.lastName}\nORG:${formData.vcard.organization}\nTEL;TYPE=CELL:${formData.vcard.phone}\nEMAIL:${formData.vcard.email}\nADR;TYPE=WORK:;;${formData.vcard.street};${formData.vcard.city};${formData.vcard.state};${formData.vcard.zip};${formData.vcard.country}\nEND:VCARD`;
        data.append("vcard_raw", vcardContent);
        data.append("content", vcardContent);
      } else if (formData.type === "tel") {
        data.append("content", `tel:${formData.content}`);
      } else if (formData.type === "sms") {
        data.append("content", `sms:${formData.content}`);
      } else if (formData.type === "email") {
        data.append("content", `mailto:${formData.content}`);
      } else if (formData.type === "whatsapp") {
        data.append(
          "content",
          `https://wa.me/${formData.content.replace(/[^0-9]/g, "")}`
        );
      } else {
        data.append("content", formData.content);
      }

      if (!user) data.append("email", formData.email);
      if (isPremiumOrEnterprise) {
        data.append("color", formData.color);
        if (formData.logo) data.append("logo", formData.logo);
        if (formData.max_scans) data.append("max_scans", formData.max_scans);
        if (formData.password) data.append("password", formData.password);
      } else {
        data.append("color", "#000000");
      }

      // Step 3: Create QR code
      addToast("Création du QR code...", "info");
      const storeRes = await fetch(API.QR_CODES.CREATE, {
        method: "POST",
        headers: {
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
          Accept: "application/json",
        },
        body: data,
      });

      if (!storeRes.ok) {
        const result = await storeRes.json();
        addToast(
          result?.error || "Erreur lors de la création du QR code",
          "error"
        );
        return;
      }

      const storeResult = await storeRes.json();
      const qrCodeUrl = storeResult.qr_code_url;

      // Step 4: Generate QR code image
      addToast("Génération de l'image QR...", "info");
      const qr = qrCodeInstance.current;
      if (!qr) throw new Error("QR code instance not ready");

      qr.update({ data: qrCodeUrl });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rawData = await qr.getRawData();
      let canvas: HTMLCanvasElement | null = null;
      if (rawData instanceof HTMLCanvasElement) {
        canvas = rawData;
      } else if (rawData instanceof Blob) {
        const img = new window.Image();
        const url = URL.createObjectURL(rawData);
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.onerror = reject;
          img.src = url;
        });
      } else {
        throw new Error("Failed to generate QR code canvas");
      }

      if (!canvas) throw new Error("Failed to generate QR code canvas");
      const qrCodeBlob: Blob | null = await new Promise((resolve) => {
        if (canvas) canvas.toBlob(resolve as BlobCallback, "image/png");
        else resolve(null);
      });
      if (!qrCodeBlob) throw new Error("Failed to generate QR code blob");

      // Step 5: Upload QR code image
      addToast("Upload de l'image QR...", "info");
      const uploadData = new FormData();
      uploadData.append("file", qrCodeBlob, "qr-code.png");

      const uploadRes = await fetch(API.QR_CODES.UPLOAD, {
        method: "POST",
        headers: {
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
          Accept: "application/json",
        },
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const result = await uploadRes.json();
        addToast(
          result?.error || "Erreur lors de l'upload de l'image",
          "error"
        );
        return;
      }

      await uploadRes.json();
      setQrUrl(qrCodeUrl);
      setPreviewUrl(qrCodeUrl);
      addToast("QR code généré et uploadé avec succès !", "success");

      const updatedList = await fetchQrCodes();
      setQrCodes(updatedList || []);
    } catch (err) {
      addToast("Erreur lors de la génération du QR code", "error");
    }
  };

  const handleDownload = (qrCodeUrl: string, filename: string) => {
    qrCodeInstance.current?.download({
      extension: downloadFormat,
      name: filename,
    });
  };

  const handleDownloadListItem = async (qr: QrCodeType) => {
    if (downloadFormat === "svg") {
      addToast(
        "Export SVG non pris en charge pour les QR codes existants",
        "error"
      );
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = API.DEVBASEURL + qr.file_path;
      });

      canvas.width = 256;
      canvas.height = 256;
      if (!ctx) return;
      ctx.fillStyle = qr.background || formData.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      if (qr.logo_path && isPremiumOrEnterprise) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = qr.logo_path!;
        });

        const logoSize = 256 * 0.2;
        const x = (256 - logoSize) / 2;
        const y = (256 - logoSize) / 2;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, logoSize, logoSize);
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-code-${qr.short_code}.${
          downloadFormat === "jpeg" ? "jpg" : downloadFormat
        }`;
        link.click();
        URL.revokeObjectURL(url);
      }, `image/${downloadFormat === "jpeg" ? "jpg" : downloadFormat}`);
    } catch (error) {
      addToast("Erreur lors du téléchargement du QR code", "error");
    }
  };

  const toggleAccordion = (qrId: string) => {
    setExpandedQrId(expandedQrId === qrId ? null : qrId);
  };

  const handleUpdateExpiry = async () => {
    if (!editModal.qrCode || !newExpiry) return;
    try {
      const res = await fetch(`${API.QR_CODES.UPDATE}/${editModal.qrCode.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expires_at: newExpiry }),
      });
      if (!res.ok) {
        const data = await res.json();
        addToast(data?.error || "Erreur lors de la mise à jour", "error");
        return;
      }
      addToast("Date d'expiration mise à jour", "success");
      setEditModal({ open: false, qrCode: null });
      setNewExpiry("");
      const updatedList = await fetchQrCodes();
      setQrCodes(updatedList || []);
    } catch (error) {
      addToast("Erreur réseau lors de la mise à jour", "error");
    }
  };

  const renderFormFields = () => {
    switch (formData.type) {
      case "url":
      case "text":
        return (
          <input
            type="text"
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
            placeholder={
              formData.type === "url"
                ? "https://example.com"
                : "Entrez votre texte"
            }
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        );
      case "tel":
      case "sms":
      case "whatsapp":
        return (
          <input
            type="tel"
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
            placeholder="+1234567890"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        );
      case "email":
        return (
          <input
            type="email"
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
            placeholder="example@domain.com"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        );
      case "wifi":
        return (
          <div className="space-y-4">
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              placeholder="SSID du réseau WiFi"
              value={formData.wifi_ssid}
              onChange={(e) =>
                setFormData({ ...formData, wifi_ssid: e.target.value })
              }
            />
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              placeholder="Mot de passe WiFi"
              value={formData.wifi_password}
              onChange={(e) =>
                setFormData({ ...formData, wifi_password: e.target.value })
              }
            />
            <select
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              value={formData.wifi_encryption}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wifi_encryption: e.target.value as "WPA" | "WEP" | "none",
                })
              }
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="none">Aucun</option>
            </select>
          </div>
        );
      case "geo":
        return (
          <div className="space-y-4">
            <input
              type="number"
              step="any"
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              placeholder="Latitude"
              value={formData.lat}
              onChange={(e) =>
                setFormData({ ...formData, lat: e.target.value })
              }
            />
            <input
              type="number"
              step="any"
              className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                  : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
              } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              placeholder="Longitude"
              value={formData.lng}
              onChange={(e) =>
                setFormData({ ...formData, lng: e.target.value })
              }
            />
          </div>
        );
      case "vcard":
        return (
          <div className="space-y-4">
            {[
              { key: "firstName", placeholder: "Prénom" },
              { key: "lastName", placeholder: "Nom" },
              { key: "phone", placeholder: "Téléphone", type: "tel" },
              { key: "email", placeholder: "Email", type: "email" },
              { key: "organization", placeholder: "Organisation" },
              { key: "street", placeholder: "Rue" },
              { key: "city", placeholder: "Ville" },
              { key: "state", placeholder: "État/Province" },
              { key: "zip", placeholder: "Code postal" },
              { key: "country", placeholder: "Pays" },
            ].map(({ key, placeholder, type = "text" }) => (
              <input
                key={key}
                type={type}
                className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                placeholder={placeholder}
                value={formData.vcard[key as keyof typeof formData.vcard]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vcard: { ...formData.vcard, [key]: e.target.value },
                  })
                }
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-9">
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans `}
        >
          Générateur de QR Code
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up p-4 sm:p-6`}
        >
          {!user && (
            <div className="mb-4">
              <input
                type="email"
                className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                placeholder="Votre email (pour utilisateurs non connectés)"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Type de QR Code
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as typeof formData.type,
                    content: "",
                  })
                }
              >
                <option value="url">URL</option>
                <option value="text">Texte</option>
                <option value="tel">Téléphone</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="wifi">WiFi</option>
                <option value="geo">Géolocalisation</option>
                <option value="vcard">vCard</option>
              </select>
            </div>

            {renderFormFields()}

            <div>
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Style de pixels
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    type: "square",
                    icon: (
                      <svg width="24" height="24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "rounded",
                    icon: (
                      <svg width="24" height="24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="4"
                          ry="4"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "dots",
                    icon: (
                      <svg width="24" height="24">
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "classy",
                    icon: (
                      <svg width="24" height="24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="2"
                          fill={theme === "dark" ? "#1f2937" : "#e5e7eb"}
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="2"
                          fill={theme === "dark" ? "#1f2937" : "#e5e7eb"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "classy-rounded",
                    icon: (
                      <svg width="24" height="24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="6"
                          ry="6"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="2"
                          fill={theme === "dark" ? "#1f2937" : "#e5e7eb"}
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="2"
                          fill={theme === "dark" ? "#1f2937" : "#e5e7eb"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "extra-rounded",
                    icon: (
                      <svg width="24" height="24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="8"
                          ry="8"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                ].map(({ type, icon }) => {
                  const isAllowed =
                    isPremiumOrEnterprise ||
                    allowedPixelStylesFree.includes(type);
                  return (
                    <button
                      key={type}
                      className={`p-2 border rounded-lg flex items-center justify-center w-10 h-10 transition-colors ${
                        theme === "dark"
                          ? "border-dark-primary/50 bg-dark-background/30 hover:bg-dark-primary/20"
                          : "border-light-primary/50 bg-light-background/30 hover:bg-light-primary/20"
                      } ${
                        formData.pixelStyle === type
                          ? "border-dark-primary bg-dark-primary/10"
                          : ""
                      } ${!isAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        isAllowed &&
                        setFormData({
                          ...formData,
                          pixelStyle: type as DotsType,
                        })
                      }
                      type="button"
                      disabled={!isAllowed}
                      title={
                        isAllowed ? `Style ${type}` : "Réservé aux abonnés"
                      }
                    >
                      {icon}
                      {!isAllowed && (
                        <span
                          className="absolute top-0 right-0 text-red-500 text-xs"
                          title="Réservé aux abonnés"
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Style d'angles
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    type: "square",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <rect
                          x="8"
                          y="8"
                          width="8"
                          height="8"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "rounded",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="4"
                          ry="4"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <rect
                          x="8"
                          y="8"
                          width="8"
                          height="8"
                          rx="2"
                          ry="2"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "dot",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="4"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "dots",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle
                          cx="8"
                          cy="8"
                          r="3"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="16"
                          cy="8"
                          r="3"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="8"
                          cy="16"
                          r="3"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="3"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "classy",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "classy-rounded",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="6"
                          ry="6"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "extra-rounded",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="8"
                          ry="8"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <rect
                          x="8"
                          y="8"
                          width="8"
                          height="8"
                          rx="4"
                          ry="4"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                  },
                ].map(({ type, icon }) => {
                  const isAllowed =
                    isPremiumOrEnterprise ||
                    allowedAngleStylesFree.includes(type);
                  return (
                    <button
                      key={type}
                      className={`p-2 border rounded-lg flex items-center justify-center w-10 h-10 transition-colors ${
                        theme === "dark"
                          ? "border-dark-primary/50 bg-dark-background/30 hover:bg-dark-primary/20"
                          : "border-light-primary/50 bg-light-background/30 hover:bg-light-primary/20"
                      } ${
                        formData.angleStyle === type
                          ? "border-dark-primary bg-dark-primary/10"
                          : ""
                      } ${!isAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        isAllowed &&
                        setFormData({
                          ...formData,
                          angleStyle: type as CornersType,
                        })
                      }
                      type="button"
                      disabled={!isAllowed}
                      title={
                        isAllowed ? `Style ${type}` : "Réservé aux abonnés"
                      }
                    >
                      {icon}
                      {!isAllowed && (
                        <span
                          className="absolute top-0 right-0 text-red-500 text-xs"
                          title="Réservé aux abonnés"
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Style de coins ronds
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    type: "dot",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="4"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "square",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "rounded",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          rx="4"
                          ry="4"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "dots",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <circle
                          cx="9"
                          cy="9"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="15"
                          cy="9"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="9"
                          cy="15"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="15"
                          cy="15"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "classy",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="9"
                          cy="9"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="15"
                          cy="15"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "classy-rounded",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          rx="4"
                          ry="4"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                        <circle
                          cx="9"
                          cy="9"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                        <circle
                          cx="15"
                          cy="15"
                          r="2"
                          fill={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                        />
                      </svg>
                    ),
                  },
                  {
                    type: "extra-rounded",
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          rx="6"
                          ry="6"
                          fill="none"
                          stroke={theme === "dark" ? "#e5e7eb" : "#1f2937"}
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                  },
                ].map(({ type, icon }) => {
                  const isAllowed =
                    isPremiumOrEnterprise ||
                    allowedCornersDotStylesFree.includes(type);
                  return (
                    <button
                      key={type}
                      className={`p-2 border rounded-lg flex items-center justify-center w-10 h-10 transition-colors ${
                        theme === "dark"
                          ? "border-dark-primary/50 bg-dark-background/30 hover:bg-dark-primary/20"
                          : "border-light-primary/50 bg-light-background/30 hover:bg-light-primary/20"
                      } ${
                        formData.cornersDotStyle === type
                          ? "border-dark-primary bg-dark-primary/10"
                          : ""
                      } ${!isAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() =>
                        isAllowed &&
                        setFormData({
                          ...formData,
                          cornersDotStyle: type as CornersType,
                        })
                      }
                      type="button"
                      disabled={!isAllowed}
                      title={
                        isAllowed ? `Style ${type}` : "Réservé aux abonnés"
                      }
                    >
                      {icon}
                      {!isAllowed && (
                        <span
                          className="absolute top-0 right-0 text-red-500 text-xs"
                          title="Réservé aux abonnés"
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.usePixelColorForAngles}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usePixelColorForAngles: e.target.checked,
                    })
                  }
                  className="form-checkbox h-5 w-5 text-dark-primary"
                  id="usePixelColorForAngles"
                />
                <label
                  htmlFor="usePixelColorForAngles"
                  className={`text-sm font-medium font-sans ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Utiliser la couleur des pixels pour les angles
                </label>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium font-sans mb-1 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Couleurs
              </label>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium font-sans mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Pixels (Premier plan)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color
                            ? "border-dark-primary"
                            : theme === "dark"
                            ? "border-dark-primary/50"
                            : "border-light-primary/50"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          isPremiumOrEnterprise &&
                          setFormData({ ...formData, color })
                        }
                        disabled={!isPremiumOrEnterprise}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className={`w-10 h-10 border rounded-lg ${
                        theme === "dark"
                          ? "border-dark-primary/50"
                          : "border-light-primary/50"
                      }`}
                      disabled={!isPremiumOrEnterprise}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className={`w-24 px-4 py-2 rounded-lg border font-sans text-sm ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                      placeholder="#000000"
                      disabled={!isPremiumOrEnterprise}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium font-sans mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Arrière-plan
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.background}
                      onChange={(e) =>
                        setFormData({ ...formData, background: e.target.value })
                      }
                      className={`w-10 h-10 border rounded-lg ${
                        theme === "dark"
                          ? "border-dark-primary/50"
                          : "border-light-primary/50"
                      }`}
                      disabled={!isPremiumOrEnterprise}
                    />
                    <input
                      type="text"
                      value={formData.background}
                      onChange={(e) =>
                        setFormData({ ...formData, background: e.target.value })
                      }
                      className={`w-24 px-4 py-2 rounded-lg border font-sans text-sm ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary border-dark-primary/50"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary border-light-primary/50"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                      placeholder="#FFFFFF"
                      disabled={!isPremiumOrEnterprise}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isPremiumOrEnterprise && (
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium font-sans mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Logo (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logo: e.target.files?.[0] || null,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                        : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                    } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium font-sans mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Forme
                  </label>
                  <select
                    value={formData.shape}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shape: e.target.value as
                          | "square"
                          | "rounded"
                          | "circle",
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                        : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                    } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                  >
                    <option value="square">Carré</option>
                    <option value="rounded">Arrondi</option>
                    <option value="circle">Cercle</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium font-sans mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Nombre maximum de scans
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                        : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                    } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                    placeholder="Illimité"
                    value={formData.max_scans}
                    onChange={(e) =>
                      setFormData({ ...formData, max_scans: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <button
              className={`w-full px-4 py-2 rounded-lg font-sans text-sm ${
                theme === "dark"
                  ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary/80"
                  : "bg-light-primary text-light-text-primary hover:bg-light-secondary-dark"
              } transition-all animate-pulse hover:animate-none`}
              onClick={handleGenerate}
            >
              Générer
            </button>
          </div>
        </div>

        <div
          className={`rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up p-4 sm:p-6`}
        >
          {qrUrl && (
            <div className="flex justify-end mb-4 gap-2">
              <select
                value={downloadFormat}
                onChange={(e) =>
                  setDownloadFormat(e.target.value as "png" | "jpeg" | "svg")
                }
                className={`px-4 py-2 rounded-lg border font-sans text-sm ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                    : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
                <option value="svg">SVG</option>
              </select>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm ${
                  theme === "dark"
                    ? "text-dark-primary hover:bg-dark-primary/20"
                    : "text-light-primary hover:bg-light-primary/20"
                } transition-all`}
                onClick={() => handleDownload(qrUrl, "qr-code")}
              >
                <Download size={16} />
                Télécharger
              </button>
            </div>
          )}
          <div
            className={`flex items-center justify-center ${
              theme === "dark"
                ? "bg-dark-background/30"
                : "bg-light-background/30"
            } rounded-lg p-6 ${
              formData.shape === "circle"
                ? "rounded-full overflow-hidden"
                : formData.shape === "rounded"
                ? "rounded-lg"
                : ""
            }`}
            id="qr-code"
          >
            <div ref={qrCodeRef} style={{ width: 256, height: 256 }} />
            {!qrUrl && !formData.content && (
              <div
                className={`text-center ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                {/* <Settings size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm font-sans">
                  Entrez les informations pour voir l'aperçu
                </p> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {qrCodes.length > 0 && (
        <div
          className={`rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up p-4 sm:p-6`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Mes QR Codes
          </h2>
          <div className="md:hidden space-y-4">
            {qrCodes.map((qr) => {
              const qrId = `${qr.id}`;
              return (
                <div
                  key={qrId}
                  className={`rounded-lg border border-dark-primary/30 ${
                    theme === "dark"
                      ? "bg-dark-background/30"
                      : "bg-light-background/30"
                  } shadow animate-slide-up overflow-hidden`}
                >
                  <button
                    className="w-full flex items-center justify-between p-4 focus:outline-none"
                    onClick={() => toggleAccordion(qrId)}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          setPreviewModal({ open: true, qrCode: qr })
                        }
                        className="focus:outline-none"
                      >
                        {qr.file_path ? (
                          <img
                            src={API.DEVBASEURL + qr.file_path}
                            alt="QR Code"
                            className="w-12 h-12 rounded hover:opacity-80 transition-all"
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 ${
                              theme === "dark"
                                ? "bg-dark-background/50"
                                : "bg-light-background/30"
                            } rounded flex items-center justify-center`}
                          >
                            <Settings
                              size={24}
                              className={
                                theme === "dark"
                                  ? "text-dark-text-secondary"
                                  : "text-light-text-secondary"
                              }
                            />
                          </div>
                        )}
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium font-sans ${
                            theme === "dark"
                              ? "text-dark-text-primary"
                              : "text-light-text-primary"
                          }`}
                        >
                          Type: {qr.type}
                        </p>
                        <p
                          className={`text-sm font-sans truncate max-w-[150px] ${
                            theme === "dark"
                              ? "text-dark-primary"
                              : "text-light-primary"
                          }`}
                        >
                          {qr.short_code}
                        </p>
                      </div>
                    </div>
                    {expandedQrId === qrId ? (
                      <ChevronDown
                        size={16}
                        className={
                          theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-light-text-secondary"
                        }
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className={
                          theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-light-text-secondary"
                        }
                      />
                    )}
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      expandedQrId === qrId ? "max-h-32" : "max-h-0"
                    } overflow-hidden`}
                  >
                    <div className="px-4 pb-4 space-y-2">
                      <p
                        className={`text-sm font-sans ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                      >
                        Expiré le :{" "}
                        {qr.expires_at
                          ? format(new Date(qr.expires_at), "PP")
                          : "Illimité"}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {user?.plan === "premium" && (
                          <button
                            className={`text-sm font-sans font-medium ${
                              theme === "dark"
                                ? "text-dark-primary hover:bg-dark-primary/20"
                                : "text-light-primary hover:bg-light-primary/20"
                            } px-2 py-1 rounded`}
                            onClick={() =>
                              setEditModal({ open: true, qrCode: qr })
                            }
                          >
                            Modifier
                          </button>
                        )}
                        <select
                          value={downloadFormat}
                          onChange={(e) =>
                            setDownloadFormat(
                              e.target.value as "png" | "jpeg" | "svg"
                            )
                          }
                          className={`px-2 py-1 rounded-lg border font-sans text-sm ${
                            theme === "dark"
                              ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                              : "bg-light-background/50 text-light-text-primary border-light-primary/50"
                          } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                        >
                          <option value="png">PNG</option>
                          <option value="jpeg">JPG</option>
                          <option value="svg">SVG</option>
                        </select>
                        <button
                          className={`flex items-center gap-1 text-sm font-sans font-medium ${
                            theme === "dark"
                              ? "text-dark-primary hover:bg-dark-primary/20"
                              : "text-light-primary hover:bg-light-primary/20"
                          } px-2 py-0 rounded`}
                          onClick={() => handleDownloadListItem(qr)}
                        >
                          <Download size={16} />
                          Télécharger
                        </button>

                        <Link
                          to={`/${qr.short_code}/qr-statistics`}
                          className={`p-2 rounded flex items-center ${
                            theme === "dark"
                              ? "text-dark-primary hover:bg-dark-primary/20"
                              : "text-light-primary hover:bg-light-primary/20"
                          } transition-all`}
                          title="Statistiques"
                        >
                          <BarChart3 size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qr) => (
                <div
                  key={qr.id}
                  className={`border border-dark-primary/30 rounded-lg p-4 ${
                    theme === "dark"
                      ? "bg-dark-background/30"
                      : "bg-light-background/30"
                  } hover:bg-dark-primary/10 transition-all animate-slide-up`}
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() =>
                        setPreviewModal({ open: true, qrCode: qr })
                      }
                      className="focus:outline-none"
                    >
                      {qr.file_path ? (
                        <img
                          src={API.DEVBASEURL + qr.file_path}
                          alt="QR Code"
                          className="w-12 h-12 object-cover rounded hover:opacity-80 transition-all"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 ${
                            theme === "dark"
                              ? "bg-dark-background/50"
                              : "bg-light-background/30"
                          } rounded flex items-center justify-center`}
                        >
                          <Settings
                            size={24}
                            className={
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-light-text-secondary"
                            }
                          />
                        </div>
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-sm font-medium font-sans ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                      >
                        Type: {qr.type}
                      </p>
                      <p
                        className={`text-sm font-sans truncate max-w-[150px] ${
                          theme === "dark"
                            ? "text-dark-primary"
                            : "text-light-primary"
                        }`}
                      >
                        <Link
                          to={qr.qr_code_url}
                          className="text-dark-primary hover:text-dark-accent"
                        >
                          {qr.short_code}
                        </Link>
                      </p>
                    </div>
                  </div>
                  <p
                    className={`mb-3 text-sm font-sans ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    }`}
                  >
                    Expiré le :{" "}
                    {qr.expires_at
                      ? format(new Date(qr.expires_at), "PP")
                      : "Illimité"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {user?.plan === "premium" && (
                      <button
                        className={`font-medium font-sans text-sm ${
                          theme === "dark"
                            ? "text-dark-primary hover:bg-dark-primary/20"
                            : "text-light-primary hover:bg-light-primary/20"
                        } px-2 py-1 rounded`}
                        onClick={() => setEditModal({ open: true, qrCode: qr })}
                      >
                        Modifier
                      </button>
                    )}
                    <select
                      value={downloadFormat}
                      onChange={(e) =>
                        setDownloadFormat(
                          e.target.value as "png" | "jpeg" | "svg"
                        )
                      }
                      className={`px-2 py-1 rounded-lg border font-sans text-sm ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                          : "bg-light-background/50 text-light-text-primary border-dark-primary/50"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
                    >
                      <option value="png">PNG</option>
                      <option value="jpeg">JPG</option>
                      <option value="svg">SVG</option>
                    </select>
                    <button
                      className={`flex items-center gap-2 text-sm font-medium font-sans ${
                        theme === "dark"
                          ? "text-dark-primary hover:bg-dark-primary/20"
                          : "text-light-primary hover:bg-light-primary/20"
                      } px-2 py-1 rounded`}
                      onClick={() => handleDownloadListItem(qr)}
                    >
                      <Download size={16} />
                      Télécharger
                    </button>

                    <Link
                      to={`/dashboard/qr/${qr.short_code}/qr-statistics`}
                      className={`p-2 rounded flex items-center ${
                        theme === "dark"
                          ? "text-dark-primary hover:bg-dark-primary/20"
                          : "text-light-primary hover:bg-light-primary/20"
                      } transition-all`}
                      title="Statistiques"
                    >
                      <BarChart3 size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, qrCode: null })}
        title="Aperçu du QR Code"
      >
        <div className="flex justify-center p-4">
          {previewModal.qrCode?.file_path ? (
            <img
              src={API.DEVBASEURL + previewModal.qrCode.file_path}
              alt="QR Code Preview"
              className="w-64 h-64 object-contain"
            />
          ) : (
            <div
              className={`w-64 h-64 ${
                theme === "dark"
                  ? "bg-dark-background/50"
                  : "bg-light-background/30"
              } rounded flex items-center justify-center flex-col`}
            >
              <Settings
                size={48}
                className={
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }
              />
              <p
                className={`text-sm mt-2 ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Aucune image disponible
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, qrCode: null })}
        title="Modifier le QR Code"
      >
        <div className="space-y-4">
          <input
            type="date"
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary border-dark-primary/50"
                : "bg-light-background/50 text-light-text-primary border-light-primary/50"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all`}
            value={newExpiry}
            onChange={(e) => setNewExpiry(e.target.value)}
          />
          <button
            className={`w-full px-4 py-2 rounded-lg font-sans text-sm ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary/80"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary-dark"
            } transition-all animate-pulse hover:animate-none`}
            onClick={handleUpdateExpiry}
          >
            Mettre à jour
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default QRGenerator;
