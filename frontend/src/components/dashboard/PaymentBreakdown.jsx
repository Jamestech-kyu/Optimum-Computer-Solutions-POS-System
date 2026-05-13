import { formatCurrency } from '../../utils/formatCurrency';

export default function PaymentBreakdown({ payments }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No payment data available</p>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.payment_method} className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 capitalize">{payment.payment_method || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{payment.count} transactions</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
            <p className="text-xs text-gray-500">{((payment.amount / total) * 100).toFixed(1)}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}
