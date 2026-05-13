import { useState, useCallback, useRef } from 'react';
import { getProducts } from '../api/products';

export function useProductSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState(null);
  const debounceRef           = useRef(null);

  const search = useCallback((query) => {
    // Cancel the previous timer every time the user types
    clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Wait 300ms after the user stops typing before calling the API
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getProducts(query);
        setResults(data.results || data);
      } catch {
        setError('Product search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearResults = () => setResults([]);

  return { results, loading, error, search, clearResults };
}