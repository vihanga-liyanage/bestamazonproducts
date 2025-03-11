import { useState, useEffect } from 'react';
import { Product } from '../types/Product';

const useProducts = (isReward: number = 0) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `${import.meta.env.VITE_API_URL}/products`;
        if (isReward) {
          url += `?isReward=${isReward}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();

        setProducts(data);
        const newMaxPrice = Math.max(...data.map((p: Product) => p.price), 0) + 100;
        setMaxPrice(newMaxPrice);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isReward]); // Re-fetch if productType changes

  return { products, maxPrice, error, loading };
};

export default useProducts;
