import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='Footer'>
      <div className='footer-content'>
        <div className='address'>
          <h3>Address:</h3>
          <p>6323 Virginia Fields Drive, Katy, TX, 77494</p>
        </div>
        <div className='copyright'>
          <p>&copy; LeatherUp {currentYear}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;