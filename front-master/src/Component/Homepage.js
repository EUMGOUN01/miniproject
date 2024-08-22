import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6'; // 아이콘 import
import ImageSlider from './ImageSlider'; 
import Footer from './Footer'; 
import '../CSS/Homepage.css';

const Homepage = () => {
  const [freeBoard, setFreeBoard] = useState([]);
  const [shareBoard, setShareBoard] = useState([]);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

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

  useEffect(()=>{
    loadFreeBoard();
    loadShareBoard();
  }, []);

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
            식물백과 
            <p className="button-ment">217가지의 놀라운 실내정원 식물들 알아보기</p> 
          </div>

          {/* 식물나눔 버튼 */}
          <div
            className="homepage-button green"
            onClick={() => handleNavigation('/plant-sharing')}
          >
            식물나눔
            {/* <FaChevronRight className="icon" /> */}
            <div className="board-content">
              <table className="board-table">
                <tbody>
                  {shareBoard.map(share => (
                      <tr key={share.shareBoardId} 
                          onClick={(e) => {
                            e.stopPropagation(); // 이벤트 전파 중지
                            console.log('Row clicked:', share.shareBoardId); // 디버깅 로그 추가
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
            {/* <FaChevronRight className="icon" /> */}
            <div className="board-content">
              <table className="board-table">
                <tbody>
                  {freeBoard.map(free => (
                      <tr key={free.freeBoardId} 
                          onClick={(e) => {
                            e.stopPropagation(); // 이벤트 전파 중지
                            console.log('Row clicked:', free.freeBoardId); // 디버깅 로그 추가
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