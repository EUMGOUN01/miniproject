import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/PlantDetail.css';

const PlantEdit = () => {
  const { shareBoardId } = useParams(); // URL 파라미터에서 게시물 ID를 가져옵니다.
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    username: '',
    view: '',
    content: '',
    adress: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!shareBoardId) {
        setError('유효하지 않은 게시물 ID입니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://10.125.121.180:8080/public/shareboard/${shareBoardId}`);
        const data = await response.json();
        setPost(data);
        setFormData({
          title: data.title,
          type: data.type,
          username: data.username,
          view: data.view,
          content: data.content,
          adress: data.adress
        });
      } catch (error) {
        console.error('게시물 데이터를 가져오는 중 오류 발생:', error);
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shareBoardId]);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !post) return;

    const mapOptions = {
      center: new kakao.maps.LatLng(35.1587, 129.1601),
      level: 3,
    };

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapRef.current = new kakao.maps.Map(mapContainer, mapOptions);

      if (post.address) {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(post.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new kakao.maps.Marker({
              position: coords
            });
            marker.setMap(mapRef.current);
            mapRef.current.setCenter(coords);
          } else {
            console.error('주소 검색 실패, 상태:', status);
          }
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://10.125.121.180:8080/public/shareboard/${shareBoardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      alert('게시물이 성공적으로 업데이트되었습니다.');
      navigate(`/plant-sharing/${shareBoardId}`);
    } catch (error) {
      console.error('게시물 업데이트 중 오류 발생:', error);
      setError('데이터를 업데이트하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">오류 발생: {error}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  return (
    <div className="plant-edit-container">
      <h1>게시물 수정</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">카테고리</label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">작성자</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="createDate">작성일</label>
          <input
            type="text"
            id="createDate"
            name="createDate"
            value={post.createDate}
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="view">조회수</label>
          <input
            type="number"
            id="view"
            name="view"
            value={formData.view}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">주소</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.adress}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="submit-button">수정하기</button>
        <button type="button" onClick={() => navigate(`/plant-sharing/${shareBoardId}`)} className="cancel-button">
          취소
        </button>
      </form>

      <div id="map" style={{ width: '100%', height: '300px', marginTop: '20px' }}></div>
    </div>
  );
};

export default PlantEdit;