import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coupleApi } from '../utils/api';

function CoupleForm({ user, setPartner }) {
  const navigate = useNavigate();
  const [partnerUsername, setPartnerUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!partnerUsername.trim()) {
      setError('请输入伴侣的用户名');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('开始创建情侣关系...');
      console.log('当前用户ID:', user.id);
      
      // 直接使用伴侣的用户名作为伴侣ID
      const partnerId = partnerUsername.trim();
      console.log('伴侣ID:', partnerId);
      
      // 创建情侣关系
      const coupleData = {
        user_id: user.id,
        partner_id: partnerId
      };
      
      console.log('发送的数据:', coupleData);
      
      try {
        const couple = await coupleApi.createCouple(coupleData);
        console.log('创建情侣关系成功:', couple);
        
        // 获取伴侣信息
        try {
          const partnerData = await coupleApi.getPartner();
          console.log('获取伴侣信息成功:', partnerData);
          
          // 更新伴侣状态
          setPartner(partnerData);
          
          setSuccess(true);
          
          // 延迟导航到仪表板
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } catch (partnerError) {
          console.error('获取伴侣信息失败:', partnerError);
          setError('获取伴侣信息失败: ' + (partnerError.message || '未知错误'));
        }
      } catch (coupleError) {
        console.error('创建情侣关系API调用失败:', coupleError);
        setError('创建情侣关系失败: ' + (coupleError.message || '未知错误'));
      }
    } catch (error) {
      console.error('创建情侣关系过程中发生错误:', error);
      setError('创建情侣关系失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <h2>创建情侣关系</h2>
      
      {success ? (
        <div className="success-message">
          <p>情侣关系创建成功！正在跳转到仪表板...</p>
        </div>
      ) : (
        <>
          <p>在开始使用前，请创建情侣关系</p>
          
          {loading && <div className="loading-indicator">加载中...</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="partnerUsername">伴侣用户名</label>
              <input
                type="text"
                id="partnerUsername"
                className="form-control"
                value={partnerUsername}
                onChange={(e) => setPartnerUsername(e.target.value)}
                placeholder="请输入伴侣的用户名"
                required
                disabled={loading}
              />
              <small className="form-text">输入伴侣注册时使用的用户名</small>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                取消
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? '创建中...' : '创建情侣关系'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default CoupleForm;