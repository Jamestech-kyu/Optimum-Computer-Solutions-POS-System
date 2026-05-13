import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onView,
  isLoading,
}) {
  const getTierBadge = (tier) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-slate-100 text-slate-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Tier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Loyalty Points
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Total Purchases
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {customer.full_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {customer.phone}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {customer.email || '—'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTierBadge(customer.loyalty_tier)}`}>
                  {customer.loyalty_tier}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {customer.loyalty_points}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ksh {customer.total_purchases.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(customer.id)}
                    className="text-primary-700 hover:text-primary-800 p-1"
                    title="View details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="text-primary-700 hover:text-primary-800 p-1"
                    title="Edit customer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(customer.id)}
                    className="text-accent-500 hover:text-accent-600 p-1"
                    title="Delete customer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
