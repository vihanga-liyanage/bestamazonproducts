import React, { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import '../styles/Sidebar.css';

interface SidebarProps {
  tempPriceRange: [number, number];
  setTempPriceRange: (range: [number, number]) => void;
  applyFilters: (searchQuery: string) => void;
  maxPrice: number;
  setSortBy: (sortOption: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  tempPriceRange,
  setTempPriceRange,
  applyFilters,
  maxPrice,
  setSortBy,
}) => {
  const [sliderMax, setSliderMax] = useState(maxPrice);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSliderMax(maxPrice);
  }, [maxPrice]);

  return (
    <aside className="sidebar">
      <div className="search-section">
        <div className="search-header">
          <h2 className="search-title">Product Search</h2>
        </div>
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Find products by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="search-btn"
            onClick={() => applyFilters(searchQuery)}
          >
            Search
          </button>
        </div>
      </div>

      <div className="filters-section">
        <h3 className="filters-title">Sort Options</h3>
        <div className="sort-section">
          <select onChange={(e) => setSortBy(e.target.value)}>
            <option value="priceHighLow">Price: High to Low</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="customerReviews">Customer Reviews</option>
            <option value="bestSellers">Best Sellers</option>
          </select>
        </div>

        <h3 className="filters-title">Price Filter</h3>
        <div className="filter-section">
          <div className="price-inputs">
            <span>$</span>
            <input
              type="number"
              value={tempPriceRange[0]}
              onChange={(e) =>
                setTempPriceRange([
                  Math.max(0, Math.min(Number(e.target.value), tempPriceRange[1] - 10)),
                  tempPriceRange[1],
                ])
              }
            />
            <span> - $</span>
            <input
              type="number"
              value={tempPriceRange[1]}
              onChange={(e) =>
                setTempPriceRange([
                  tempPriceRange[0],
                  Math.min(sliderMax, Math.max(Number(e.target.value), tempPriceRange[0] + 10)),
                ])
              }
            />
          </div>

          <ReactSlider
            className="price-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            min={0}
            max={sliderMax}
            step={1}
            value={tempPriceRange}
            onChange={(newValues) => setTempPriceRange([newValues[0], newValues[1]])}
            pearling
            minDistance={1}
          />
        </div>
      </div>

      <div className="message-box">
        This site is supported by Amazon affiliate links - your support helps us keep going! 💕
      </div>
    </aside>
  );
};

export default Sidebar;
