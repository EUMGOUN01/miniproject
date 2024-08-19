// Homepage.js
// 메인 페이지
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6'; // 아이콘 import
import ImageSlider from './ImageSlider'; 
import Footer from './Footer'; 
import '../CSS/Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage">
      <div className="homepage-main-content">
        <ImageSlider />
        <div className="homepage-button-container">
          <div
            className="homepage-button yellow"
            onClick={() => handleNavigation('/info')}
          >
            식물백과
            <FaChevronRight className="icon" />
          </div>
          <div
            className="homepage-button green"
            onClick={() => handleNavigation('/sharing')}
          >
            식물나눔
            <FaChevronRight className="icon" />
          </div>
          <div
            className="homepage-button blue"
            onClick={() => handleNavigation('/board')}
          >
            커뮤니티
            <FaChevronRight className="icon" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;