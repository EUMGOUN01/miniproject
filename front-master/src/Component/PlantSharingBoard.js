import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import '../CSS/PlantSharingBoard.css';
import Footer from './Footer';

const PlantSharingBoard = () => {
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState([]); // 초기값을 빈 배열로 설정
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15); // 페이지 사이즈
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://10.125.121.180:8080/api/public/shareboard?page=${currentPage}&size=${pageSize}`);
        const data = await response.json();
        
        // 응답이 배열이 아닐 경우 처리
        if (Array.isArray(data)) {
          setBoardData(data);
        } else {
          setBoardData([]); // 데이터가 배열이 아닐 경우 빈 배열로 처리
        }

        setError(null);
      } catch (error) {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
        console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(0); // 검색 후 첫 페이지로 이동
  };

  const handlePostClick = (shareBoardId) => {
    navigate(`/plant-sharing/${shareBoardId}`);
  };

  const handlePostsPerPageChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(0); // 페이지 사이즈 변경 시 첫 페이지로 이동
  };

  // 검색어에 따라 게시글 필터링
  const filteredPosts = useMemo(() => 
    boardData.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase())), 
    [boardData, searchQuery]
  );

  return (
    <>
      <div className="plant-sharing-board-container">
        <div className="plant-sharing-board-header">
          <h1>식물 나눔 게시판</h1>
          <div className="plant-sharing-board-search-container">
            <div className="plant-sharing-board-search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="plant-sharing-board-search-input"
              />
              <CiSearch className="plant-sharing-board-search-icon" onClick={handleSearch} />
            </div>
            <div className="plant-sharing-board-button-container">
              <button onClick={() => navigate('/plant-sharing/write')} className="plant-sharing-board-write-button">작성</button>
            </div>
          </div>
        </div>
        
        <div className="plant-sharing-board-page-size-container">
          <label htmlFor="postsPerPage">페이지 사이즈:</label>
          <select id="postsPerPage" value={pageSize} onChange={handlePostsPerPageChange} className="plant-sharing-board-page-size-select">
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <table className="plant-sharing-board-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <tr key={post.shareBoardId} onClick={() => handlePostClick(post.shareBoardId)} className="board-row">
                    <td>{index + 1}</td>
                    <td>{post.title}</td>
                    <td>{post.username || '알 수 없음'}</td>
                    <td>{new Date(post.createDate).toLocaleDateString()}</td>
                    <td>{post.view}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">게시물이 없습니다</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PlantSharingBoard;