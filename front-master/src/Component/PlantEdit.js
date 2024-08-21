import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/WritePostPage.css'; // CSS 파일

const PlantEdit = () => {
  const { shareBoardId } = useParams(); // URL 파라미터에서 shareBoardId 추출
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

  const [title, setTitle] = useState(''); // 게시글 제목 상태
  const [category, setCategory] = useState('기타'); // 게시글 카테고리 상태
  const [content, setContent] = useState(''); // 게시글 내용 상태
  const [address, setAddress] = useState(''); // 주소 상태
  const [files, setFiles] = useState([]); // 첨부 파일 상태
  const [removedFiles, setRemovedFiles] = useState([]); // 삭제된 파일 상태
  const [privateType, setPrivateType] = useState('public'); // 전체보기/나만보기 상태
  const [error, setError] = useState(''); // 오류 메시지 상태
  const mapRef = useRef(null); // 지도 참조
  const markerRef = useRef(null); // 마커 참조

  // 게시글 데이터를 불러오는 함수
  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching post data...');
        const response = await fetch(`http://10.125.121.180:8080/api/public/shareboard/${shareBoardId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch post data:', response.status);
          throw new Error('게시물 데이터를 가져오는 중 오류 발생');
        }
        
        const data = await response.json();
        console.log('Fetched post data:', data);
        
        setTitle(data.title);
        setCategory(data.type);
        setContent(data.content);
        setAddress(data.address);
        setPrivateType(data.privateType || 'public');
        setFiles(data.simges ? data.simges.map(file => ({
          simgid: file.simgid,
          name: file.simgoriname,
          url: `http://10.125.121.180:8080/photos/${file.simgid}`,
          existing: true,
        })) : []);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchPost();
  }, [shareBoardId]);

  // 지도 초기화 및 주소로부터 좌표 검색
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !address) {
      console.log('Kakao Maps SDK 또는 주소가 제공되지 않았습니다.');
      return;
    }

    console.log('Initializing Kakao Map...');
    const mapOptions = {
      center: new kakao.maps.LatLng(35.1587, 129.1601), // 기본 좌표
      level: 3,
    };

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapRef.current = new kakao.maps.Map(mapContainer, mapOptions);

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          console.log('Address found, setting map center:', result[0]);
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          const marker = new kakao.maps.Marker({
            position: coords,
          });
          marker.setMap(mapRef.current); // 지도에 마커 추가
          markerRef.current = marker;
          mapRef.current.setCenter(coords); // 지도의 중심을 주소 좌표로 설정
        } else {
          console.error('주소 검색 실패:', status);
        }
      });
    } else {
      console.log('Map container not found.');
    }

    // 컴포넌트 언마운트 시 마커와 지도를 제거
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [address]);

  // 파일 선택 시 호출되는 함수
  const handleFileChange = (e) => {
    console.log('Files selected:', e.target.files);
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles.map(file => ({ file, existing: false }))]);
    setError('');
  };

  // 기존 파일 삭제 처리
  const handleRemoveFile = (file) => {
    console.log('Removing file:', file);
    if (file.existing) {
      setRemovedFiles(prev => [...prev, file.simgid]); // 삭제된 파일 ID 추가
    }
    setFiles(prevFiles => prevFiles.filter(f => f !== file)); // UI에서 제거
  };

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { shareBoardId, title, category, content, address, files, removedFiles });

    if (!title || !content) {
      setError('제목과 내용을 입력해야 합니다.');
      return;
    }

    // 식물 나눔 게시판 데이터
    const formData = new FormData();
    formData.append('shareboarddata', new Blob([JSON.stringify({
      shareBoardId,
      privateType,
      type: category,
      title,
      content,
      address,
      removedFiles, // 삭제된 파일 정보 추가
    })], { type: 'application/json' }));

    // 새로 추가된 파일만 업로드
    files.forEach(file => {
      if (!file.existing && file.file) {
        formData.append('files', file.file); // 새로운 파일만 추가
      }
    });

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      // 서버에 게시글 수정 요청 보내기
      console.log('Sending update request to server...');
      const response = await fetch(`http://10.125.121.180:8080/api/users/shareboard`, {
        method: 'PUT', // PUT 요청
        headers: {
          'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
        body: formData,
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.error('Response error data:', responseData);
        throw new Error('게시글을 수정하는 데 실패했습니다.');
      }

      console.log('Post updated successfully.');
      navigate(`/plant-sharing/${shareBoardId}`, { state: { shouldRefetch: true } });
    } catch (error) {
      console.error('게시글을 수정하는 데 실패했습니다:', error);
      setError('게시글을 수정하는 데 실패했습니다.');
    }
  };

  // 식물 나눔 게시판 구조
  return (
    <div className="write-container">
      <form className="write-form" onSubmit={handleSubmit}>
        <h2 className="write-page-title">게시글 수정</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label className="label">
            카테고리:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="write-select"
            >
              <option value="나눔">나눔</option>
              <option value="나눔중">나눔중</option>
              <option value="나눔완료">나눔완료</option>
            </select>
          </label>
        </div>



        <label className="label">
          제목:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="write-input"
            placeholder="제목을 입력하세요"
            required
          />
        </label>
        <label className="label">
          내용:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="write-textarea"
            placeholder="내용을 입력하세요"
            required
          />
        </label>
        <label className="label">
          주소:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="write-input"
            placeholder="주소를 입력하세요"
          />
        </label>
        <label className="label">
          첨부 파일:
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="write-file-input"
          />
        </label>
        {files.length > 0 && (
          <div className="preview-container">
            {files.map((file, index) => (
              <div key={index} className="preview-item">
                <img
                  src={file.url || URL.createObjectURL(file.file)}
                  alt={`Preview ${file.name}`}
                  className="preview-image"
                />
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
        <button type="submit" className="write-submit-btn">
          수정하기
        </button>
      </form>
      <div id="map" style={{ width: '100%', height: '300px', marginTop: '20px' }}></div>
    </div>
  );
};

export default PlantEdit;