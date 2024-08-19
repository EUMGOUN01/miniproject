import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/VarietyList.css';

const VarietyList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY_S;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://api.nongsaro.go.kr/service/cropEbook/ebookList?apiKey=${apiKey}`,
          {
            headers: {
              'Accept': 'application/xml', // XML 응답을 받기 위한 헤더 설정
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const textData = await response.text();

        // XML을 JSON으로 변환
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, 'application/xml');
        const jsonResult = xmlToJson(xmlDoc);

        console.log('JSON 응답:', jsonResult); // 데이터 구조 확인을 위한 로깅

        const items = jsonResult?.response?.body?.items?.item || [];
        setData(items);
      } catch (error) {
        console.error('API 호출 오류:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiKey]);

  // XML을 JSON으로 변환하는 함수
  const xmlToJson = (xml) => {
    if (xml.nodeType === 1) { // 요소 노드
      const obj = {};

      // 요소의 속성 가져오기
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }

      // 자식 노드 처리
      if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
          const item = xml.childNodes.item(i);
          const nodeName = item.nodeName;
          if (typeof obj[nodeName] === "undefined") {
            obj[nodeName] = xmlToJson(item);
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(xmlToJson(item));
          }
        }
      }

      return obj;
    } else if (xml.nodeType === 3 && xml.nodeValue.trim()) { // 텍스트 노드
      return xml.nodeValue.trim();
    }

    return null;
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
          data.map((item, index) => (
            <li key={index} className="VarietyList-item">
              <img src={item.ebookImg} alt={item.atchmnflGroupEsntlEbookNm || 'eBook 이미지'} />
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