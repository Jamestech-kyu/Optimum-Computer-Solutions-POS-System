import { useState, useEffect } from 'react';
import { getDashboardStatistics } from '../../api/dashboard';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatCurrency';
import StatCard from './StatCard';
import RecentSales from './RecentSales';
import TopProducts from './TopProducts';
import PaymentBreakdown from './PaymentBreakdown';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await getDashboardStatistics();
      setStats(data);
    } catch (error) {
      addNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Key Metrics - Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.today.revenue)}
          icon="💰"
          color="primary"
          trend={stats.growth.revenue_percentage > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.growth.revenue_percentage)}%`}
        />
        <StatCard
          title="Transactions"
          value={stats.today.transactions}
          icon="🛒"
          color="blue"
        />
        <StatCard
          title="Items Sold"
          value={stats.today.items_sold}
          icon="📦"
          color="accent"
        />
        <StatCard
          title="Avg Transaction"
          value={formatCurrency(stats.today.avg_transaction)}
          icon="📊"
          color="green"
        />
        <StatCard
          title="Returns"
          value={stats.today.returns}
          icon="↩️"
          color="red"
          highlight={stats.today.returns > 0}
        />
      </div>

      {/* Month Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">This Month Revenue</h3>
          <p className="text-3xl font-bold text-primary-700 mb-2">
            {formatCurrency(stats.this_month.revenue)}
          </p>
          <p className="text-xs text-gray-500">
            {stats.this_month.transactions} transactions
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Growth vs Last Month</h3>
          <p className={`text-3xl font-bold mb-2 ${stats.growth.revenue_percentage >= 0 ? 'text-green-600' : 'text-accent-500'}`}>
            {stats.growth.revenue_percentage > 0 ? '+' : ''}{stats.growth.revenue_percentage}%
          </p>
          <p className="text-xs text-gray-500">
            Last month: {formatCurrency(stats.growth.vs_last_month)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Returns & Refunds</h3>
          <p className="text-3xl font-bold text-accent-500 mb-2">{stats.this_month.returns}</p>
          <p className="text-xs text-gray-500">
            Amount: {formatCurrency(stats.this_month.return_amount)}
          </p>
        </div>
      </div>

      {/* Bottom Section - Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <TopProducts products={stats.top_products} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <PaymentBreakdown payments={stats.payment_methods} />
        </div>
      </div>

      {/* Metrics and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSales sales={stats.recent_sales} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="text-xl font-bold text-primary-700">{stats.metrics.total_customers}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-xl font-bold text-primary-700">{stats.metrics.total_products}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock Products</span>
              <span className={`text-xl font-bold ${stats.metrics.low_stock_products > 0 ? 'text-accent-500' : 'text-green-600'}`}>
                {stats.metrics.low_stock_products}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
