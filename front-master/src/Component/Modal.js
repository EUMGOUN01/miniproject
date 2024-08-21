// Modal.js
import React from 'react';
import '../CSS/Modal.css'; // 모달 스타일

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{message}</p>
        <button onClick={onClose} className="modal-close-button">확인</button>
      </div>
    </div>
  );
};

export default Modal;