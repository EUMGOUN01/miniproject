import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/WritePostPage.css'; // CSS 파일

const WritePostPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
  const [title, setTitle] = useState(''); // 게시글 제목 상태
  const [category, setCategory] = useState('기타'); // 게시글 카테고리 상태, 기본값은 '기타'
  const [content, setContent] = useState(''); // 게시글 내용 상태
  const [files, setFiles] = useState([]); // 첨부 파일 상태
  const [error, setError] = useState(''); // 오류 메시지 상태

  // 파일 선택 시 호출되는 함수
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // 선택된 파일 배열로 변환
    const validFiles = [];

    selectedFiles.forEach((file) => {
      // 이미지 파일만 업로드 가능
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }

      validFiles.push(file); // 유효한 파일만 배열에 추가
    });

    // 기존 파일과 새 파일 병합하여 상태 업데이트
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setError('');
  };

  // 파일 삭제 함수
  const handleRemoveFile = (fileToRemove) => {
    setFiles((prevFiles) => prevFiles.filter(file => file !== fileToRemove));
  };

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 막기

    if (!title || !content) {
      setError('제목과 내용을 입력해야 합니다.');
      return;
    }

    // 게시글 데이터 객체 생성
    const freeboardData = {
      privateType: 'public',
      type: category,
      title,
      content,
    };

    try {
      const formData = new FormData();
      formData.append('freeboarddata', new Blob([JSON.stringify(freeboardData)], { type: 'application/json' }));
      files.forEach((file) => {
        formData.append('files', file);
      });

      // 게시글 데이터와 파일 업로드 요청
      await axios.post('http://10.125.121.180:8080/api/freeboard', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 작성 완료 후 게시글 목록 페이지로 이동
      navigate('/board', { state: { shouldRefetch: true } });
    } catch (error) {
      console.error('게시물을 작성하는 데 실패했습니다.', error); // 오류 로그
      setError('게시물을 작성하는 데 실패했습니다.');
    }
  };

  return (
    <div className="write-container">
      <form className="write-form" onSubmit={handleSubmit}>
        <h2 className="write-page-title">게시물 작성</h2>
        {error && <p className="error-message">{error}</p>} {/* 오류 메시지 표시 */}
        <div className="form-group">
          <label className="label">
            카테고리:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="write-select"
            >
              <option value="공지">공지</option>
              <option value="질문">질문</option>
              <option value="기타">기타</option>
            </select>
          </label>
        </div>
        <label className="label">
          제목:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="write-input"
            placeholder="제목을 입력하세요"
            required
          />
        </label>
        <label className="label">
          내용:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="write-textarea"
            placeholder="내용을 입력하세요"
            required
          />
        </label>
        <label className="label">
          첨부 파일:
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="write-file-input"
          />
        </label>
        {files.length > 0 && (
          <div className="preview-container">
            {files.map((file) => (
              <div key={file.name} className="preview-item">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${file.name}`}
                  className="preview-image"
                />
                <p>{file.name}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="remove-file-btn"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="write-submit-btn">
          작성하기
        </button>
      </form>
    </div>
  );
};

export default WritePostPage;