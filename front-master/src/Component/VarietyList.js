import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { XMLParser } from 'fast-xml-parser'; 
import '../CSS/VarietyList.css'; 

const VarietyList = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY_S; // 환경 변수에서 API 키 가져오기

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/service/cropEbook/ebookList', {
          params: {
            apiKey: apiKey,
          },
          headers: {
            'Accept': 'application/xml', // XML 응답을 받기 위한 헤더
          },
        });
        // XML을 JSON으로 변환
        const parser = new XMLParser();
        const result = parser.parse(response.data);
        
        // JSON 형태로 변환된 데이터 구조 확인
        console.log('JSON 응답:', result);
        // 데이터 접근 경로를 실제 구조에 맞게 조정
        const items = result?.response?.body?.items?.item || [];
        setData(items);
        setLoading(false);
      } catch (error) {
        console.error('API 호출 오류:', error); // 오류 로깅
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [apiKey]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류 발생: {error.message}</p>;

  return (
    <div className="VarietyList-container">
       <div className="header-links">
          <span onClick={() => navigate('/info')} className="header-link">실내정원 식물</span>
          <span className="header-link-separator"> | </span>
          <span onClick={() => navigate('/variety-list')} className="header-link">농업기술길잡이</span>
        </div>
        <h1 className="VarietyList-title">농업기술길잡이 목록</h1>
      <ul className="VarietyList-item-list">
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.ebookCode} className="VarietyList-item">
              <img src={item.ebookImg} alt={item.atchmnflGroupEsntlEbookNm} />
              <h2>{item.ebookName}</h2>
              <p>{item.stdItemNm}</p>
            </li>
          ))
        ) : (
          <p>데이터가 없습니다</p>
        )}
      </ul>
    </div>
  );
};

export default VarietyList;