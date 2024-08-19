import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      // 직접 URL을 하드코딩합니다.
      const response = await axios.post('http://10.125.121.180:8080/public/signup', {
        username,
        password,  // 필드명
        alias: nickname,  // 필드명
        email,
        role: 'ROLE_MEMBER',  // 기본 역할 설정
        enabled: 1,  // 기본 활성화 상태 설정
      });

      if (response.status === 201) {
        navigate('/login');
      } else {
        // 서버에서 반환된 오류 메시지를 처리합니다.
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      if (error.response) {
        alert(`회원가입 실패: ${error.response.data.message}`);
      } else if (error.request) {
        alert('서버로부터 응답이 없습니다.');
      } else {
        alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div>
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
              <label htmlFor="nickname" className="Signlabel">닉네임:</label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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
            <a href="/login" className="Signbutton Signlogin-button">로그인</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;