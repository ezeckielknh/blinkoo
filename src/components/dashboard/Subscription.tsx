import { CreditCard, Check, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useState } from 'react';
import { API } from '../../utils/api';

const Subscription = () => {
  const { user } = useAuth(); // Assure-toi que `refreshUser()` existe dans ton AuthContext
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "enterprise" | null>(null);
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("MTN");
  interface Plan {
    key: 'premium' | 'enterprise';
    // other properties
  }
  
  

  const handleUpgrade = async (plan: "premium" | "enterprise") => {
    setSelectedPlan(plan);
  };

  const confirmPayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const res = await fetch(`${API.BASE_URL}/transactions/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: selectedPlan === "premium" ? 100 : 200,
          currency: "XOF",
          network,
          phone,
          name: user?.name || "",
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data?.error || "Erreur lors de l'initialisation du paiement", "error");
        setLoading(false);
        return;
      }

      const transactionId = data.transaction.id;

      // ⏳ Lancer un polling toutes les secondes (max 5 fois)
      let attempt = 0;
      const interval = setInterval(async () => {
        attempt++;
        const verifyRes = await fetch(`h${API.BASE_URL}/transactions/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ transaction_id: transactionId }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.plan) {
          clearInterval(interval);
          addToast("Votre plan a été mis à jour !", "success");
          setLoading(false);
          setSelectedPlan(null);
        } else if (attempt >= 5) {
          clearInterval(interval);
          addToast("Le paiement n’a pas été confirmé à temps.", "error");
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      addToast("Erreur réseau", "error");
      setLoading(false);
    }
  };

  const plans: {
    name: string;
    key: "free" | "premium" | "enterprise";
    price: string;
    period: string;
    features: string[];
    disabled: boolean;
  }[] = [
    {
      name: 'Free',
      key: 'free',
      price: '$0',
      period: 'forever',
      features: ['10 links/month', 'Basic analytics', 'Standard QR codes', 'File sharing up to 5MB'],
      disabled: user?.plan === 'free',
    },
    {
      name: 'Premium',
      key: 'premium',
      price: '$100',
      period: 'one-time',
      features: ['Unlimited links', 'Advanced analytics', 'Custom QR codes', 'File sharing up to 100MB', 'Custom domains'],
      disabled: user?.plan === 'premium',
    },
    {
      name: 'Enterprise',
      key: 'enterprise',
      price: '$200',
      period: 'one-time',
      features: ['Everything in Premium', 'Team collaboration', 'API access', '1GB files', 'Priority support'],
      disabled: user?.plan === 'enterprise',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscription</h1>

      {/* ✅ Summary */}
      <div className="card bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Current Plan: {user?.plan}</h2>
            <p className="text-gray-400 mb-4">
              {user?.plan === 'free' ? 'Upgrade to unlock all features!' : 'You have full access.'}
            </p>
          </div>
          <div className="p-3 bg-card rounded-lg"><Star size={24} className="text-primary" /></div>
        </div>
      </div>

      {/* 🔁 Payment Form */}
      {selectedPlan && (
        <div className="card bg-secondary/5 space-y-4">
          <h3 className="text-lg font-semibold">Paiement pour le plan {selectedPlan}</h3>
          <input
            type="text"
            placeholder="Numéro de téléphone (ex: 229XXXXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input w-full"
          />
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="form-select w-full"
          >
            <option value="MTN">MTN</option>
            <option value="MOOV">MOOV</option>
          </select>
          <button onClick={confirmPayment} disabled={loading} className="btn btn-primary">
            {loading ? "Traitement..." : "Confirmer le paiement"}
          </button>
        </div>
      )}

      {/* 💳 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className="card relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center text-sm text-gray-500">
                  <Check size={16} className="text-primary mr-2" /> {f}
                </li>
              ))}
            </ul>
{(plan.key === "premium" || plan.key === "enterprise") && (
  <button
    onClick={() => handleUpgrade(plan.key as "premium" | "enterprise")}
    className={`btn w-full ${plan.disabled ? "btn-outline opacity-50" : "btn-secondary"}`}
    disabled={plan.disabled}
  >
    {plan.disabled ? "Current Plan" : "Upgrade Now"}
  </button>
)}

          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
