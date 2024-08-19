import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Header.css';  // CSS 파일을 임포트

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 로그인 상태 관리

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인하여 로그인 상태 설정
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);  // 토큰이 있으면 로그인 상태로 설정
  }, []);

  const handleLogout = () => {
    // 로그아웃 시 토큰 삭제하고 로그인 상태 변경
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert('로그아웃 되었습니다.');
    navigate('/login');  // 로그인 페이지로 리다이렉트
  };

  return (
    <header className="header">
      <div className="top-nav">
        {!isLoggedIn ? (
          <span className="top-nav-item" onClick={() => navigate('/login')}>로그인</span>
        ) : (
          <span className="top-nav-item" onClick={handleLogout}>로그아웃</span>
        )}
      </div>
      <hr className="divider" />
      <h1 onClick={() => navigate('/')}>Greenery</h1>
      <hr className="divider" />
      <nav>
        <div className="nav-item" onClick={() => navigate('/info')}>식물백과</div>
        <div className="nav-item" onClick={() => navigate('/plant-sharing')}>식물나눔</div>
        <div className="nav-item" onClick={() => navigate('/board')}>커뮤니티</div>
        <div className="nav-item" onClick={() => navigate('/community-garden')}>공용텃밭</div>
      </nav>
    </header>
  );
};

export default Header;