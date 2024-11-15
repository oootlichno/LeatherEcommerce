import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='Footer'>
      { `Ecommerce ${currentYear}` }
    </footer>
  );
}

export default Footer;