import { useState, useEffect } from 'react';
import { getDailySummary, getTransactionHistory } from '../api/reports';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, todayISO } from '../utils/formatDate';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';

// Single metric card component used just in this page
function MetricCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 border-blue-100',
    green:  'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    orange: 'bg-orange-50 border-orange-100',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

const COLUMNS = [
  { key: 'sale_number',   label: 'Sale #' },
  { key: 'created_at',    label: 'Date & Time',  render: (v) => formatDate(v) },
  { key: 'customer_name', label: 'Customer',     render: (v) => v || 'Walk-in' },
  { key: 'cashier_name',  label: 'Cashier' },
  { key: 'total_amount',  label: 'Total',        render: (v) => formatCurrency(v) },
  {
    key: 'status',
    label: 'Status',
    render: (v) => (
      <Badge variant={v === 'completed' ? 'green' : v === 'voided' ? 'red' : 'yellow'}>
        {v}
      </Badge>
    ),
  },
];

export default function ReportsPage() {
  const [date,         setDate        ] = useState(todayISO());
  const [summary,      setSummary     ] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading     ] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [sumRes, txRes] = await Promise.all([
          getDailySummary(date),
          getTransactionHistory({ date }),
        ]);
        setSummary(sumRes.data);
        setTransactions(txRes.data.results || txRes.data || []);
      } catch {
        setSummary(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [date]);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header row with date picker */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Daily summary and transaction history</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Transactions"
          value={summary?.total_sales ?? '—'}
          icon="🧾"
          color="blue"
        />
        <MetricCard
          label="Gross Revenue"
          value={summary?.gross_revenue ? formatCurrency(summary.gross_revenue) : '—'}
          icon="💰"
          color="green"
        />
        <MetricCard
          label="Tax Collected"
          value={summary?.total_tax ? formatCurrency(summary.total_tax) : '—'}
          icon="📋"
          color="purple"
        />
        <MetricCard
          label="Discounts Given"
          value={summary?.total_discounts ? formatCurrency(summary.total_discounts) : '—'}
          icon="🏷️"
          color="orange"
        />
      </div>

      {/* Transaction table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">
          Transaction History
        </h2>
        <Table
          columns={COLUMNS}
          data={transactions}
          loading={loading}
          emptyMessage="No transactions recorded for this date."
        />
      </div>
    </div>
  );
}