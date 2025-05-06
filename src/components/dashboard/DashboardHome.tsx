import { BarChart2, Link2, QrCode, FileBox, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHome = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Links', value: '24', icon: Link2, change: '+12%' },
    { name: 'QR Codes', value: '8', icon: QrCode, change: '+25%' },
    { name: 'Files Shared', value: '15', icon: FileBox, change: '+8%' },
    { name: 'Total Clicks', value: '1.2k', icon: BarChart2, change: '+18%' },
  ];
  console.log(user);

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
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500">{stat.change}</span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Link2 size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">example-link-{i + 1}</p>
                  <p className="text-sm text-gray-400">https://blinkoo.com/abc{i + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">24 clicks</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Card */}
      <div className="card bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Plan: {user?.plan}</h3>
            <p className="text-gray-400 mb-4">
              {user?.plan === 'free' ? 'Upgrade to Premium for more features!' : 'You\'re getting the most out of Blinkoo!'}
            </p>
            {user?.plan === 'free' && (
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