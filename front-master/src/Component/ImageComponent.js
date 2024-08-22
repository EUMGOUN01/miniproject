import React, { useState, useEffect } from 'react';

const ImageComponent = ({ filename }) => {
  const [imageUrl, setImageUrl] = useState('');
  const imgPath = 'http://10.125.121.180:8080/photos/';

  useEffect(() => {
    // 파일명이 있을 경우에만 URL을 설정
    if (filename) {
      setImageUrl(`${imgPath}${filename}`);
    }
  }, [filename]);

  const handleImageError = () => {
    console.error('이미지 로드 오류:', imageUrl);
    setImageUrl(''); // 로드 실패 시 이미지 URL 초기화
  };

  return (
    <div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={filename}
          onError={handleImageError}
          style={{ width: '100%', height: 'auto' }} // 스타일 추가 (선택사항)
        />
      ) : (
        <p>이미지를 로드하는 중입니다...</p>
      )}
    </div>
  );
};

export default ImageComponent;