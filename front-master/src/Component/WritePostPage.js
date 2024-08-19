import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/WritePostPage.css'; // CSS 파일

const WritePostPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
  const [title, setTitle] = useState(''); // 게시글 제목 상태
  const [category, setCategory] = useState('기타'); // 게시글 카테고리 상태, 기본값은 '기타'
  const [content, setContent] = useState(''); // 게시글 내용 상태
  const [files, setFiles] = useState([]); // 첨부 파일 상태
  const [removedFiles, setRemovedFiles] = useState([]); // 삭제된 파일 상태
  const [error, setError] = useState(''); // 오류 메시지 상태
  const [postId, setPostId] = useState(null); // 게시글 ID 상태
  const [existingFiles, setExistingFiles] = useState([]); // 기존 파일 상태
  const [privateType, setPrivateType] = useState('public'); // 전체보기/나만보기 상태

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후에 게시글을 작성할 수 있습니다.');
      navigate('/login'); // 로그인 페이지로 리디렉션
    }

    const fetchPost = async () => {
      // 게시글 수정 모드일 때만 데이터 로드
      if (postId) {
        try {
          const response = await fetch(`http://10.125.121.180:8080/public/freeboard/${postId}`);
          const data = await response.json();
          setTitle(data.title);
          setCategory(data.type);
          setContent(data.content);
          setPrivateType(data.privateType);
          setExistingFiles(data.fimges ? data.fimges.map(file => ({
            fimgid: file.fimgid,
            name: file.fimgoriname, // 원본 파일 이름
            url: `http://10.125.121.180:8080/photos/${file.fimgid}`, // 파일 ID를 사용한 이미지 URL
          })) : []);
        } catch (error) {
          console.error('Error fetching post:', error);
          setError('게시글을 불러오는 중 오류가 발생했습니다.');
        }
      }
    };
    fetchPost();
  }, [postId, navigate]);

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
    if (existingFiles.some(file => file.fimgid === fileToRemove.fimgid)) {
      setRemovedFiles(prev => [...prev, fileToRemove.fimgid]); // 삭제된 파일 ID 추가
    }
    setFiles((prevFiles) => prevFiles.filter(file => file !== fileToRemove));
  };

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 막기

    if (!title || !content) {
      setError('제목과 내용을 입력해야 합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('freeboarddata', new Blob([JSON.stringify({
      privateType, // privateType 선택 추가
      type: category,
      title,
      content,
      removedFiles, // 삭제된 파일 ID 리스트 전달
      ...(postId && { freeBoardId: postId }) // 수정 모드일 때만 ID 포함
    })], { type: 'application/json' }));

    // 새로 추가된 파일만 업로드
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');  // 토큰 가져오기
      const response = await fetch('http://10.125.121.180:8080/api/users/freeboard', {
        method: postId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,  // 인증 토큰 추가
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('게시물을 작성하는 데 실패했습니다.');
      }

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
        <h2 className="write-page-title">{postId ? '게시물 수정' : '게시물 작성'}</h2>
        {error && <p className="error-message">{error}</p>} {/* 오류 메시지 표시 */}
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
        {existingFiles.length > 0 && (
          <div className="existing-files-container">
            {existingFiles.map((file) => (
              <div key={file.fimgid} className="preview-item">
                <img
                  src={file.url}
                  alt={`Preview ${file.name}`}
                  className="preview-image"
                />
                <p>{file.name}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveFile({ fimgid: file.fimgid })}
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