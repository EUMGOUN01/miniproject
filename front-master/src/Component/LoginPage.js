import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 훅 사용
import Footer from './Footer'; // Footer 컴포넌트 임포트
import '../CSS/LoginPage.css'; // CSS 파일 임포트

const LoginPage = () => {
  // username과 password를 관리하기 위한 상태 변수 선언
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위해 useNavigate 훅을 사용

  // 로그인 버튼 클릭 시 호출되는 함수
  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침을 방지

    // 사용자가 입력한 username과 password를 콘솔에 출력 (디버깅용)
    console.log('로그인 시도:');
    console.log('Username:', username);
    console.log('Password:', password);

    try {
      // 로그인 요청을 서버에 보냄 (POST 요청, JSON 데이터로 전송)
      const response = await fetch('http://10.125.121.180:8080/login', {
        method: 'POST', // POST 메서드를 사용하여 서버에 로그인 데이터 전송
        headers: {
          'Content-Type': 'application/json',  // 전송할 데이터가 JSON 형식임을 지정
        },
        body: JSON.stringify({ username: username, password: password }),  // JSON 형식으로 username과 password를 전송
      });

      // 서버로부터 응답이 성공적일 경우
      if (response.ok) {
        const data = await response.json(); // 서버로부터 받은 응답 데이터를 JSON 형식으로 파싱
        const token = data.token; // 서버에서 받은 JWT 토큰 추출
        localStorage.setItem('token', token);  // JWT 토큰을 로컬 스토리지에 저장하여 로그인 상태 유지
        console.log('로그인 성공, 받은 토큰:', token); // 성공 로그 출력
        alert('로그인 성공!'); // 성공 알림창
        navigate('/'); // 로그인 후 메인 페이지로 이동

      // 401 에러 처리 (잘못된 자격 증명)
      } else if (response.status === 401) {
        console.log('401 Unauthorized - 아이디 또는 비밀번호가 잘못되었습니다.');
        alert('아이디 또는 비밀번호가 잘못되었습니다.'); // 경고 알림창

      // 403 에러 처리 (계정 비활성화)
      } else if (response.status === 403) {
        console.log('403 Forbidden - 계정이 비활성화되었습니다.');
        alert('계정이 비활성화되었습니다.'); // 경고 알림창

      // 그 외의 오류 처리
      } else {
        console.log('로그인 중 오류 발생:', response.status);
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.'); // 경고 알림창
      }
    } catch (error) {
      // 네트워크 오류 또는 기타 에러 처리
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 중 문제가 발생했습니다. 나중에 다시 시도해주세요.'); // 경고 알림창
    }
  };

  return (
    <div>
      <div className="login-page">
        <div className="login-form-container">
          <h2 className="login-title">로그인</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-input-group">
              <label htmlFor="username" className="login-label">아이디:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // 입력된 아이디 값을 상태 변수로 업데이트
                className="login-input"
                required // 필수 입력 필드로 지정
              />
            </div>
            <div className="login-input-group">
              <label htmlFor="password" className="login-label">비밀번호:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // 입력된 비밀번호 값을 상태 변수로 업데이트
                className="login-input"
                required // 필수 입력 필드로 지정
              />
            </div>
            <button type="submit" className="login-submit-button">로그인</button> {/* 로그인 버튼 */}
            <a href="/signup" className="signup-button">회원가입</a> {/* 회원가입 버튼 */}
          </form>
        </div>
      </div>
      <Footer /> {/* Footer 컴포넌트 렌더링 */}
    </div>
  );
};

export default LoginPage; // LoginPage 컴포넌트 내보내기