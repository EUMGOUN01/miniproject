import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';  // 모달 컴포넌트 불러오기
import '../CSS/SignupPage.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // 오류 메시지 초기화

    try {
      const response = await fetch('http://10.125.121.180:8080/signin', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          alias,
          email,
          role: 'ROLE_MEMBER',
          enabled: 1,
        }),
      });

      if (response.ok) {
        alert('회원가입이 성공적으로 완료되었습니다!');
        navigate('/login');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || '중복된 아이디 입니다.'; // 기본 오류 메시지 설정
        setError(errorMessage); // 오류 메시지 설정
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      setError('회원가입 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <div className="Signpage">
      <div className="Signform-container">
        <h2 className="Signtitle">회원가입</h2>
        <form onSubmit={handleSignup} className="Signform">
          <div className="Signinput-group">
            <label htmlFor="username" className="Signlabel">아이디:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="Signinput"
              required
            />
          </div>
          <div className="Signinput-group">
            <label htmlFor="password" className="Signlabel">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="Signinput"
              required
            />
          </div>
          <div className="Signinput-group">
            <label htmlFor="alias" className="Signlabel">닉네임:</label>
            <input
              type="text"
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="Signinput"
              required
            />
          </div>
          <div className="Signinput-group">
            <label htmlFor="email" className="Signlabel">이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="Signinput"
              required
            />
          </div>
          <button type="submit" className="Signbutton">회원가입</button>
        </form>
        <div className="Signlink-container">
          <a href="/login" className="Signlogin-button">이미 계정이 있으신가요? 로그인</a>
        </div>
      </div>

      {/* 모달 창을 에러가 있을 때만 표시 */}
      {error && <Modal message={error} onClose={() => setError('')} />}
    </div>
  );
};

export default SignupPage;