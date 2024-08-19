import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import '../CSS/PlantSharingBoard.css';
import Footer from './Footer';

const PlantSharingBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [boardData, setBoardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1); // Default to 1 since there are 10 items and pageSize is 15
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoardData = async (page, size) => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.125.121.180:8080/api/public/shareboard?page=${page}&size=${size}`);
      const data = await response.json();
      setBoardData(Array.isArray(data) ? data : []);
     
      const totalDataCount = data.length; 
      setTotalPages(Math.ceil(totalDataCount / size));

      setError(null);
    } catch (error) {
      setError('게시물을 불러오는 데 실패했습니다.');
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (location.pathname === '/plant-sharing') {
      setSearchQuery('');
      setAppliedSearchQuery('');
    }
  }, [location.pathname]);

  const filteredPosts = useMemo(() => {
    return boardData.filter(post =>
      post.title.toLowerCase().includes(appliedSearchQuery.toLowerCase())
    );
  }, [boardData, appliedSearchQuery]);

  const indexOfLastPost = (currentPage + 1) * pageSize;
  const indexOfFirstPost = indexOfLastPost - pageSize;

  const currentPosts = useMemo(() =>
    filteredPosts.slice(indexOfFirstPost, indexOfLastPost),
    [filteredPosts, indexOfFirstPost, indexOfLastPost]
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setSearchQuery('');
      setAppliedSearchQuery('');
      setCurrentPage(pageNumber);
    }
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(0);
  };

  const pageRange = 5;
  const startPage = Math.max(0, Math.min(currentPage - Math.floor(pageRange / 2), totalPages - pageRange));
  const endPage = Math.min(totalPages - 1, startPage + pageRange - 1);

  // Ensure valid length for pages array
  const pages = Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, i) => startPage + i);

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
              <button onClick={handleSearch} className="plant-sharing-board-search-button">검색</button>
              <button onClick={() => navigate('/plant-sharing/write')} className="plant-sharing-board-write-button">작성</button>
            </div>
          </div>
        </div>

        {loading && <div className="loading">로딩 중...</div>}
        {error && <div className="error">{error}</div>}
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
            {currentPosts.length > 0 ? (
              currentPosts.map((post, index) => (
                <tr key={post.shareBoardId} onClick={() => navigate(`/plant-sharing/${post.shareBoardId}`)} className="board-row">
                  <td>{indexOfFirstPost + index + 1}</td>
                  <td>{post.title}</td>
                  <td>{post.username || '알 수 없음'}</td>
                  <td>{new Date(post.createDate).toLocaleDateString()}</td>
                  <td>{post.view}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">게시물이 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="plant-sharing-board-pagination-container">
          <div className="plant-sharing-board-pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="board-page-button" aria-label="Previous Page">이전</button>
            {startPage > 0 && (
              <>
                <span onClick={() => handlePageChange(0)} className="board-page-number">1</span>
                {startPage > 1 && <span className="board-page-dots">...</span>}
              </>
            )}
            {pages.map(page => (
              <span key={page} onClick={() => handlePageChange(page)} className={`board-page-number ${currentPage === page ? 'active' : ''}`}>
                {page + 1}
              </span>
            ))}
            {endPage < totalPages - 1 && (
              <>
                {endPage < totalPages - 2 && <span className="board-page-dots">...</span>}
                <span onClick={() => handlePageChange(totalPages - 1)} className="board-page-number">{totalPages}</span>
              </>
            )}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="board-page-button" aria-label="Next Page">다음</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PlantSharingBoard;