import React from 'react';
import '../styles/Banner.css';

interface BannerProps {
  title: string;
  subtitle: string;
}

const Banner: React.FC<BannerProps> = ({ title, subtitle }) => {
  return (
    <div className="banner">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default Banner;
