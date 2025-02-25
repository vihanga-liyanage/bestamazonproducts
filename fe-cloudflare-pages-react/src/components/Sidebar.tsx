import React, {useEffect, useState} from 'react';
import ReactSlider from 'react-slider';
import '../styles/Sidebar.css';

interface SidebarProps {
  tempPriceRange: [number, number];
  setTempPriceRange: (range: [number, number]) => void;
  applyFilters: () => void;
  maxPrice: number;
}

const Sidebar: React.FC<SidebarProps> = ({ tempPriceRange, setTempPriceRange, applyFilters, maxPrice }) => {
  const [sliderMax, setSliderMax] = useState(maxPrice);

  useEffect(() => {
    setSliderMax(maxPrice); // Update slider max when products load
  }, [maxPrice]);

  return (
    <aside className="sidebar">
      <h3>Filters</h3>

      <div className="filter-section">
        <h4>Price Range</h4>

        <div className="price-inputs">
          <span>$</span>
          <input
            type="number"
            value={tempPriceRange[0]}
            onChange={(e) => setTempPriceRange([Math.max(0, Math.min(Number(e.target.value), tempPriceRange[1] - 10)), tempPriceRange[1]])}
          />
          <span> - $</span>
          <input
            type="number"
            value={tempPriceRange[1]}
            onChange={(e) => setTempPriceRange([tempPriceRange[0], Math.min(sliderMax, Math.max(Number(e.target.value), tempPriceRange[0] + 10))])}
          />
        </div>

        <ReactSlider
          className="price-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={0}
          max={sliderMax}
          step={10}
          value={tempPriceRange}
          onChange={(newValues: number[]) => setTempPriceRange([newValues[0], newValues[1]])}
          pearling
          minDistance={10}
        />

        <button className="apply-btn" onClick={applyFilters}>Apply</button>
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
