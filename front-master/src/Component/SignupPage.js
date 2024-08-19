import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import '../CSS/SignupPage.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://10.125.121.180:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          alias: nickname,
          email,
          role: 'ROLE_MEMBER',  // 기본 역할 설정
          enabled: 1,  // 기본 활성화 상태 설정
        }),
      });

      if (response.status === 201) {
        alert('회원가입이 성공적으로 완료되었습니다!');
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`회원가입에 실패했습니다: ${errorData.message}`);
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <div>
      <div className="signup-page">
        <div className="signup-form-container">
          <h2 className="signup-title">회원가입</h2>
          <form onSubmit={handleSignup} className="signup-form">
            <div className="signup-input-group">
              <label htmlFor="username" className="signup-label">아이디:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="signup-input"
                required
              />
            </div>
            <div className="signup-input-group">
              <label htmlFor="password" className="signup-label">비밀번호:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signup-input"
                required
              />
            </div>
            <div className="signup-input-group">
              <label htmlFor="nickname" className="signup-label">닉네임:</label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="signup-input"
                required
              />
            </div>
            <div className="signup-input-group">
              <label htmlFor="email" className="signup-label">이메일:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signup-input"
                required
              />
            </div>
            <button type="submit" className="signup-submit-button">회원가입</button>
          </form>
          <div className="signup-link-container">
            <a href="/login" className="signup-link">이미 계정이 있으신가요? 로그인</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;