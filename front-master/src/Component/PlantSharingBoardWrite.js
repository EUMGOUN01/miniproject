import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/PlantSharingBoardWrite.css'; 
import { FiSearch } from 'react-icons/fi';
import { GrPowerReset } from 'react-icons/gr';

const PlantSharingBoardWrite = ({ initialShareBoard }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialShareBoard?.title || '');
  const [category, setCategory] = useState(initialShareBoard?.type || '나눔');
  const [content, setContent] = useState(initialShareBoard?.content || '');
  const [files, setFiles] = useState([]);
  const [searchAddress, setSearchAddress] = useState(initialShareBoard?.address || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null); 
  const infowindowRef = useRef(null); 
  const currentLocationMarkerRef = useRef(null); 
  const [currentLatLng, setCurrentLatLng] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후에 게시글을 작성할 수 있습니다.');
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const member = localStorage.getItem('username');
    if (!member) {
      setError('회원 정보가 없습니다.');
      return;
    }

    let address = null;
    if (markerRef.current) {
      const latlng = markerRef.current.getPosition();
      const { kakao } = window;
      if (kakao) {
        const geocoder = new kakao.maps.services.Geocoder();
        await new Promise((resolve, reject) => {
          geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              address = result[0].address.address_name;
              resolve();
            } else {
              reject('주소 검색 실패');
            }
          });
        });
      }
    }

    const shareboarddata = {
      title,
      type: category,
      content,
      create_date: new Date().toISOString(),
      address,
      view: 0,
      member: { username: member },
    };

    const formData = new FormData();
    formData.append('shareboarddata', new Blob([JSON.stringify(shareboarddata)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('files', file); // 파일 추가
    });

    try {
      setLoading(true);

      const response = await fetch('http://10.125.121.180:8080/api/users/shareboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('게시물 작성에 실패했습니다.');
      }

      navigate('/plant-sharing');
    } catch (error) {
      console.error('게시물 작성 실패:', error);
      setError('게시물을 작성하는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
        const address = result[0].address.address_name;
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">주소: ${address}</div>`,
        });
        infowindow.open(mapRef.current, newMarker);
        infowindowRef.current = infowindow;

        // 주소 입력란에 자동으로 주소 설정
        setSearchAddress(address);
      } else {
        console.error('주소 검색 실패, 상태:', status);
      }
    });
  }, []);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao) return;

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
        <h2 className="form-title">{initialShareBoard ? '게시글 수정' : '식물 나눔'}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label className="form-label">
            카테고리:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="나눔">나눔</option>
              <option value="나눔중">나눔중</option>
              <option value="나눔완료">나눔완료</option>
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
            multiple
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        {files.length > 0 && (
          <div className="preview-container">
            {files.map((file, index) => (
              <div key={index} className="preview-item">
                <p>{file.name}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="remove-file-btn"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="submit-button">{initialShareBoard ? '수정하기' : '작성하기'}</button>
      </form>
    </div>
  );
};

export default PlantSharingBoardWrite;