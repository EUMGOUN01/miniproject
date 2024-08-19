import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ImageComponent from '../Component/ImageComponent'; // 이미지 컴포넌트
import '../CSS/PostDetail.css'; // CSS 파일

const PostDetail = () => {
  const { freeBoardId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyCommentId, setReplyCommentId] = useState(null); // 대댓글 작성할 댓글 ID
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정할 댓글 ID
  const [editContent, setEditContent] = useState(''); // 수정할 댓글 내용
  const [error, setError] = useState('');

  // DB에서 게시글 데이터를 가져오는 함수
  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`http://10.125.121.180:8080/api/public/freeboard/${freeBoardId}`);
      const data = await response.json();
      console.log('Fetched post data:', data); // 데이터 확인
      setPost(data);
      setError(null);
    } catch (error) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }, [freeBoardId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // 댓글 작성 처리 함수
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const username = localStorage.getItem('username'); // username 가져오기
    if (!username) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const newCommentData = {
      content: newComment,
      createDate: new Date(),
      parentId: null,
      fcchildlist: [],
      deleted: false,
      freeBoardId: freeBoardId,
      username: username, // username 추가
    };

    const token = localStorage.getItem('token'); // 저장된 토큰 가져오기

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/freeboard/${freeBoardId}/freecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
        body: JSON.stringify(newCommentData),
      });

      if (!response.ok) {
        throw new Error('댓글 등록 실패');
      }

      await fetchPost(); // 댓글 작성 후 게시글 다시 불러오기
      setNewComment('');
    } catch (error) {
      setError('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  // 대댓글을 부모 댓글에 추가하는 함수
  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();

    const username = localStorage.getItem('username'); // username 가져오기
    if (!username) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const newReply = {
      content: replyContent,
      createDate: new Date(),
      parentId: parentId,
      fcchildlist: [],
      deleted: false,
      freeBoardId: freeBoardId,
      username: username, // username 추가
    };

    const token = localStorage.getItem('token'); // 저장된 토큰 가져오기

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/freeboard/${freeBoardId}/freecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
        body: JSON.stringify(newReply),
      });

      if (!response.ok) throw new Error('대댓글 등록 실패');
      await fetchPost(); // 댓글 작성 후 게시글 다시 불러오기
      setReplyContent(''); // 입력 필드 초기화
      setReplyCommentId(null); // 대댓글 폼 닫기
    } catch (error) {
      setError('대댓글 등록 중 오류가 발생했습니다.');
    }
  };

  // 댓글 수정 클릭 핸들러
  const handleEditClick = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  // 댓글 수정 처리 함수
  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();

    const updatedComment = {
      content: editContent,
      createDate: new Date(),
    };

    const token = localStorage.getItem('token'); // 저장된 토큰 가져오기

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/freeboard/freecomment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
        body: JSON.stringify(updatedComment),
      });

      if (!response.ok) throw new Error('댓글 수정 실패');
      await fetchPost(); // 수정 후 게시글 다시 불러오기
      setEditingCommentId(null); // 수정 모드 종료
    } catch (error) {
      setError('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제 처리 함수
  const handleDelete = async (commentId) => {
    const token = localStorage.getItem('token'); // 저장된 토큰 가져오기

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/freeboard/freecomment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
        },
      });

      if (!response.ok) throw new Error('댓글 삭제 실패');
      await fetchPost(); // 삭제 후 게시글 다시 불러오기
    } catch (error) {
      setError('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 댓글 렌더링 함수
  const renderComments = (comments) => {
    return comments.map(comment => (
      <div key={comment.freeCommentId} className="comment" style={{ marginLeft: comment.parentId ? '20px' : '0px' }}>
        {comment.deleted ? (
          <p className="deleted-comment">삭제된 댓글입니다.</p>
        ) : (
          <>
            {editingCommentId === comment.freeCommentId ? (
              <form onSubmit={(e) => handleEditSubmit(e, comment.freeCommentId)}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                />
                <button type="submit">저장</button>
                <button type="button" onClick={() => setEditingCommentId(null)}>취소</button>
              </form>
            ) : (
              <>
                <p>{comment.content}</p>
                <span>{comment.username || '알 수 없음'}</span> {/* 서버에서 받은 username을 표시 */}
                <span>{new Date(comment.createDate).toLocaleDateString()}</span>
                <button onClick={() => handleEditClick(comment.freeCommentId, comment.content)}>수정</button>
                <button onClick={() => handleDelete(comment.freeCommentId)}>삭제</button>
                <button onClick={() => setReplyCommentId(comment.freeCommentId)}>대댓글 작성</button>
              </>
            )}

            {/* 대댓글 작성 폼 */}
            {replyCommentId === comment.freeCommentId && (
              <form onSubmit={(e) => handleReplySubmit(e, comment.freeCommentId)}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="대댓글을 입력하세요"
                  required
                />
                <button type="submit">대댓글 작성</button>
              </form>
            )}

            {/* 대댓글이 있으면 재귀적으로 렌더링 */}
            {comment.fcchildlist && comment.fcchildlist.length > 0 && (
              <div className="child-comments" style={{ marginLeft: '20px' }}>
                {renderComments(comment.fcchildlist)}
              </div>
            )}
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="post-detail-container">
      {error && <p className="error-message">{error}</p>}
      {post ? (
        <div>
          <table className="post-detail-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>카테고리</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{post.freeBoardId || '정보 없음'}</td>
                <td>{post.type || '정보 없음'}</td>
                <td>{post.title || '정보 없음'}</td>
                <td>{post.username || '알 수 없음'}</td>
                <td>{new Date(post.createDate).toLocaleDateString()}</td>
                <td>{post.view || '정보 없음'}</td>
              </tr>
            </tbody>
          </table>
          <h1 className="post-title">{post.title || '정보 없음'}</h1>
          <p className="post-content">{post.content || '정보 없음'}</p>

          {/* 이미지 렌더링 */}
          {post.fimges && post.fimges.length > 0 ? (
            <div className="post-images">
              {post.fimges.map((image, index) => (
                <ImageComponent key={index} filename={`null${image}`} />
              ))}
            </div>
          ) : (
            <p>첨부 파일이 없습니다.</p>
          )}

          <button className="back-button" onClick={() => navigate('/board')}>
            돌아가기
          </button>
          <Link to={`/edit/${post.freeBoardId}`} className="edit-button">
            수정하기
          </Link>
          <button className="delete-button" onClick={() => navigate('/board')}>
            삭제하기
          </button>

          {/* 댓글 섹션 */}
          <div className="comments-section">
            <h2>댓글</h2>
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                required
              />
              <button type="submit">댓글 작성</button>
            </form>
            {post.fcomts && post.fcomts.length > 0 ? (
              renderComments(post.fcomts)
            ) : (
              <p>댓글이 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <p>게시글을 로드하는 중입니다...</p>
      )}
    </div>
  );
};

export default PostDetail;