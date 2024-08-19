import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={footerContentStyle}>
        <p style={footerTextStyle}>문의: example@example.com</p>
        <p style={footerTextStyle}>© 2024 Greenery. All rights reserved.</p>
      </div>
    </footer>
  );
};

// 스타일 
const footerStyle = {
  backgroundColor: '#071918',
  color: '#ffffff',
  padding: '20px',
  textAlign: 'center',
  position: 'relative',
  bottom: '0',
  width: '100%',
};

const footerContentStyle = {
  margin: '0 auto',
  maxWidth: '1200px',
};

const footerTextStyle = {
  margin: '5px 0',
  fontSize: '14px',
};

export default Footer;