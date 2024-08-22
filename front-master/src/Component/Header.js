import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Header.css';  // CSS 파일을 임포트

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 로그인 상태 관리
  const [username, setUsername] = useState('');  // 유저 네임 상태 관리

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(!!token);  // 토큰이 있으면 로그인 상태로 설정
    setUsername(storedUsername || '');  // 유저 네임 설정
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');
      setIsLoggedIn(!!token);
      setUsername(storedUsername || '');
    };

    window.addEventListener('storage', handleStorageChange);  // storage 이벤트 리스너 추가

    return () => {
      window.removeEventListener('storage', handleStorageChange);  // 컴포넌트가 언마운트될 때 리스너 제거
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    alert('로그아웃 되었습니다.');
    
    window.dispatchEvent(new Event('storage'));  // 강제로 storage 이벤트 트리거
    
    navigate('/login');  // 로그인 페이지로 리다이렉트
  };

  return (
    <header className="header">
      <div className="top-nav">
        {!isLoggedIn && (
          <span className="top-nav-item" onClick={() => navigate("/signup")}>회원가입</span>
        )}
        {!isLoggedIn ? (
          <span className="top-nav-item" onClick={() => navigate('/login')}>로그인</span>
        ) : (
          <div className="user-info">
            <span className="username">환영합니다, {username}님</span>
            <span className="top-nav-item logout" onClick={handleLogout}>로그아웃</span>
          </div>
        )}
      </div>
      <hr className="divider" />
      <h1 onClick={() => navigate('/')}>Greenery</h1>  {/* 로고 클릭 시 메인 페이지로 이동 */}
      <hr className="divider" />
      <nav>
        <div className="nav-item" onClick={() => navigate('/info')}>식물백과</div>  {/* 식물백과 페이지 */}
        <div className="nav-item" onClick={() => navigate('/plant-sharing')}>식물나눔</div>  {/* 식물나눔 페이지 */}
        <div className="nav-item" onClick={() => navigate('/board')}>커뮤니티</div>  {/* 커뮤니티 페이지 */}
        <div className="nav-item" onClick={() => navigate('/community-garden')}>공용텃밭</div>  {/* 공용텃밭 페이지 */}
      </nav>
    </header>
  );
};

export default Header;