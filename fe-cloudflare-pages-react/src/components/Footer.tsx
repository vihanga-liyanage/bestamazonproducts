import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; 2023 Amazon Affiliate. All rights reserved.</p>
      <div className="social-links">
        <a href="/">Facebook</a>
        <a href="/">Twitter</a>
        <a href="/">Instagram</a>
      </div>
    </footer>
  );
};

export default Footer;