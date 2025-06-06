import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addTask } from '../utils/storage';

function TaskForm({ user, partner, tasks, setTasks }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignee, setAssignee] = useState(user.id);
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }
    
    if (!date) {
      setError('请选择日期');
      return;
    }
    
    // Combine date and time
    const dateTime = time 
      ? `${date}T${time}:00` 
      : `${date}T00:00:00`;
    
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      date: dateTime,
      assignee,
      priority,
      completed: false
    };
    
    const updatedTasks = addTask(newTask);
    setTasks(updatedTasks);
    navigate('/dashboard');
  };
  
  return (
    <div className="card">
      <h2>添加新任务</h2>
      
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
          >
            <option value={user.id}>{user.name}</option>
            <option value={partner.id}>{partner.name}</option>
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
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            取消
          </button>
          <button type="submit" className="btn">
            保存任务
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;