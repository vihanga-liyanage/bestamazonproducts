curl -X POST "https://localhost:8787/products" \
-H "Content-Type: application/json" \
-d '[
  {
    "title": "Wireless Bluetooth Earbuds",
    "description": "High-quality sound with noise cancellation.",
    "price": 49.99,
    "image_url": "https://images.unsplash.com/photo-1590658006821-04f4008d5717",
    "affiliate_url": "https://www.amazon.com/dp/B08TXYZ"
  }
]'