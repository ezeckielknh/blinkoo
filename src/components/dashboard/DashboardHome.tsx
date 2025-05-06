import {
  BarChart2,
  Link2,
  QrCode,
  FileBox,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const DashboardHome = () => {
  const { user } = useAuth();

  // Sécurité : fallback vide si user pas encore chargé
  const shortLinks = user?.short_links || [];
const qrCodes = user?.qr_codes || [];
const fileLinks = user?.file_links || [];

const totalClicks = shortLinks.reduce((sum, link) => sum + (link.click_count || 0), 0);
const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0);
const totalDownloads = fileLinks.reduce((sum, file) => sum + (file.download_count || 0), 0);

const totalInteractions = totalClicks + totalScans + totalDownloads;


  const stats = [
    {
      name: "Total Links",
      value: shortLinks.length,
      icon: Link2,
    },
    {
      name: "QR Codes",
      value: qrCodes.length,
      icon: QrCode,
    },
    {
      name: "Files Shared",
      value: fileLinks.length,
      icon: FileBox,
    },
    {
      name: "Total Clicks",
      value: totalClicks,
      icon: BarChart2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bon retour, {user?.name} !</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.name}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon size={20} className="text-primary" />
                </div>
              </div>
              {/* Optionnel : tu peux ajouter des pourcentages ici si tu les calcules côté backend */}
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Nom</th>
                <th className="text-center py-3 px-4">Date</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "Link", name: "https://example.com", date: "2023-08-01" },
                { type: "QR Code", name: "QR-123456", date: "2023-08-02" },
                { type: "File", name: "document.pdf", date: "2023-08-03" },
              ].map((activity, index) => (
                <tr key={index} className="border-b border-gray-800 last:border-0">
                  <td className="py-3 px-4">{activity.type}</td>
                  <td className="py-3 px-4">{activity.name}</td>
                  <td className="text-center py-3 px-4">{activity.date}</td>
                  <td className="text-right py-3 px-4">
                    <button className="text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Recent Files */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Fichiers récents</h2>
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
              {fileLinks.map((file) => (
                <tr key={file.id} className="border-b border-gray-800 last:border-0">
                  <td className="py-3 px-4">{file.name}</td>
                  <td className="text-center py-3 px-4">{file.downloads}</td>
                  <td className="text-center py-3 px-4">{file.expiration}</td>
                  <td className="text-right py-3 px-4">
                    <button className="text-primary hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="card bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Current Plan: {user?.plan}
            </h3>
            <p className="text-gray-400 mb-4">
              {user?.plan === "free"
                ? "Upgrade to Premium for more features!"
                : "You're getting the most out of Blinkoo!"}
            </p>
            {user?.plan === "free" && (
              <button className="btn btn-primary">
                Upgrade Now
              </button>
            )}
          </div>
          <div className="p-3 bg-card rounded-lg">
            <CreditCard size={24} className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
