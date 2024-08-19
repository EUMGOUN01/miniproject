import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import '../CSS/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://10.125.121.180:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = response.headers.get('Authorization');
        if (token) {
          // JWT 토큰과 유저 네임을 로컬 스토리지에 저장
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          console.log('로그인 성공, 받은 토큰:', token);
          alert('로그인 성공!');
          
          window.dispatchEvent(new Event('storage'));
          navigate('/');
        } else {
          console.log('토큰이 헤더에 포함되지 않았습니다.');
          alert('로그인 중 오류가 발생했습니다.');
        }
      } else if (response.status === 401) {
        alert('아이디 또는 비밀번호가 잘못되었습니다.');
      } else if (response.status === 403) {
        alert('계정이 비활성화되었습니다.');
      } else {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
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
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                required
              />
            </div>
            <div className="login-input-group">
              <label htmlFor="password" className="login-label">비밀번호:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>
            <button type="submit" className="login-submit-button">로그인</button>
            <a href="/signup" className="signup-button">회원가입</a>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;