import { useState, useEffect } from 'react';

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

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "application/xml");

        const jsonData = xmlToJson(xmlDoc);
        setData(jsonData.response.body.item); // 필요한 데이터로 접근
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error };
};

// XML to JSON 변환 함수 개선
const xmlToJson = (xml) => {
  let obj = {};
  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue.trim();
  }

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
};

// 정원 목록 훅
export const useGardenList = (apiKey) => {
  const url = `http://api.nongsaro.go.kr/service/garden/gardenList?apiKey=${apiKey}`;
  return useFetch(url);
};

// 식물 상세 정보 훅
export const usePlantDetail = (apiKey, cntntsNo) => {
  const url = cntntsNo
    ? `http://api.nongsaro.go.kr/service/garden/gardenDtl?apiKey=${apiKey}&cntntsNo=${cntntsNo}`
    : null;
  return useFetch(url);
};