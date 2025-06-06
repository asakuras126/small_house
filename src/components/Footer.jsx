import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <p>情侣日程小程序 &copy; {currentYear}</p>
    </footer>
  );
}

export default Footer;