import React, { useState } from 'react';
import { userApi, coupleApi } from '../utils/api';

function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' 或 'register'
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }
    
    try {
      setLoading(true);
      // 登录
      await userApi.login(username, password);
      
      // 获取用户信息
      const user = await userApi.getCurrentUser();
      
      try {
        // 尝试获取情侣关系
        const couple = await coupleApi.getCouple();
        const partner = await coupleApi.getPartner();
        
        // 登录成功，有情侣关系
        onLogin(user, partner);
      } catch (error) {
        // 登录成功，但没有情侣关系
        onLogin(user, null);
      }
    } catch (error) {
      setError(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !displayName || !password || !confirmPassword) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    try {
      setLoading(true);
      // 注册
      await userApi.register({
        username,
        display_name: displayName,
        password
      });
      
      // 注册成功后自动登录
      await userApi.login(username, password);
      
      // 获取用户信息
      const user = await userApi.getCurrentUser();
      
      // 如果提供了伴侣用户名，创建情侣关系
      if (partnerUsername) {
        try {
          // 创建情侣关系
          const coupleData = {
            user_id: user.id,
            partner_id: partnerUsername.trim()
          };
          
          await coupleApi.createCouple(coupleData);
          
          // 获取伴侣信息
          const partner = await coupleApi.getPartner();
          
          // 登录成功，有情侣关系
          onLogin(user, partner);
        } catch (error) {
          // 创建情侣关系失败，但用户已注册成功
          onLogin(user, null);
        }
      } else {
        // 没有提供伴侣用户名，只返回用户信息
        onLogin(user, null);
      }
    } catch (error) {
      setError(error.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <h2>欢迎使用情侣日程小程序</h2>
      
      <div className="tab-container">
        <div 
          className={`tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          登录
        </div>
        <div 
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          注册
        </div>
      </div>
      
      {activeTab === 'login' ? (
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="reg-username">用户名</label>
            <input
              type="text"
              id="reg-username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={loading}
            />
            <small className="form-text">用户名将作为唯一标识，用于伴侣绑定</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="display-name">昵称</label>
            <input
              type="text"
              id="display-name"
              className="form-control"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="请输入昵称"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reg-password">密码</label>
            <input
              type="password"
              id="reg-password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">确认密码</label>
            <input
              type="password"
              id="confirm-password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="partner-username">伴侣用户名（可选）</label>
            <input
              type="text"
              id="partner-username"
              className="form-control"
              value={partnerUsername}
              onChange={(e) => setPartnerUsername(e.target.value)}
              placeholder="请输入伴侣用户名（可选）"
              disabled={loading}
            />
            <small className="form-text">如果您的伴侣已注册，请输入他/她的用户名</small>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Login;