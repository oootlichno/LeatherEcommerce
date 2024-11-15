import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='Footer'>
        <div className='address'>
        <h3>Address:</h3>
        <p>6323 Virginia Fields Drive, Katy,TX, 77494</p>
        </div>
      { `LeatherUp ${currentYear}` }
    </footer>
  );
}

export default Footer;