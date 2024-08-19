import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGardenList, usePlantDetail } from '../Component/hooks'; // 훅 불러오기
import '../CSS/InfoPage.css'; // 스타일링

const InfoPage = () => {
  const apiKey = process.env.REACT_APP_API_KEY; // 환경 변수에서 API 키 가져오기
  const navigate = useNavigate(); // 페이지 전환을 위한 훅
  const { data: gardenData, loading: gardenLoading, error: gardenError } = useGardenList(apiKey); // 정원 목록 데이터 훅 호출
  const [selectedPlant, setSelectedPlant] = useState(null); // 선택한 식물의 상태 관리
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 관리

  // 모달 닫기
  const handleCloseModal = () => setSelectedPlant(null);

  // 식물 선택 시 모달 열기
  const handlePlantClick = (cntntsNo) => setSelectedPlant(cntntsNo);

  // 식물 상세 정보 데이터 훅 호출
  const { data: plantData, loading: plantLoading, error: plantError } = usePlantDetail(apiKey, selectedPlant);

  // 검색어 입력 변경 처리
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // 검색어에 따라 정원 데이터를 필터링
  const filteredGardenData = gardenData?.response?.body?.items?.item?.filter(garden =>
    garden.cntntsSj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 데이터 로딩 중일 때 표시할 메시지
  if (gardenLoading) return <p>로딩 중...</p>;

  // 데이터 로딩 에러 발생 시 표시할 메시지
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
            <p><strong></strong>{garden.cntntsNo}</p>
            <button onClick={() => handlePlantClick(garden.cntntsNo)}>상세 보기</button>
          </div>
        ))}
      </div>

      {/* 선택한 식물이 있을 때 모달 표시 */}
      {selectedPlant && (
        <div className="garden-modal">
          <div className="garden-modal-content">
            <span className="garden-close" onClick={handleCloseModal}>&times;</span>
            {plantLoading ? <p>로딩 중...</p> : plantError ? <p>에러 발생: {plantError}</p> : (
              plantData && plantData.response && plantData.response.body && plantData.response.body.item && (
                <div>
                  <p><strong>이름:</strong> {plantData.response.body.item.distbNm}</p>
                  <p><strong>콘텐츠 번호:</strong> {plantData.response.body.item.cntntsNo}</p>
                  <p><strong>라틴어 이름:</strong> {plantData.response.body.item.plntbneNm}</p>
                  <p><strong>영어 이름:</strong> {plantData.response.body.item.plntzrNm}</p>
                  <p><strong>과 이름:</strong> {plantData.response.body.item.fmlNm}</p>
                  <p><strong>원산지:</strong> {plantData.response.body.item.orgplceInfo}</p>
                  <p><strong>관리:</strong> {plantData.response.body.item.adviseInfo}</p>
                  <p><strong>성장 높이:</strong> {plantData.response.body.item.growthHgInfo}</p>
                  <p><strong>성장 폭:</strong> {plantData.response.body.item.growthAraInfo}</p>
                  <p><strong>잎 모양:</strong> {plantData.response.body.item.lefStleInfo}</p>
                  <p><strong>냄새 코드:</strong> {plantData.response.body.item.smellCodeNm}</p>
                  <p><strong>독성 정보:</strong> {plantData.response.body.item.toxctyInfo}</p>
                  <p><strong>번식 시대 정보:</strong> {plantData.response.body.item.prpgtEraInfo}</p>
                  <p><strong>기타 시대 정보:</strong> {plantData.response.body.item.etcEraInfo}</p>
                  <p><strong>관리 수준:</strong> {plantData.response.body.item.managelevelCodeNm}</p>
                  <p><strong>성장 속도:</strong> {plantData.response.body.item.grwtveCodeNm}</p>
                  <p><strong>성장 온도:</strong> {plantData.response.body.item.grwhTpCodeNm}</p>
                  <p><strong>겨울 최저 온도:</strong> {plantData.response.body.item.winterLwetTpCodeNm}</p>
                  <p><strong>습도 코드 이름:</strong> {plantData.response.body.item.hdCodeNm}</p>
                  <p><strong>비료:</strong> {plantData.response.body.item.frtlzInfo}</p>
                  <p><strong>토양:</strong> {plantData.response.body.item.soilInfo}</p>
                  <p><strong>물 주기 봄:</strong> {plantData.response.body.item.watercycleSprngCodeNm}</p>
                  <p><strong>물 주기 여름:</strong> {plantData.response.body.item.watercycleSummerCodeNm}</p>
                  <p><strong>물 주기 가을:</strong> {plantData.response.body.item.watercycleAutumnCodeNm}</p>
                  <p><strong>물 주기 겨울:</strong> {plantData.response.body.item.watercycleWinterCodeNm}</p>
                  <p><strong>해충 관리:</strong> {plantData.response.body.item.dlthtsManageInfo}</p>
                  <p><strong>특별 관리:</strong> {plantData.response.body.item.speclmanageInfo}</p>
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