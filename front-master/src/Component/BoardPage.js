import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import '../CSS/BoardPage.css';
import Footer from './Footer';

const BoardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [boardData, setBoardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // 현재 입력된 검색어 상태
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(''); // 실제로 적용된 검색어 상태
  const [selectedCategory, setSelectedCategory] = useState(''); // 카테고리 상태
  const [privateType, setPrivateType] = useState('public'); // 전체보기/나만보기 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리와 privateType을 배열로 미리 정의
  const categories = ['질문', '수다']; // 카테고리 리스트
  const privateTypes = ['public', 'private']; // 전체보기/나만보기 리스트

  const fetchBoardData = async (page, size) => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.125.121.180:8080/api/public/freeboard?page=${page}&size=${size}`);
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

  // 페이지 이동 시 검색어와 카테고리 초기화
  useEffect(() => {
    if (location.pathname === '/board') {
      setSearchQuery('');
      setAppliedSearchQuery('');
      setSelectedCategory('');
      setPrivateType('public'); // 페이지 이동 시 기본 privateType 설정
    }
  }, [location.pathname]);

  const filteredPosts = useMemo(() => {
    return boardData
      .filter(post => post.title.toLowerCase().includes(appliedSearchQuery.toLowerCase())) // 실제 적용된 검색어에 따라 필터링
      .filter(post => (selectedCategory ? post.type === selectedCategory : true)) // 카테고리 필터
      .filter(post => post.privateType === privateType); // privateType 필터링 추가
  }, [boardData, appliedSearchQuery, selectedCategory, privateType]);

  const indexOfLastPost = (currentPage + 1) * pageSize;
  const indexOfFirstPost = indexOfLastPost - pageSize;

  const currentPosts = useMemo(() => filteredPosts.slice(indexOfFirstPost, indexOfLastPost), [filteredPosts, indexOfFirstPost, indexOfLastPost]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setSearchQuery(''); // 페이지를 변경할 때 검색어 초기화
      setAppliedSearchQuery(''); // 실제 적용된 검색어도 초기화
      setSelectedCategory(''); // 카테고리도 초기화
      setCurrentPage(pageNumber); // 페이지 변경
    }
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery); // 검색 버튼을 눌렀을 때 검색어를 적용
    setCurrentPage(0); // 검색 시 첫 페이지로 돌아감
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
              {/* privateType 선택 드롭다운 */}
              <select
                value={privateType}
                onChange={(e) => setPrivateType(e.target.value)}
                className="board-private-select"
              >
                {privateTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type === 'public' ? '전체보기' : '나만보기'}
                  </option>
                ))}
              </select>
              
              {/* 카테고리 선택 드롭다운 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="board-category-select"
              >
                <option value="">전체</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="board-search-input"
              />
              <CiSearch className="board-search-icon" onClick={handleSearch} />
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