// 이미지 파일 코드
import React, { useState, useEffect } from 'react';
//import { getImageUrl } from '../Component/utils'; // 이미지 저장 경로 불러오기

const ImageComponent = ({ filename }) => {
    const [imageUrl, setImageUrl] = useState('');
    const imgPath = 'http://10.125.121.180:8080/photos/' ; 
    console.log('ImageComponent filename' ,filename  ) ;

    useEffect(() => {
        // 이미지 URL을 설정합니다.
        // setImageUrl(getImageUrl(filename));
        setImageUrl(imgPath+filename)
    }, [filename]);

    return (
        <div>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={filename}
                    onError={() => console.error('이미지 로드 오류:', imageUrl)}
                />
            ) : (
                <p>이미지를 로드하는 중입니다...</p>
            )}
        </div>
    );
};

export default ImageComponent;