import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/VarietyList.css';

const VarietyList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY_S; // 환경 변수에서 API 키 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.nongsaro.go.kr/service/cropEbook/ebookList?apiKey=${apiKey}`,
          {
            headers: {
              'Accept': 'application/xml', // XML 응답을 받기 위한 헤더
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const textData = await response.text();

        // XML 데이터를 JSON으로 변환
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, 'application/xml');

        // XML 데이터를 JSON으로 변환하는 함수 호출
        const jsonResult = xmlToJson(xmlDoc);

        // JSON 형태로 변환된 데이터 구조 확인
        console.log('JSON 응답:', jsonResult);

        // 데이터 접근 경로를 실제 구조에 맞게 조정
        const items = jsonResult?.response?.body?.items?.item || [];
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

  // XML 데이터를 JSON으로 변환하는 함수
  const xmlToJson = (xml) => {
    const obj = {};
    if (xml.nodeType === 1) { // 요소 노드일 경우
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { // 텍스트 노드일 경우
      obj = xml.nodeValue;
    }

    // 자식 노드를 순회하며 처리
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof obj[nodeName] === "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  };

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