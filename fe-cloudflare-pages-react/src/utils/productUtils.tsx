import { Product } from '../types/Product';

export const sortProducts = (products: Product[], sortBy: string) => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'priceLowHigh': return a.price - b.price;
      case 'priceHighLow': return b.price - a.price;
      case 'customerReviews': return (b.customerReviews ?? 0) - (a.customerReviews ?? 0);
      case 'bestSellers': return (a.bestSellersRank ?? Number.MAX_VALUE) - (b.bestSellersRank ?? Number.MAX_VALUE);
      default: return 0;
    }
  });
};

export const filterProducts = (products: Product[], priceRange: [number, number], searchQuery: string) => {
  const query = searchQuery.toLowerCase();
  return products.filter((product) => 
    product.price >= priceRange[0] && 
    product.price <= priceRange[1] &&
    (product.title.toLowerCase().includes(query) ||
    product.description?.toLowerCase().includes(query))
  );
};
