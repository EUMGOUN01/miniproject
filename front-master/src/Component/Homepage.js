import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageSlider from './ImageSlider'; 
import Footer from './Footer'; 
import '../CSS/Homepage.css';

const Homepage = () => {
  const [freeBoard, setFreeBoard] = useState([]);
  const [shareBoard, setShareBoard] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 확인
  const [username, setUsername] = useState(''); // 현재 로그인한 사용자 이름
  const navigate = useNavigate();

  // 로그인 상태 확인 함수
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
      setUsername(''); // 로그아웃 상태에서는 username을 빈 값으로 설정
    }
  }, []);

  // 자유게시판 데이터 로드
  const loadFreeBoard = async () => {
    try {
      const response = await fetch('http://10.125.121.180:8080/api/public/freeboard/latest');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setFreeBoard(result);
    } catch (error) {
      console.error('Error fetching Free Board:', error);
    }
  };

  // 식물나눔 데이터 로드
  const loadShareBoard = async () => {
    try {
      const response = await fetch('http://10.125.121.180:8080/api/public/shareboard/latest');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setShareBoard(result);
    } catch (error) {
      console.error('Error fetching Share Board:', error);
    }
  };

  // 데이터 로드 (마운트 시 실행)
  useEffect(() => {
    loadFreeBoard();
    loadShareBoard();
  }, []);

  // 게시글 필터링 (로그인 여부와 게시글 작성자에 따라)
  const filterPosts = (posts) => {
    return posts.filter(post => {
      if (post.privateType === '나만보기') {
        // '나만보기' 글일 때
        if (!isLoggedIn) {
          // 로그인하지 않은 경우 표시되지 않음
          return false;
        } else if (isLoggedIn && post.username !== username) {
          // 로그인했지만 해당 글의 작성자가 아닌 경우 표시되지 않음
          return false;
        }
      }
      // '나만보기'가 아니거나, 작성자인 경우 표시
      return true;
    });
  };

  // 경로 이동 함수
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage">
      <div className="homepage-main-content">
        <ImageSlider />
        <div className="homepage-button-container">

          {/* 식물백과 버튼 */}
          <div
            className="homepage-button yellow"
            onClick={() => handleNavigation('/info')}
          >
             <p>식물백과</p>
             <img src="/vvv.png" alt="식물백과 이미지" className="plant-info-image" />
          </div>

          {/* 식물나눔 버튼 */}
          <div
            className="homepage-button green"
            onClick={() => handleNavigation('/plant-sharing')}
          >
            식물나눔
            <div className="board-content">
              <table className="board-table">
                <tbody>
                  {filterPosts(shareBoard).map(share => (
                    <tr
                      key={share.shareBoardId}
                      onClick={(e) => {
                        e.stopPropagation(); // 이벤트 전파 중지
                        navigate(`/plant-sharing/${share.shareBoardId}`);
                      }}
                      className="board-row"
                    >
                      <td>{share.type}</td>
                      <td>{share.title}</td>
                      <td>{new Date(share.createDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 커뮤니티 버튼 */}
          <div
            className="homepage-button blue"
            onClick={() => handleNavigation('/board')}
          >
            커뮤니티
            <div className="board-content">
              <table className="board-table">
                <tbody>
                  {filterPosts(freeBoard).map(free => (
                    <tr
                      key={free.freeBoardId}
                      onClick={(e) => {
                        e.stopPropagation(); // 이벤트 전파 중지
                        navigate(`/post/${free.freeBoardId}`);
                      }}
                      className="board-row"
                    >
                      <td>{free.type}</td>
                      <td>{free.title}</td>
                      <td>{new Date(free.createDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;