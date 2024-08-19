import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImageComponent from '../Component/ImageComponent'; // 이미지 컴포넌트
import '../CSS/PostDetail.css'; // CSS 파일

const PostDetail = () => {
  const { freeBoardId } = useParams(); // URL 파라미터에서 freeBoardId 추출
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
  const [post, setPost] = useState(null); // 게시글 데이터를 저장할 상태
  const [comments, setComments] = useState([]); // 댓글 데이터를 저장할 상태
  const [newComment, setNewComment] = useState(''); // 새로운 댓글 내용을 저장할 상태
  const [editCommentId, setEditCommentId] = useState(null); // 수정할 댓글 ID를 저장할 상태
  const [editCommentContent, setEditCommentContent] = useState(''); // 수정할 댓글 내용을 저장할 상태
  const [error, setError] = useState(''); // 오류 메시지를 저장할 상태

  // 게시글 데이터와 댓글 데이터를 가져옴
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://10.125.121.180:8080/api/public/freeboard/${freeBoardId}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://10.125.121.180:8080/api/freecomment?freeBoardId=${freeBoardId}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('댓글 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchPost();
    fetchComments();
  }, [freeBoardId]);

  // 게시글 삭제 처리 함수
  const handleDelete = async () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`http://10.125.121.180:8080/api/freeboard/${freeBoardId}`);
        navigate('/board', { state: { shouldRefetch: true } }); // 삭제 후 게시글 목록 페이지로 이동
      } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        setError('게시글 삭제에 실패했습니다.');
      }
    }
  };

  // 댓글 제출 처리 함수
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://10.125.121.180:8080/api/freecomment', {
        freeBoardId,
        content: newComment,
        username: '작성자명' // 여기에 실제 작성자명을 넣어야 합니다.
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('댓글을 등록하는 중 오류가 발생했습니다.');
    }
  };

  // 댓글 수정 처리 함수
  const handleCommentEdit = async (commentId) => {
    try {
      const response = await axios.put(`http://10.125.121.180:8080/api/freecomment/${commentId}`, {
        content: editCommentContent
      });
      setComments(comments.map(comment => (comment.free_comment_id === commentId ? response.data : comment)));
      setEditCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
      setError('댓글을 수정하는 중 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제 처리 함수
  const handleCommentDelete = async (commentId) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`http://10.125.121.180:8080/api/freecomment/${commentId}`);
        setComments(comments.filter(comment => comment.free_comment_id !== commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
        setError('댓글을 삭제하는 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="post-detail-container">
      {error && <p className="error-message">{error}</p>} {/* 오류 메시지 표시 */}
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
                <td>{post.createDate ? new Date(post.createDate).toLocaleDateString() : '정보 없음'}</td>
                <td>{post.view || '정보 없음'}</td>
              </tr>
            </tbody>
          </table>
          <h1 className="post-title">{post.title || '정보 없음'}</h1>
          <p className="post-content">{post.content || '정보 없음'}</p>
          
           {/* 이미지 렌더링 부분 - 수정하지 마시오. */}
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
          <button className="delete-button" onClick={handleDelete}>
            삭제하기
          </button>

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
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.free_comment_id} className="comment">
                  {editCommentId === comment.free_comment_id ? (
                    <div>
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        required
                      />
                      <button onClick={() => handleCommentEdit(comment.free_comment_id)}>수정 완료</button>
                      <button onClick={() => setEditCommentId(null)}>취소</button>
                    </div>
                  ) : (
                    <div>
                      <p>{comment.content}</p>
                      <span>{comment.username}</span>
                      <span>{new Date(comment.createdate).toLocaleDateString()}</span>
                      <button onClick={() => {
                        setEditCommentId(comment.free_comment_id);
                        setEditCommentContent(comment.content);
                      }}>수정</button>
                      <button onClick={() => handleCommentDelete(comment.free_comment_id)}>삭제</button>
                    </div>
                  )}
                </div>
              ))
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