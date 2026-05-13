import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function CustomerSearchForm({
  onSearch,
  isLoading,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tier, setTier] = useState('');
  const [minSpent, setMinSpent] = useState('');
  const [maxSpent, setMaxSpent] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      q: searchQuery,
      tier: tier || undefined,
      min_spent: minSpent || undefined,
      max_spent: maxSpent || undefined,
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setTier('');
    setMinSpent('');
    setMaxSpent('');
    onSearch({});
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          loading={isLoading}
        >
          Search
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyalty Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Tiers</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Spent (Ksh)
              </label>
              <input
                type="number"
                value={minSpent}
                onChange={(e) => setMinSpent(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Spent (Ksh)
              </label>
              <input
                type="number"
                value={maxSpent}
                onChange={(e) => setMaxSpent(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                step="0.01"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                type="button"
                onClick={handleReset}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
