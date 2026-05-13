import { useState, useCallback, useRef } from 'react';
import { getCustomers } from '../api/customers';

export function useCustomerSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef           = useRef(null);

  const search = useCallback((query) => {
    clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await getCustomers(query);
        setResults(data.results || data);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearResults = () => setResults([]);

  return { results, loading, search, clearResults };
}