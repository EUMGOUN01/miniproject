import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';  // 모달 컴포넌트 불러오기
import '../CSS/SignupPage.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 유효성 검사
    if (username.length > 16) {
      newErrors.username = '아이디는 16자 이하로 입력해주세요.';
    }
    if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);

    // 오류가 있으면 더 진행하지 않음
    if (Object.keys(newErrors).length > 0) {
      console.log("오류 발생:", newErrors);  // 디버그용 출력
      return;
    }

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
        setErrors({ form: errorMessage }); // 폼 전체에 오류 메시지 설정
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      setErrors({ form: '회원가입 중 문제가 발생했습니다. 나중에 다시 시도해주세요.' });
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
            {/* 강제로 오류 메시지 추가해서 확인 */}
            {errors.username && <p className="Signerror">{errors.username}</p>}
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
            {errors.password && <p className="Signerror">{errors.password}</p>}
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
            {errors.email && <p className="Signerror">{errors.email}</p>}
          </div>
          <button type="submit" className="Signbutton">회원가입</button>
        </form>
        <div className="Signlink-container">
          <a href="/login" className="Signlogin-button">이미 계정이 있으신가요? 로그인</a>
        </div>
      </div>

      {/* 폼 전반적인 에러 메시지 표시 */}
      {errors.form && <Modal message={errors.form} onClose={() => setErrors({ form: '' })} />}
    </div>
  );
};

export default SignupPage;