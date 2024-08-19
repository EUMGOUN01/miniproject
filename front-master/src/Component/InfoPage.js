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

  const { data: plantData, loading: plantLoading, error: plantError } = usePlantDetail(apiKey, selectedPlant);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredGardenData = gardenData?.response?.body?.items?.item?.filter(garden =>
    garden.cntntsSj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (gardenLoading) return <p>로딩 중...</p>;
  if (gardenError) return <p>에러 발생: {gardenError}</p>;

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
      <div className="garden-list">
        {filteredGardenData && filteredGardenData.map((garden) => (
          <div className="garden-card" key={garden.cntntsNo}>
            <p><strong>{garden.cntntsSj}</strong></p>
            <p><strong>{garden.cntntsNo}</strong></p>
            <button onClick={() => handlePlantClick(garden.cntntsNo)}>상세 보기</button>
          </div>
        ))}
      </div>

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
                  {/* 추가 정보 표시 */}
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