import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { API } from "../utils/api";
import { useToast } from "../contexts/ToastContext";

const ProtectedQR = () => {
  const { identifier } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API.QR_CODES.VERIFY_PASSWORD}/${identifier}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Mot de passe incorrect", "error");
        return;
      }

      navigate(data.redirect_url);
    } catch (err) {
      addToast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md text-center animate-fadeIn">
        <Lock size={64} className="text-primary mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">QR Code protégé</h1>
        <p className="text-gray-400 mb-6">
          Ce QR Code est protégé par un mot de passe. Veuillez le saisir pour continuer.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="form-input w-full"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "opacity-75" : ""}`}
            disabled={loading}
          >
            {loading ? "Vérification..." : "Valider"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProtectedQR;