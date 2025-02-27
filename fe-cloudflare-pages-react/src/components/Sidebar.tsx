import React, { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import '../styles/Sidebar.css';

interface SidebarProps {
  tempPriceRange: [number, number];
  setTempPriceRange: (range: [number, number]) => void;
  applyFilters: () => void;
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

  useEffect(() => {
    setSliderMax(maxPrice); // Update slider max when products load
  }, [maxPrice]);

  return (
    <aside className="sidebar">
      <h3>Sort By</h3>
      <div className="sort-section">
        <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="priceHighLow">Price: High to Low</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="customerReviews">Customer Reviews</option>
          <option value="bestSellers">Best Sellers</option>
        </select>
      </div>

      <h3>Filters</h3>
      <div className="filter-section">
        <h4>Price Range</h4>
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
          onChange={(newValues: number[]) => setTempPriceRange([newValues[0], newValues[1]])}
          pearling
          minDistance={1}
        />

        <button className="apply-btn" onClick={applyFilters}>
          Apply
        </button>
      </div>

      <ul>
        <li>Categories</li>
        <li>Top Deals</li>
      </ul>

      <div className="message-box">
        This site is supported by Amazon affiliate links - your support helps us keep going! 💕
      </div>
    </aside>
  );
};

export default Sidebar;
