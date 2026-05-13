import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function RecentSales({ sales }) {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent sales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-gray-600 font-semibold">ID</th>
              <th className="text-left py-3 px-2 text-gray-600 font-semibold">Amount</th>
              <th className="text-left py-3 px-2 text-gray-600 font-semibold">Method</th>
              <th className="text-left py-3 px-2 text-gray-600 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-gray-900 font-mono text-xs">#{sale.id}</td>
                <td className="py-3 px-2 font-semibold text-gray-900">{formatCurrency(sale.total_amount)}</td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                    {sale.payment_method || 'Unknown'}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-600 text-xs">{formatDate(sale.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
