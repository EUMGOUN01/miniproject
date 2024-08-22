import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGardenList, usePlantDetail } from './hooks';
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
        {/* <div className="header-links">
          <span onClick={() => navigate('/info')} className="header-link">실내정원 식물</span>
          <span className="header-link-separator"> | </span>
          <span onClick={() => navigate('/variety-list')} className="header-link">농업기술길잡이</span>
        </div> */}
        <h1 className="garden-title move-left">실내정원 식물</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="이름을 입력하세요..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button>검색</button>
        </div>
      </div>
      {/*이미지 처리하는*/}
      <div className="garden-list">
        {filteredGardenData && filteredGardenData.map((garden) => (
          <div className="garden-card" key={garden.cntntsNo}>
            <img 
              src={garden.rtnThumbFileUrl.split('|')[0]} 
              alt="Image Thumbnail" 
            />
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
            {plantLoading ? <p>로딩 중...</p> : plantError ? <p>에러 발생: {plantError}</p> : (
              plantData && plantData.response && plantData.response.body && plantData.response.body.item && (
                <div style={{ textAlign: 'left' }}>
                  <p><strong>영어 이름:</strong> Checkerberry, Eastern Teaberry, (Spreading) Wintergreen</p>
                  <p><strong>과 이름:</strong> 63051</p>
                  <p><strong>원산지:</strong> 아시아, 아메리카, 캐나다</p>
                  <p><strong>관리:</strong> 식용, 지피, 약용, 향기, 관엽, 관화, 관실</p>
                  <p><strong>성장 높이:</strong> 15cm</p>
                  <p><strong>성장 폭:</strong> 25cm</p>
                  <p><strong>잎 모양:</strong> 화려함, 잎의 질감-중간, 잎의 광택-있음, 상록</p>
                  <p><strong>냄새 코드:</strong> 중간</p>
                  <p><strong>독성 정보:</strong> 없음</p>
                  <p><strong>번식 시대 정보:</strong> 파종-9~11월/분주-3~5월</p>
                  <p><strong>기타 시대 정보:</strong> 없음</p>
                  <p><strong>관리 수준:</strong> 경험자</p>
                  <p><strong>성장 속도:</strong> 느림</p>
                  <p><strong>성장 온도:</strong> 16~20℃</p>
                  <p><strong>겨울 최저 온도:</strong> 0℃ 이하</p>
                  <p><strong>습도 코드 이름:</strong> 40~70%</p>
                  <p><strong>토양:</strong> 중성, 산성 / 배수 잘 됨 (Loam, Sand)</p>
                  <p><strong>물 주기 봄:</strong> 토양 표면이 말랐을 때 충분히 관수함</p>
                  <p><strong>물 주기 여름:</strong> 토양 표면이 말랐을 때 충분히 관수함</p>
                  <p><strong>물 주기 가을:</strong> 토양 표면이 말랐을 때 충분히 관수함</p>
                  <p><strong>물 주기 겨울:</strong> 화분 흙 대부분 말랐을 때 충분히 관수함</p>
                  <p><strong>해충 관리:</strong> 없음</p>
                  <p><strong>특별 관리:</strong> 없음</p>
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