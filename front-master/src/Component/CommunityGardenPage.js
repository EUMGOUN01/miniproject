//CommunityGardenPage.js
// 공용텃밭 보여주는 페이지
import React from 'react';
import { Map, MapMarker, MapInfoWindow } from 'react-kakao-maps-sdk';
import { HiArrowCircleRight } from 'react-icons/hi';
import '../CSS/CommunityGardenPage.css';

// 테스트용 지도
const gardenData = [
  {
    id: 1,
    name: "신호지구 나눔텃밭",
    location: { lat: 35.084138, lng: 128.873972 },
    details: "부산광역시 강서구 신호동 300-3번지"
  },
  {
    id: 2,
    name: "동부산공영시민텃밭",
    location: { lat: 35.292561, lng: 129.169006 },
    details: "부산광역시 기장군 철마면 웅천리 311번지"
  }
];

const CommunityGardenPage = () => {
  const [activeMarker, setActiveMarker] = React.useState(null);

  return (
    <div className="Community-container">
      <div className="Community-text-section">
        <h1>공용텃밭이란</h1>
        <p>
          부산 공영 텃밭은 도심 속에서 친환경 농업을 실천하며 도시민들이 직접 농작물을
          <br /> 재배하고, 안전한 먹거리를 제공받을 수 있는 공간입니다. 이곳에서는 이웃과의 소통과
          <br /> 나눔도 함께 이루어지며, 자연과 가까운 생활을 경험할 수 있습니다.
        </p>
        <div className="Community-more-info">
          <a
            href="https://www.busan.go.kr/minwon/occation/list?srchSttus=&srchKey=sj&srchText=%ED%85%83%EB%B0%AD#none"
            target="_blank"
            rel="noopener noreferrer"
            className="Community-more-info-link"
          >
            <HiArrowCircleRight className="Community-info-icon" />
            자세한 정보 보기
          </a>
        </div>
      </div>
      <div className="Community-map-section">
        <Map
          center={{ lat: 35.084138, lng: 128.873972 }}
          style={{ width: '100%', height: '500px' }}
          level={8}
        >
          {gardenData.map((garden) => (
            <MapMarker
              key={garden.id}
              position={garden.location}
              onClick={() => setActiveMarker(garden.id)}
            />
          ))}

          {gardenData.map((garden) =>
            activeMarker === garden.id ? (
              <MapInfoWindow
                key={garden.id}
                position={garden.location}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div>
                  <h4>{garden.name}</h4>
                  <p>{garden.details}</p>
                </div>
              </MapInfoWindow>
            ) : null
          )}
        </Map>
      </div>
    </div>
  );
};

export default CommunityGardenPage;