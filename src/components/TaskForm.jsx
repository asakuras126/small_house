import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { taskApi, coupleApi } from '../utils/api';

function TaskForm({ user, partner, setTasks }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignee, setAssignee] = useState(user.id);
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupleId, setCoupleId] = useState('');
  
  // 获取情侣关系ID
  useEffect(() => {
    const fetchCoupleId = async () => {
      try {
        setLoading(true);
        const couple = await coupleApi.getCouple();
        setCoupleId(couple.id);
      } catch (error) {
        setError('获取情侣关系失败: ' + error.message);
        console.error('获取情侣关系失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoupleId();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }
    
    if (!date) {
      setError('请选择日期');
      return;
    }
    
    if (!coupleId) {
      setError('未找到情侣关系，请先创建情侣关系');
      return;
    }
    
    // 合并日期和时间
    const dateTime = time 
      ? `${date}T${time}:00` 
      : `${date}T00:00:00`;
    
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      date: dateTime,
      assignee,
      priority,
      couple_id: coupleId
    };
    
    try {
      setLoading(true);
      await taskApi.createTask(newTask);
      
      // 重新获取任务列表
      const updatedTasks = await taskApi.getTasks();
      setTasks(updatedTasks);
      
      navigate('/dashboard');
    } catch (error) {
      setError('创建任务失败: ' + error.message);
      console.error('创建任务失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <h2>添加新任务</h2>
      
      {loading && <div className="loading-indicator">加载中...</div>}
      
      {!coupleId && !loading && (
        <div className="empty-state">
          <p>您还没有创建情侣关系，请先创建情侣关系</p>
          <Link to="/create-couple" className="btn">
            创建情侣关系
          </Link>
        </div>
      )}
      
      {(coupleId || loading) && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">任务标题</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">任务描述（可选）</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入任务描述"
              rows="3"
              disabled={loading}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">日期</label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">时间（可选）</label>
              <input
                type="time"
                id="time"
                className="form-control"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="assignee">负责人</label>
            <select
              id="assignee"
              className="form-control"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={loading}
            >
              <option value={user.id}>{user.username}</option>
              {partner && <option value={partner.id}>{partner.username}</option>}
              <option value="both">两人共同</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">优先级</label>
            <select
              id="priority"
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={loading}
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
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
              {loading ? '保存中...' : '保存任务'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TaskForm;