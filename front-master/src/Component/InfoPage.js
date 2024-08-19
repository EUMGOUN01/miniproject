import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGardenList, usePlantDetail } from '../Component/Hook';
import '../CSS/InfoPage.css';

const InfoPage = () => {
  const apiKey = process.env.REACT_APP_API_KEY;
  const navigate = useNavigate();
  const { data: gardenData, loading: gardenLoading, error: gardenError } = useGardenList(apiKey);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCloseModal = () => setSelectedPlant(null);
  const handlePlantClick = (cntntsNo) => setSelectedPlant(cntntsNo);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const { data: plantData, loading: plantLoading, error: plantError } = usePlantDetail(apiKey, selectedPlant);

  // 검색어에 따른 필터링된 데이터
  const filteredGardenData = gardenData?.response?.body?.items?.item?.filter(garden =>
    garden.cntntsSj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="garden-body">
      <div className="header-container">
        <div className="header-links">
          <span onClick={() => navigate('/info')} className="header-link">실내정원 식물</span>
          <span className="header-link-separator"> | </span>
          <span onClick={() => navigate('/variety-list')} className="header-link">농업기술길잡이</span>
        </div>
        <h1 className="garden-title move-left">실내정원 식물</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button>검색</button>
        </div>
      </div>

      {/* 로딩 및 에러 처리 */}
      {gardenLoading ? (
        <p>로딩 중...</p>
      ) : gardenError ? (
        <p>에러 발생: {gardenError}</p>
      ) : (
        <div className="garden-list">
          {filteredGardenData.length > 0 ? (
            filteredGardenData.map((garden) => (
              <div className="garden-card" key={garden.cntntsNo}>
                <p><strong>{garden.cntntsSj}</strong></p>
                <p>{garden.cntntsNo}</p>
                <button onClick={() => handlePlantClick(garden.cntntsNo)}>상세 보기</button>
              </div>
            ))
          ) : (
            <p>검색된 결과가 없습니다.</p>
          )}
        </div>
      )}

      {/* 선택된 식물이 있을 때만 모달 렌더링 */}
      {selectedPlant && (
        <div className="garden-modal">
          <div className="garden-modal-content">
            <span className="garden-close" onClick={handleCloseModal}>&times;</span>
            {plantLoading ? (
              <p>로딩 중...</p>
            ) : plantError ? (
              <p>에러 발생: {plantError}</p>
            ) : (
              plantData && (
                <div>
                  <p><strong>이름:</strong> {plantData.distbNm}</p>
                  <p><strong>콘텐츠 번호:</strong> {plantData.cntntsNo}</p>
                  {/* 추가 정보 */}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPage;