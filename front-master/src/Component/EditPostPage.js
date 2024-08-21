import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/WritePostPage.css'; // CSS 파일

const EditPostPage = () => {
  const { freeBoardId } = useParams(); // URL 파라미터에서 freeBoardId 추출
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

  const [title, setTitle] = useState(''); // 게시글 제목 상태
  const [category, setCategory] = useState('질문'); // 게시글 카테고리 상태
  const [content, setContent] = useState(''); // 게시글 내용 상태
  const [files, setFiles] = useState([]); // 첨부 파일 상태
  const [removedFiles, setRemovedFiles] = useState([]); // 삭제된 파일 상태
  const [privateType, setPrivateType] = useState('public'); // 전체보기/나만보기 상태
  const [error, setError] = useState(''); // 오류 메시지 상태

  // 게시글 데이터를 불러오는 함수
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://10.125.121.180:8080/api/public/freeboard/${freeBoardId}`);
        const data = await response.json();
        setTitle(data.title);
        setCategory(data.type);
        setContent(data.content);
        setPrivateType(data.privateType || 'public');
        setFiles(data.fimges ? data.fimges.map(file => ({
          fimgid: file.fimgid,
          name: file.fimgoriname,
          url: `http://10.125.121.180:8080/photos/${file.fimgid}`,
          existing: true,
        })) : []);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchPost();
  }, [freeBoardId]);

  // 파일 선택 시 호출되는 함수
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles.map(file => ({ file, existing: false }))]);
    setError('');
  };

  // 기존 파일 삭제 처리
  const handleRemoveFile = (file) => {
    if (file.existing) {
      setRemovedFiles(prev => [...prev, file.fimgid]); // 삭제된 파일 ID 추가
    }
    setFiles(prevFiles => prevFiles.filter(f => f !== file)); // UI에서 제거
  };

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError('제목과 내용을 입력해야 합니다.');
      return;
    }

    // 식물 나눔 게시판 데이터
    const formData = new FormData();
    formData.append('freeboarddata', new Blob([JSON.stringify({
      freeBoardId,
      privateType,
      type: category,
      title,
      content,
      removedFiles,
    })], { type: 'application/json' }));

    // 새로 추가된 파일만 업로드
    files.forEach(file => {
      if (!file.existing && file.file) {
        formData.append('files', file.file); // 새로운 파일만 추가
      }
    });

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      // 서버에 게시글 수정 요청 보내기
      const response = await fetch(`http://10.125.121.180:8080/api/users/freeboard`, {
        method: 'PUT', // PUT 요청
        headers: {
          'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
        body: formData,
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.error('Response error data:', responseData);
        throw new Error('게시글을 수정하는 데 실패했습니다.');
      }

      navigate(`/post/${freeBoardId}`, { state: { shouldRefetch: true } });
    } catch (error) {
      console.error('게시글을 수정하는 데 실패했습니다:', error);
      setError('게시글을 수정하는 데 실패했습니다.');
    }
  };

  // 게시판 구조
  return (
    <div className="write-container">
      <form className="write-form" onSubmit={handleSubmit}>
        <h2 className="write-page-title">게시글 수정</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label className="label">
            카테고리:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="write-select"
            >
              <option value="질문">질문</option>
              <option value="수다">수다</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label className="label">
            보기 설정:
            <select
              value={privateType}
              onChange={(e) => setPrivateType(e.target.value)}
              className="write-select"
            >
              <option value="public">전체보기</option>
              <option value="private">나만보기</option>
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
            {files.map((file, index) => (
              <div key={index} className="preview-item">
                <img
                  src={file.url || URL.createObjectURL(file.file)}
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
          수정하기
        </button>
      </form>
    </div>
  );
};

export default EditPostPage;