import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import '../CSS/PlantSharingBoard.css';
import Footer from './Footer';

const PlantSharingBoard = () => {
  const navigate = useNavigate();
  const [boardData, setBoardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://10.125.121.180:8080/api/public/shareboard?page=${currentPage - 1}&size=${postsPerPage}`);
        const data = await response.json();
        setBoardData(data);
      } catch (error) {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
        console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [currentPage, postsPerPage]);

  const filteredPosts = useMemo(() =>
    boardData.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [boardData, searchQuery]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = useMemo(() =>
    filteredPosts.slice(indexOfFirstPost, indexOfLastPost),
    [filteredPosts, indexOfFirstPost, indexOfLastPost]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePostClick = (shareBoardId) => {
    console.log('클릭된 게시물 ID:', shareBoardId);
    navigate(`/plant-sharing/${shareBoardId}`);
  };

  const handlePostsPerPageChange = (event) => {
    setPostsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    document.title = "식물 나눔";
  }, []);

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
              <CiSearch className="plant-sharing-board-search-icon" />
            </div>
            <div className="plant-sharing-board-button-container">
              <button
                onClick={handleSearch}
                className="plant-sharing-board-search-button"
                disabled={loading}
              >
                검색
              </button>
              <button
                onClick={() => navigate('/plant-sharing/write')}
                className="plant-sharing-board-write-button"
              >
                작성
              </button>
            </div>
          </div>
        </div>
        <div className="plant-sharing-board-page-size-container">
          <label htmlFor="postsPerPage">페이지 사이즈:</label>
          <select id="postsPerPage" value={postsPerPage} onChange={handlePostsPerPageChange} className="plant-sharing-board-page-size-select">
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
          <>
            <table className="plant-sharing-board-table">
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
                  currentPosts.map((post) => (
                    <tr
                      key={post.shareBoardId} // 각 게시물에 고유한 key를 추가합니다
                      onClick={() => handlePostClick(post.shareBoardId)}
                    >
                      <td>{filteredPosts.findIndex(p => p.shareBoardId === post.shareBoardId) + 1}</td>
                      <td>{post.type}</td>
                      <td>{post.title}</td>
                      <td>{post.username}</td>
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
            <div className="plant-sharing-board-pagination-container">
              <div className="plant-sharing-board-pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="plant-sharing-board-page-button"
                  aria-label="Previous Page"
                >
                  이전
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <span
                    key={number + 1} // 페이지 번호에 고유한 key를 추가합니다
                    onClick={() => handlePageChange(number + 1)}
                    className={`plant-sharing-board-page-number ${currentPage === number + 1 ? 'active' : ''}`}
                  >
                    {number + 1}
                  </span>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="plant-sharing-board-page-button"
                  aria-label="Next Page"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PlantSharingBoard;