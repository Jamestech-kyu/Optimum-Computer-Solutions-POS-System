import { useState } from 'react';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';
import { useCart } from '../../context/CartContext';
import Input from '../common/Input';
import Spinner from '../common/Spinner';

export default function CustomerSearch() {
  const { results, loading, search, clearResults } = useCustomerSearch();
  const { cart, setCustomer } = useCart();
  const [query, setQuery] = useState('');

  const handleType = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleSelect = (customer) => {
    setCustomer(customer);
    setQuery(customer.name);
    clearResults();
  };

  const handleClear = () => {
    setCustomer(null);
    setQuery('');
    clearResults();
  };

  return (
    <div className="relative">

      {/* Search input row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by name or phone number..."
            value={query}
            onChange={handleType}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
        {cart.customer && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {/* Selected customer display */}
      {cart.customer && (
        <div className="mt-2 flex items-center gap-2 text-sm bg-green-50 rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
          <span className="font-medium text-green-800">{cart.customer.name}</span>
          {cart.customer.phone && (
            <span className="text-green-600 text-xs">· {cart.customer.phone}</span>
          )}
        </div>
      )}

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((customer) => (
            <button
              key={customer.id}
              onClick={() => handleSelect(customer)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 first:rounded-t-xl last:rounded-b-xl"
            >
              <p className="font-medium text-gray-800 text-sm">{customer.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {customer.phone && <span>{customer.phone}</span>}
                {customer.phone && customer.email && <span> · </span>}
                {customer.email && <span>{customer.email}</span>}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}