// PlantSharingBoardWrite.js
// 식물 나눔 게시판 - 식물 나눔 게시글 작성 페이지
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/PlantSharingBoardWrite.css'; 
import { FiSearch } from 'react-icons/fi';
import { GrPowerReset } from 'react-icons/gr';

const PlantSharingBoardWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('공지');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null); 
  const infowindowRef = useRef(null); 
  const currentLocationMarkerRef = useRef(null); 
  const [currentLatLng, setCurrentLatLng] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let adress = null; // 'address' -> 'adress'
    if (markerRef.current) {
      const latlng = markerRef.current.getPosition();
      const { kakao } = window;
      if (kakao) {
        const geocoder = new kakao.maps.services.Geocoder();
        await new Promise((resolve, reject) => {
          geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              adress = result[0].address.address_name; // 'address' -> 'adress'
              resolve();
            } else {
              reject('주소 검색 실패');
            }
          });
        });
      }
    }

    const newPost = {
      title,
      type: category, // 'type' 필드에 해당
      content,
      create_date: new Date().toISOString(), // TIMESTAMP에 해당
      adress, // 'address' -> 'adress'
      view: 0, // 초기 조회수
      username: 'user', // 실제 사용자 이름으로 대체해야 함
      fileName: file ? file.name : null, // 파일 이름만 저장
    };

    console.log('새 게시물:', newPost);

    // 'newPost'를 서버나 API로 전송
    navigate('/plant-sharing');
  };

  const searchMap = useCallback(() => {
    const { kakao } = window;
    if (!kakao) return;

    const geocoder = new kakao.maps.services.Geocoder();

    if (searchAddress) {
      geocoder.addressSearch(searchAddress, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const latlng = new kakao.maps.LatLng(result[0].y, result[0].x);

          mapRef.current.setCenter(latlng);
          mapRef.current.setLevel(3);

          if (markerRef.current) markerRef.current.setMap(null);
          if (infowindowRef.current) infowindowRef.current.close();

          const newMarker = new kakao.maps.Marker({ position: latlng });
          newMarker.setMap(mapRef.current);
          markerRef.current = newMarker; 

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">${result[0].address_name}</div>`,
          });
          infowindow.open(mapRef.current, newMarker);
          infowindowRef.current = infowindow; 
        } else {
          console.error('주소 검색 실패, 상태:', status);
        }
      });
    }
  }, [searchAddress]);

  const handleMapClick = useCallback((mouseEvent) => {
    const { kakao } = window;
    if (!kakao) return;

    const latlng = mouseEvent.latLng;

    if (markerRef.current) markerRef.current.setMap(null);
    if (infowindowRef.current) infowindowRef.current.close();

    const newMarker = new kakao.maps.Marker({ position: latlng });
    newMarker.setMap(mapRef.current);
    markerRef.current = newMarker; 

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const adress = result[0].address.address_name; // 'address' -> 'adress'

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">주소: ${adress}</div>`, // 'address' -> 'adress'
        });
        infowindow.open(mapRef.current, newMarker);
        infowindowRef.current = infowindow; 
      } else {
        console.error('주소 검색 실패, 상태:', status);
      }
    });
  }, []);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao) {
      console.error('Kakao Maps API가 로드되지 않았습니다.');
      return;
    }

    const mapOptions = {
      center: new kakao.maps.LatLng(35.1587, 129.1601), 
      level: 8,
    };

    mapRef.current = new kakao.maps.Map(mapContainer.current, mapOptions);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new kakao.maps.LatLng(latitude, longitude);
        setCurrentLatLng(latlng);

        mapRef.current.setCenter(latlng);
        mapRef.current.setLevel(5); 

        if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);

        const imageSrc = '/path/to/current-location-marker.png'; 
        const imageSize = new kakao.maps.Size(32, 32);
        const imageOption = { offset: new kakao.maps.Point(16, 32) };
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        const newMarker = new kakao.maps.Marker({
          position: latlng,
          image: markerImage,
          title: '현재 위치'
        });
        newMarker.setMap(mapRef.current);
        currentLocationMarkerRef.current = newMarker; 

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">현재 위치</div>`,
        });
        infowindow.open(mapRef.current, newMarker);

        infowindowRef.current = infowindow; 
      },
      (error) => {
        console.error('현재 위치를 가져오는 중 오류 발생:', error);
        mapRef.current.setCenter(new kakao.maps.LatLng(35.1587, 129.1601));
      }
    );

    kakao.maps.event.addListener(mapRef.current, 'click', handleMapClick);

    return () => {
      if (markerRef.current) markerRef.current.setMap(null);
      if (infowindowRef.current) infowindowRef.current.close();
      if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);
      kakao.maps.event.removeListener(mapRef.current, 'click', handleMapClick);
    };
  }, [handleMapClick]);

  const handleSearchReset = () => {
    setSearchAddress('');

    if (markerRef.current) markerRef.current.setMap(null);
    if (infowindowRef.current) infowindowRef.current.close();

    if (currentLatLng) {
      mapRef.current.setCenter(currentLatLng);
      mapRef.current.setLevel(3); 
    }
  };

  return (
    <div className="plant-sharing-board-write-container">
      <form className="plant-sharing-board-write-form" onSubmit={handleSubmit}>
        <h2 className="form-title">식물 나눔</h2>
        <div className="form-group">
          <label className="form-label">
            카테고리:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="공지">나눔</option>
              <option value="질문">나눔중</option>
              <option value="기타">나눔완료</option>
            </select>
          </label>
        </div>
        <label className="form-label">
          제목:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder="제목을 입력하세요"
            required
          />
        </label>
        <label className="form-label">
          내용:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-textarea"
            placeholder="내용을 입력하세요"
            required
          />
        </label>
        <div className="map-container">
          <div id="map" ref={mapContainer} style={{ width: '100%', height: '300px' }}></div>
        </div>
        <div className="plant-search-container">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="plant-search-input"
            placeholder="주소를 입력하세요."
          />
          <button type="button" onClick={searchMap} className="search-button"><FiSearch /></button>
          <button type="button" onClick={handleSearchReset} className="search-button"><GrPowerReset /></button>
        </div>
        <label className="form-label">
          첨부 파일:
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        <button type="submit" className="submit-button">작성</button>
      </form>
    </div>
  );
};

export default PlantSharingBoardWrite;