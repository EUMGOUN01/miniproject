import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import ImageComponent from '../Component/ImageComponent';
import '../CSS/PlantDetail.css';

const PlantDetail = () => {
  const { shareBoardId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null); // Marker reference for cleanup

  useEffect(() => {
    const username = localStorage.getItem('username');
    setLoggedInUsername(username || '');
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`http://10.125.121.180:8080/api/public/shareboard/${shareBoardId}`);
      const data = await response.json();
      console.log('데이터', data);
      setPost(data);
      setError(null);
    } catch (error) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }, [shareBoardId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Kakao Map 초기화
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !post || !post.address) return;
  
    const initializeMap = () => {
      const mapOptions = {
        center: new kakao.maps.LatLng(35.1587, 129.1601),
        level: 3,
      };
  
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapRef.current = new kakao.maps.Map(mapContainer, mapOptions);
        
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(post.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new kakao.maps.Marker({
              position: coords,
            });
            marker.setMap(mapRef.current);
            markerRef.current = marker;
            mapRef.current.setCenter(coords);
          } else {
            console.error('주소 검색 실패, 상태:', status);
          }
        });
      }
    };
  
    initializeMap();
  
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [post]);

  

  const handlePostDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/shareboard/${shareBoardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('게시글 삭제 실패');
      navigate('/board');
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error);
      setError('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditPostClick = () => {
    navigate(`/plant-sharing/edit/${post.shareBoardId}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const newCommentData = {
      content: newComment,
      createDate: new Date(),
      parentId: null,
      scchildlist: [],
      deleted: false,
      shareBoardId: shareBoardId,
    };

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/shareboard/${shareBoardId}/sharecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCommentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('서버 에러:', errorData);
        throw new Error('댓글 등록 실패');
      }

      await fetchPost();
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
      setError('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const updatedCommentData = {
      content: editContent,
      createDate: new Date(),
    };

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/shareboard/sharecomment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCommentData),
      });

      if (!response.ok) throw new Error('댓글 수정 실패');
      await fetchPost();
      setEditingCommentId(null);
    } catch (error) {
      console.error('댓글 수정 중 오류:', error);
      setError('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleEditClick = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const handleDelete = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
  
    {/* 댓글 삭제 */}
    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/shareboard/sharecomment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('댓글 삭제 실패:', errorData);
        throw new Error('댓글 삭제 실패');
      }
  
      // 부모 댓글 삭제 시 자식 댓글의 parentId를 null로 설정하여 독립적인 댓글로 변경
      setPost((prevPost) => {
        const promoteChildComments = (comments, idToDelete) => {
          return comments.map((comment) => {
            if (comment.shareCommentId === idToDelete) {
              return {
                ...comment,
                deleted: true,
                scchildlist: comment.scchildlist.map((child) => ({ ...child, parentId: null })),
              };
            } else if (comment.scchildlist && comment.scchildlist.length > 0) {
              return {
                ...comment,
                scchildlist: promoteChildComments(comment.scchildlist, idToDelete),
              };
            }
            return comment;
          });
        };
      
        const updatedComments = promoteChildComments(prevPost.scomts, commentId);
      
        return {
          ...prevPost,
          scomts: updatedComments,
        };
      });
  
      setError(null); // 오류 메시지 초기화
    } catch (error) {
      console.error('댓글 삭제 중 오류:', error);
      setError('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const newReply = {
      content: replyContent,
      createDate: new Date(),
      parentId: parentId,
      scchildlist: [],
      deleted: false,
      shareBoardId: shareBoardId,
    };

    try {
      const response = await fetch(`http://10.125.121.180:8080/api/users/shareboard/${shareBoardId}/sharecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newReply),
      });

      if (!response.ok) throw new Error('대댓글 등록 실패');
      await fetchPost();
      setReplyContent('');
      setReplyCommentId(null);
    } catch (error) {
      console.error('대댓글 작성 중 오류:', error);
      setError('대댓글 등록 중 오류가 발생했습니다.');
    }
  };


  const renderComments = (comments) => {
    return comments.map(comment => (
      <div key={comment.shareCommentId} className="comment" style={{ marginLeft: comment.parentId ? '20px' : '0px' }}>
        {comment.deleted ? (
          <p className="deleted-comment">삭제된 댓글입니다.</p>
        ) : (
          <>
            {editingCommentId === comment.shareCommentId ? (
              <form onSubmit={(e) => handleEditSubmit(e, comment.shareCommentId)}>
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
                <span>{comment.username || '알 수 없음'}</span>
                <span>{new Date(comment.createDate).toLocaleDateString()}</span>

                {/* 댓글 작성자와 로그인된 사용자가 같을 때만 수정, 삭제 버튼 표시 */}
                {loggedInUsername === comment.username && (
                  <>
                    <button onClick={() => handleEditClick(comment.shareCommentId, comment.content)}>수정</button>
                    <button onClick={() => handleDelete(comment.shareCommentId)}>삭제</button>
                  </>
                )}
                <button onClick={() => setReplyCommentId(comment.shareCommentId)}>대댓글 작성</button>
              </>
            )}

            {replyCommentId === comment.shareCommentId && (
              <form onSubmit={(e) => handleReplySubmit(e, comment.shareCommentId)}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="대댓글을 입력하세요"
                  required
                />
                <button type="submit">대댓글 작성</button>
              </form>
            )}

            {comment.scchildlist && comment.scchildlist.length > 0 && (
              <div className="child-comments" style={{ marginLeft: '20px' }}>
                {renderComments(comment.scchildlist)}
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
                <td>{post.shareBoardId || '정보 없음'}</td>
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

          {post.simges && post.simges.length > 0 ? (
            <div className="post-images">
              {post.simges.map((image, index) => (
                <ImageComponent key={index} filename={`null${image}`} />
              ))}
            </div>
          ) : (
            <p>첨부 파일이 없습니다.</p>
          )}

          {/* Render the map and address only if an address is provided */}
        {post.address && post.address.trim() && (
          <>
            <div id="map" style={{ width: '100%', height: '400px' }}></div>
            <div className="post-address">
              <p><strong>주소:</strong> {post.address}</p>
            </div>
          </>
        )}

          <div className="post-actions">
            <button className="back-button" onClick={() => navigate('/plant-sharing')}>돌아가기</button>
            
            {loggedInUsername === post.username && (
              <>
                <button className="edit-button" onClick={handleEditPostClick}>수정하기</button>
                <button className="delete-button" onClick={handlePostDelete}>삭제하기</button>
              </>
            )}
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
            {post.scomts && post.scomts.length > 0 ? (
              renderComments(post.scomts)
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

export default PlantDetail;