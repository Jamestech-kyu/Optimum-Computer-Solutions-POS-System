import { useState, useEffect } from 'react';
import { getTaxConfig } from '../api/config';

export function useTaxConfig() {
  // Default to 16% VAT in case the API hasn't loaded yet
  const [taxRate, setTaxRate] = useState(0.16);

  useEffect(() => {
    getTaxConfig()
      .then(({ data }) => {
        const rates  = data.results || data;
        const active = rates.find((t) => t.is_active);
        if (active) {
          setTaxRate(parseFloat(active.rate));
        }
      })
      .catch(() => {
        // Silently keep the default 16% if the request fails
      });
  }, []);

  return taxRate;
}