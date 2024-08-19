import React, { useState, useEffect } from 'react';

const ImageComponent = ({ fimgid }) => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // fimgid로 이미지 URL을 설정합니다.
        if (fimgid) {
            setImageUrl(`http://10.125.121.180:8080/photos/${fimgid}`);
        }
    }, [fimgid]);

    return (
        <div>
            {imageUrl ? (
                <img src={imageUrl} alt={`이미지 ID: ${fimgid}`} />
            ) : (
                <p>이미지를 로드하는 중입니다...</p>
            )}
        </div>
    );
};

export default ImageComponent;