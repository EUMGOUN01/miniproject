import { useState, useEffect } from 'react';
import { XMLParser } from 'fast-xml-parser';

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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const textData = await response.text();
        const parser = new XMLParser();
        const jsonData = parser.parse(textData);
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

export const useGardenList = (apiKey) => {
  const url = `/service/garden/gardenList?apiKey=${apiKey}&pageNo=1&numOfRows=217`;
  return useFetch(url);
};

export const usePlantDetail = (apiKey, cntntsNo) => {
  const url = `/service/garden/gardenDtl?apiKey=${apiKey}&cntntsNo=${cntntsNo}`;
  return useFetch(url);
};