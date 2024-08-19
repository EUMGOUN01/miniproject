import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSS/PlantDetail.css';

const PlantDetails = () => {
  const { shareBoardId } = useParams(); // URL 파라미터에서 게시물 ID를 가져옵니다.
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!shareBoardId) {
        setError('유효하지 않은 게시물 ID입니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://10.125.121.180:8080/public/shareboard/${shareBoardId}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('게시물 데이터를 가져오는 중 오류 발생:', error);
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!shareBoardId) return;

      try {
        const response = await fetch(`http://10.125.121.180:8080/api/sharecomment?shareBoardId=${shareBoardId}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('댓글 데이터를 가져오는 중 오류 발생:', error);
        setError('댓글 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchData();
    fetchComments();
  }, [shareBoardId]);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !post) return;

    const mapOptions = {
      center: new kakao.maps.LatLng(35.1587, 129.1601),
      level: 3,
    };

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapRef.current = new kakao.maps.Map(mapContainer, mapOptions);

      if (post.address) {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(post.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new kakao.maps.Marker({
              position: coords
            });
            marker.setMap(mapRef.current);
            mapRef.current.setCenter(coords);
          } else {
            console.error('주소 검색 실패, 상태:', status);
          }
        });
      } else {
        console.warn('주소가 제공되지 않았습니다.');
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [post]);

  const handleEdit = () => {
    navigate(`/plant-sharing/edit/${shareBoardId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      try {
        await fetch(`http://10.125.121.180:8080/public/shareboard/${shareBoardId}`, { method: 'DELETE' });
        alert('게시물이 삭제되었습니다.');
        navigate('/plant-sharing');
      } catch (error) {
        console.error('게시물 삭제 중 오류 발생:', error);
        setError('게시물을 삭제하는 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCommentData = {
        share_comment_id: comments.length + 1, // 임시 ID
        share_board_id: parseInt(shareBoardId, 10),
        content: newComment,
        username: '작성자명', // 실제 사용자명으로 변경 필요
        createdate: new Date().toISOString(),
      };
      const response = await fetch('http://10.125.121.180:8080/api/sharecomment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommentData),
      });
      const data = await response.json();
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
      setError('댓글을 작성하는 중 오류가 발생했습니다.');
    }
  };

  const handleCommentEdit = async (commentId) => {
    try {
      const updatedComment = { content: editCommentContent };
      await fetch(`http://10.125.121.180:8080/api/sharecomment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComment),
      });
      setComments(comments.map(comment => 
        comment.share_comment_id === commentId ? { ...comment, content: editCommentContent } : comment
      ));
      setEditCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('댓글 수정 중 오류 발생:', error);
      setError('댓글을 수정하는 중 오류가 발생했습니다.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await fetch(`http://10.125.121.180:8080/api/sharecomment/${commentId}`, { method: 'DELETE' });
        setComments(comments.filter(comment => comment.share_comment_id !== commentId));
      } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        setError('댓글을 삭제하는 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">오류 발생: {error}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  return (
    <div className="plant-detail-container">
      <h1>{post.title}</h1>
      <p><strong>카테고리:</strong> {post.type}</p>
      <p><strong>작성자:</strong> {post.username}</p>
      <p><strong>작성일:</strong> {new Date(post.createDate).toLocaleDateString()}</p>
      <p><strong>조회수:</strong> {post.view}</p>
      <p>{post.content}</p>

      <div id="map" style={{ width: '100%', height: '300px', marginBottom: '20px' }}></div>

      <div className="buttons-container">
        <button onClick={handleEdit} className="edit-button">수정</button>
        <button onClick={handleDelete} className="delete-button">삭제</button>
        <button onClick={() => navigate('/plant-sharing')} className="back-button">목록으로 돌아가기</button>
      </div>

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
            <div key={comment.share_comment_id} className="comment">
              {editCommentId === comment.share_comment_id ? (
                <div>
                  <textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                  />
                  <button onClick={() => handleCommentEdit(comment.share_comment_id)}>저장</button>
                </div>
              ) : (
                <div>
                  <p>{comment.content}</p>
                  <p><strong>{comment.username}</strong> - {new Date(comment.createdate).toLocaleDateString()}</p>
                  <button onClick={() => setEditCommentId(comment.share_comment_id) || setEditCommentContent(comment.content)}>수정</button>
                  <button onClick={() => handleCommentDelete(comment.share_comment_id)}>삭제</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default PlantDetails;