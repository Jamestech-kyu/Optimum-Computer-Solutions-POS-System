import { useState } from 'react';
import { useProductSearch } from '../../hooks/useProductSearch';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import Badge from '../common/Badge';

export default function ProductSearch() {
  const { results, loading, error, search, clearResults } = useProductSearch();
  const { addItem } = useCart();
  const [query, setQuery] = useState('');

  const handleType = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleAdd = (product) => {
    if (product.stock_quantity <= 0) return;
    addItem(product);
    setQuery('');
    clearResults();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search by product name or SKU..."
          value={query}
          onChange={handleType}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAdd(product)}
              disabled={product.stock_quantity <= 0}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 disabled:opacity-40 disabled:cursor-not-allowed first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    SKU: {product.sku}
                    {product.category_name && ` · ${product.category_name}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-600 text-sm">{formatCurrency(product.unit_price)}</p>
                  <Badge variant={product.stock_quantity <= 0 ? 'red' : product.is_low_stock ? 'yellow' : 'green'}>
                    {product.stock_quantity <= 0 ? 'Out of stock' : `${product.stock_quantity} left`}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}