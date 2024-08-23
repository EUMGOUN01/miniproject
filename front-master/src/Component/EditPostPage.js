import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/WritePostPage.css'; // CSS 파일

const EditPostPage = () => {
  const { freeBoardId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('질문');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [privateType, setPrivateType] = useState('public');
  const [error, setError] = useState('');

  // 게시글 데이터를 불러오는 함수
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://10.125.121.180:8080/api/public/freeboard/${freeBoardId}`);
        const data = await response.json();
        console.log('파일데이터22', data);

        // 데이터 유효성 확인 및 설정
        setTitle(data.title || '');
        setCategory(data.type || '질문');
        setContent(data.content || '');
        setPrivateType(data.privateType || 'public');

       

        // 이미지 데이터를 처리
        if (data.fimges && data.fimges.length > 0) {
          console.log('파일데이터', data);
          const fileData = data.fimges.map(data => ({
            fimgid: data.fimagid,
            //name: data.fimgoriname,
            url: `http://10.125.121.180:8080/photos/${data}`,
            existing: true,
          }));
          setFiles(fileData); // 서버에서 가져온 기존 파일들을 상태에 설정
          console.log('데이터확인', fileData);
        }
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

    console.log('파일 확인', selectedFiles);

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

    // 기존 파일 목록을 유지하면서 새 파일 추가
    const newFiles = validFiles.map(file => ({
      file,
      name: file.name,
      existing: false,
    }));
    
    console.log('기존데이터', files);

    setFiles(files => [...files, ...newFiles]); // 기존 파일 + 새 파일로 상태 업데이트
    console.log('기존+새',files);
    setError('');
  };

  // 기존 파일 삭제 처리
  const handleRemoveFile = (file) => {
    console.log('파일', files);
    console.log('테스트', file);
    if (file.existing) {
      setRemovedFiles(files => [...files, file.fimgid]); // 삭제된 기존 파일 ID 저장
    }
    setFiles(files => files.filter(f => f !== files)); // UI에서 파일 제거

    console.log(file.fimgid);
  };

 

  

  // 폼 제출 시 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError('제목과 내용을 입력해야 합니다.');
      return;
    }

    //자유 게시판 데이터
    const formData = new FormData();
    formData.append('freeboarddata', new Blob([JSON.stringify({
      freeBoardId,
      privateType,
      type: category,
      title,
      content,
      removedFiles,
    })], { type: 'application/json' }));
    console.log('폼',formData);
    // 새로 추가된 파일들만 FormData에 추가
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
      const response = await fetch(`http://10.125.121.180:8080/api/users/freeboard`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
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
                {file.existing && file.url ? (
                  <img
                    src={file.url}
                    alt={`Preview ${file.name}`}
                    className="preview-image"
                  />
                ) : (
                  file.file && (
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={`Preview ${file.name}`}
                      className="preview-image"
                    />
                  )
                )}
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
        
        <div className=''><button type="submit" className="action-button">
          수정하기
        </button></div>
        
      </form>
    </div>
  );
};

export default EditPostPage;