// hooks.js
// 소문자 파일이라서 사용 안함.
// 제거할것.
import { useState, useEffect } from 'react';

// 데이터 가져오기 훅
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }
        const textData = await response.text();

        // XML 데이터를 파싱하여 JSON으로 변환
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "application/xml");

        // XML을 JSON으로 변환하는 함수
        const jsonData = xmlToJson(xmlDoc);
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

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

// 정원 목록을 가져오는 훅
export const useGardenList = (apiKey) => {
  const url = `https://api.nongsaro.go.kr/service/garden/gardenList?apiKey=${apiKey}`;
  return useFetch(url);
};

// 식물 세부 정보를 가져오는 훅
export const usePlantDetail = (apiKey, cntntsNo) => {
  const url = `https://api.nongsaro.go.kr/service/garden/gardenDtl?apiKey=${apiKey}&cntntsNo=${cntntsNo}`;
  return useFetch(url);
};