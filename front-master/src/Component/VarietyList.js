import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import '../CSS/VarietyList.css';

const VarietyList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const apiKey = process.env.REACT_APP_API_KEY_S || '20240807JJSEZC5RNYESYTRNYFK9W';

  // 전체 eBook 목록 가져오기
  useEffect(() => {
    const fetchAllEbooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/service/cropEbook/ebookList', {
          params: { apiKey },
        });

        const parser = new XMLParser();
        const result = parser.parse(response.data);
        const items = result?.response?.body?.items?.item || [];
        setData(Array.isArray(items) ? items : [items]);
        setFilteredData(Array.isArray(items) ? items : [items]);
      } catch (error) {
        setError('전체 eBook 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEbooks();
  }, [apiKey]);

  // 대분류 목록 가져오기
  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const response = await axios.get('/service/cropEbook/mainCategoryList', {
          params: { apiKey },
        });

        const parser = new XMLParser();
        const result = parser.parse(response.data);
        const categories = result?.response?.body?.items?.item || [];
        setMainCategories(Array.isArray(categories) ? categories : [categories]);
      } catch (error) {
        setError('대분류 목록을 불러오는 데 실패했습니다.');
      }
    };

    fetchMainCategories();
  }, [apiKey]);

  // 중분류 목록 가져오기
  useEffect(() => {
    if (selectedMainCategory) {
      const fetchMiddleCategories = async () => {
        try {
          const response = await axios.get('/service/cropEbook/middleCategoryList', {
            params: { apiKey, mainCategoryCode: selectedMainCategory },
          });

          const parser = new XMLParser();
          const result = parser.parse(response.data);
          const middleItems = result?.response?.body?.items?.item || [];
          setMiddleCategories(Array.isArray(middleItems) ? middleItems : [middleItems]);
          setSelectedMiddleCategory(''); // 중분류 초기화
          setSubCategories([]);
          setSelectedSubCategory(''); // 소분류 초기화
          setData([]);
          setFilteredData([]); 
        } catch (error) {
          setError('중분류 목록을 불러오는 데 실패했습니다.');
        }
      };

      fetchMiddleCategories();
    }
  }, [apiKey, selectedMainCategory]);

  // 소분류 목록 가져오기
  useEffect(() => {
    if (selectedMiddleCategory) {
      const fetchSubCategories = async () => {
        try {
          const response = await axios.get('/service/cropEbook/subCategoryList', {
            params: { apiKey, middleCategoryCode: selectedMiddleCategory },
          });

          const parser = new XMLParser();
          const result = parser.parse(response.data);
          const subItems = result?.response?.body?.items?.item || [];
          setSubCategories(Array.isArray(subItems) ? subItems : [subItems]);
          setSelectedSubCategory('');
          setData([]);
          setFilteredData([]);
        } catch (error) {
          setError('소분류 목록을 불러오는 데 실패했습니다.');
        }
      };

      fetchSubCategories();
    }
  }, [apiKey, selectedMiddleCategory]);

  // 조건에 맞는 eBook 목록 가져오기
  useEffect(() => {
    if (selectedSubCategory) {
      const fetchFilteredData = async () => {
        setLoading(true);
        try {
          const response = await axios.get('/service/cropEbook/ebookList', {
            params: { apiKey, subCategoryCode: selectedSubCategory },
          });

          const parser = new XMLParser();
          const result = parser.parse(response.data);
          const items = result?.response?.body?.items?.item || [];
          setData(Array.isArray(items) ? items : [items]);
          setFilteredData(Array.isArray(items) ? items : [items]); 
        } catch (error) {
          setError('조건에 맞는 eBook 데이터를 불러오는 데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      };

      fetchFilteredData();
    }
  }, [apiKey, selectedSubCategory]);

  // 검색 기능 구현
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const filtered = data.filter(
        (item) =>
          item.ebookName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.stdItemNm?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data); 
    }
  }, [searchTerm, data]);

  const handleEbookClick = async (ebookCode, cropsEbookFileNo, stdItemCd) => {
    try {
      // API 요청
      const response = await axios.get('/service/cropEbook/cropRequestList', {
        params: {
          apiKey,  // apiKey 변수가 미리 정의되어 있어야 합니다.
          ebookCode,
          cropsEbookFileNo,
          stdItemCd,
        },
        headers: {
          'Accept': 'application/xml' // XML 응답을 받기 위한 설정
        }
      });
  
      // XML 응답을 문자열로 확인
      console.log("원본 XML 응답:", response.data);
  
      // XML 파서로 파싱
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, "text/xml");
  
      // XML의 전체 구조 출력
      console.log("XML 구조:", new XMLSerializer().serializeToString(xmlDoc));
  
      // cropsEbookRequestNo, indexName, requestFileView 등의 요소 추출
      const cropsEbookRequestNo = xmlDoc.querySelector('cropsEbookRequestNo');
      const indexName = xmlDoc.querySelector('indexName');
      const indexPage = xmlDoc.querySelector('indexPage');
      const requestFileViewElement = xmlDoc.querySelector('requestFileView');
      const writeDate = xmlDoc.querySelector('writeDate');
      const writeUserNm = xmlDoc.querySelector('writeUserNm');
  
      // 추출한 값 출력
      console.log("cropsEbookRequestNo:", cropsEbookRequestNo ? cropsEbookRequestNo.textContent : '없음');
      console.log("indexName:", indexName ? indexName.textContent : '없음');
      console.log("indexPage:", indexPage ? indexPage.textContent : '없음');
      console.log("requestFileView 내용:", requestFileViewElement ? requestFileViewElement.textContent : '없음');
      console.log("writeDate:", writeDate ? writeDate.textContent : '없음');
      console.log("writeUserNm:", writeUserNm ? writeUserNm.textContent : '없음');
  
    } catch (error) {
      console.error("API 요청 오류:", error);
    }
  };

  return (
    <div className="VarietyList-container">
      <h1>농업기술길잡이 목록</h1>

      {/* 에러 메시지 표시 */}
      {error && <p className="error-message">{error}</p>}

      {/* 검색어 입력 */}
      <div className="VarietyList-search">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 대분류 선택 */}
      <div className="VarietyList-filters">
        <label htmlFor="main-category-select">대분류 선택:</label>
        <select
          id="main-category-select"
          value={selectedMainCategory}
          onChange={(e) => setSelectedMainCategory(e.target.value)}
        >
          <option value="">대분류를 선택하세요</option>
          {mainCategories.map((category) => (
            <option key={category.mainCategoryCode} value={category.mainCategoryCode}>
              {category.mainCategoryNm}
            </option>
          ))}
        </select>
      </div>

      {/* 중분류 선택 */}
      {middleCategories.length > 0 && (
        <div className="VarietyList-filters">
          <label htmlFor="middle-category-select">중분류 선택:</label>
          <select
            id="middle-category-select"
            value={selectedMiddleCategory}
            onChange={(e) => setSelectedMiddleCategory(e.target.value)}
          >
            <option value="">중분류를 선택하세요</option>
            {middleCategories.map((category) => (
              <option key={category.middleCategoryCode} value={category.middleCategoryCode}>
                {category.middleCategoryNm}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 소분류 선택 */}
      {subCategories.length > 0 && (
        <div className="VarietyList-filters">
          <label htmlFor="sub-category-select">소분류 선택:</label>
          <select
            id="sub-category-select"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
          >
            <option value="">소분류를 선택하세요</option>
            {subCategories.map((category) => (
              <option key={category.subCategoryCode} value={category.subCategoryCode}>
                {category.subCategoryNm}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* eBook 목록 */}
      <ul className="VarietyList-item-list">
        {loading ? (
          <p>로딩 중...</p>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => (
            <li
              key={item.ebookCode}
              className="VarietyList-item"
              onClick={() =>
                handleEbookClick(item.ebookCode, item.cropsEbookFileNo)
              }
            >
              <img src={item.ebookImg} alt={item.atchmnflGroupEsntlEbookNm} />
              <h2>{item.ebookName}</h2>
              <p>{item.stdItemNm}</p>
            </li>
          ))
        ) : (
          <p>해당 조건에 맞는 eBook이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default VarietyList;