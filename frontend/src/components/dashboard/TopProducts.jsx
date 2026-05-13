import { formatCurrency } from '../../utils/formatCurrency';

export default function TopProducts({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sales data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product.product__id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{product.product__name}</p>
              <p className="text-xs text-gray-500">{product.total_qty} units</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.total_revenue)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
