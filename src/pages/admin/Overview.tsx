import { useEffect, useState } from "react";
import { getAllOrders, getAllCookies, seedInitialData } from "../../firebase/services";
import type { OrderDocument } from "../../firebase/services";
import type { CookieDocument } from "../../firebase/services";
import { ShoppingCart, Cookie, TrendingUp, Clock } from "lucide-react";

export default function Overview() {
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [cookies, setCookies] = useState<CookieDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Seed initial data if needed
        await seedInitialData();
        
        const [ordersData, cookiesData] = await Promise.all([
          getAllOrders(),
          getAllCookies()
        ]);
        setOrders(ordersData);
        setCookies(cookiesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const preparingOrders = orders.filter(o => o.status === "preparing").length;
  const readyOrders = orders.filter(o => o.status === "ready").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Pending", value: pendingOrders, icon: Clock, color: "bg-yellow-500" },
    { label: "Preparing", value: preparingOrders, icon: TrendingUp, color: "bg-orange-500" },
    { label: "Ready", value: readyOrders, icon: ShoppingCart, color: "bg-green-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-amber-100/60 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 mb-8">
        <p className="text-amber-100/60 text-sm mb-1">Total Revenue</p>
        <p className="text-4xl font-bold text-amber-300">{totalRevenue.toFixed(2)} TND</p>
      </div>

      {/* Quick Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Menu Items</h2>
          </div>
          <p className="text-amber-100/60">
            {cookies.length} cookie types with {cookies.reduce((sum, c) => sum + c.flavors.length, 0)} total flavors
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Order Stats</h2>
          </div>
          <p className="text-amber-100/60">
            Average order: {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0"} TND
          </p>
        </div>
      </div>
    </div>
  );
}
