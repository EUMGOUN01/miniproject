// BoardPage.js
// 자유게시판 목록 보여줌.
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import '../CSS/BoardPage.css';
import Footer from './Footer';

const BoardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [boardData, setBoardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoardData = async (page, size) => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.125.121.180:8080/api/public/freeboard?page=${page}&size=${size}`);
      const data = await response.json();
      
      // 데이터 설정
      setBoardData(Array.isArray(data) ? data : []);
      
      // 총 페이지 수 계산 (총 데이터 개수는 데이터의 길이를 기반으로 계산)
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
    if (location.state?.shouldRefetch) {
      setCurrentPage(0);
    }
  }, [location.state]);

  const filteredPosts = useMemo(() => {
    return boardData.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [boardData, searchQuery]);

  const indexOfLastPost = (currentPage + 1) * pageSize;
  const indexOfFirstPost = indexOfLastPost - pageSize;

  const currentPosts = useMemo(() => filteredPosts.slice(indexOfFirstPost, indexOfLastPost), [filteredPosts, indexOfFirstPost, indexOfLastPost]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
  };

  const pageRange = 5;
  const startPage = Math.max(0, currentPage - Math.floor(pageRange / 2));
  const endPage = Math.min(totalPages - 1, startPage + pageRange - 1);

  return (
    <>
      <div className="board-container">
        <div className="board-header">
          <h1>자유 게시판</h1>
          <div className="board-search-container">
            <div className="board-search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="board-search-input"
              />
              <CiSearch className="board-search-icon" onClick={handleSearch} /> {/* 검색 아이콘 클릭 기능 추가 */}
            </div>
            <div className="board-button-container">
              <button onClick={handleSearch} className="board-search-button">검색</button>
              <button onClick={() => navigate('/write')} className="board-write-button">작성</button>
            </div>
          </div>
        </div>
        {loading && <div className="loading">로딩 중...</div>}
        {error && <div className="error">{error}</div>}
        <table className="board-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.length > 0 ? (
              currentPosts.map((post, index) => (
                <tr key={post.freeBoardId} onClick={() => navigate(`/post/${post.freeBoardId}`)} className="board-row">
                  <td>{indexOfFirstPost + index + 1}</td>
                  <td>{post.type}</td>
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

        <div className="board-pagination-container">
          <div className="board-pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="board-page-button" aria-label="Previous Page">이전</button>
            {startPage > 0 && (
              <>
                <span onClick={() => handlePageChange(0)} className="board-page-number">1</span>
                {startPage > 1 && <span className="board-page-dots">...</span>}
              </>
            )}
            {[...Array(endPage - startPage + 1).keys()].map(i => (
              <span key={startPage + i} onClick={() => handlePageChange(startPage + i)} className={`board-page-number ${currentPage === startPage + i ? 'active' : ''}`}>
                {startPage + i + 1}
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

export default BoardPage;