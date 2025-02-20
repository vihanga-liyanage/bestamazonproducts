import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './components/ProductCard';

// Define the Product interface (same as in ProductCard.tsx)
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_url: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/products`)
      .then((response) => setProducts(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Amazon Affiliate Products</h1>
      <div>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default App;
