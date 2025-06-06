import React, { useState } from 'react';

function Login({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!userName.trim() || !partnerName.trim()) {
      setError('请填写双方的名字');
      return;
    }
    
    const user = {
      id: '1',
      name: userName.trim()
    };
    
    const partner = {
      id: '2',
      name: partnerName.trim()
    };
    
    onLogin(user, partner);
  };
  
  return (
    <div className="card">
      <h2>欢迎使用情侣日程小程序</h2>
      <p>请输入你们的名字开始使用</p>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="userName">你的名字</label>
          <input
            type="text"
            id="userName"
            className="form-control"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="请输入你的名字"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="partnerName">伴侣的名字</label>
          <input
            type="text"
            id="partnerName"
            className="form-control"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="请输入伴侣的名字"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="btn">开始使用</button>
      </form>
    </div>
  );
}

export default Login;