export interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  affiliate_url: string;
  customerReviews?: number;
  bestSellersRank?: number;
}
