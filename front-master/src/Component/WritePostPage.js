import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/WritePostPage.css'; // CSS 파일 불러오기

const WritePostPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('기타');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [privateType, setPrivateType] = useState('public'); // privateType 상태 추가
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [postId, setPostId] = useState(null); // 수정 모드에서 사용할 게시물 ID

  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  useEffect(() => {
    // 로컬 스토리지에서 토큰이 있는지 확인하여 로그인 여부를 판단
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // 토큰이 있으면 로그인 상태로 설정
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]); // 선택된 파일들을 배열에 추가
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove)); // 파일 제거
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError('제목과 내용을 입력해야 합니다.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후에 게시글을 작성할 수 있습니다.');
      navigate('/login');
      return;
    }

    const member = localStorage.getItem('username');
    if (!member) {
      setError('회원 정보가 없습니다.');
      return;
    }

    // FreeBoard 객체 생성
    const freeboarddata = {
      type: category,
      privateType: privateType, // privateType을 게시글에 추가
      title,
      content,
      member: { username: member },
    };

    const formData = new FormData();
    formData.append('freeboarddata', new Blob([JSON.stringify(freeboarddata)], { type: 'application/json' }));

    // 파일 추가
    files.forEach((file) => {
      formData.append('files', file);
    });

    setLoading(true);
    try {
      const response = await fetch('http://10.125.121.180:8080/api/users/freeboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('게시물을 작성하는 데 실패했습니다.');
      }

      navigate('/board', { state: { shouldRefetch: true } });
    } catch (error) {
      console.error('게시물을 작성하는 데 실패했습니다.', error);
      setError('게시물을 작성하는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-container">
      <form className="write-form" onSubmit={handleSubmit}>
        <h2 className="write-page-title">{postId ? '게시물 수정' : '게시물 작성'}</h2>
        {error && <p className="error-message">{error}</p>}
        {loading && <p className="loading-message">로딩 중...</p>}

        <div className="form-group">
          <label className="label">
            카테고리:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="write-select"
            >
              <option value="질문">질문</option>
              <option value="기타">수다</option>
            </select>
          </label>
        </div>

        <div className="form-group">
          <label className="label">
            공개 범위:
            <select
              value={privateType}
              onChange={(e) => setPrivateType(e.target.value)}
              className="write-select"
              disabled={!isLoggedIn} // 로그인하지 않으면 선택 불가
            >
              <option value="public">전체보기</option>
              {isLoggedIn && <option value="private">나만보기</option>} {/* 로그인한 경우에만 '나만보기' 옵션 표시 */}
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
          {postId ? '수정하기' : '작성하기'}
        </button>
      </form>
    </div>
  );
};

export default WritePostPage;