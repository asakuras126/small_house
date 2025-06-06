import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask } from '../utils/storage';
import { formatDate, formatTime } from '../utils/dateUtils';

function TaskDetail({ user, partner, tasks, setTasks }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const foundTask = getTaskById(id);
    if (foundTask) {
      setTask(foundTask);
      
      // Initialize form fields
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
      
      // Split date and time
      const dateObj = new Date(foundTask.date);
      setDate(dateObj.toISOString().split('T')[0]);
      setTime(dateObj.toTimeString().substring(0, 5));
      
      setAssignee(foundTask.assignee);
      setPriority(foundTask.priority);
      setCompleted(foundTask.completed || false);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);
  
  const handleDelete = () => {
    if (window.confirm('确定要删除这个任务吗？')) {
      const updatedTasks = deleteTask(id);
      setTasks(updatedTasks);
      navigate('/dashboard');
    }
  };
  
  const handleToggleComplete = () => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    
    if (!isEditing) {
      const updatedTasks = updateTask(id, { completed: newCompletedState });
      setTasks(updatedTasks);
    }
  };
  
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
    
    const updatedTaskData = {
      title: title.trim(),
      description: description.trim(),
      date: dateTime,
      assignee,
      priority,
      completed
    };
    
    const updatedTasks = updateTask(id, updatedTaskData);
    setTasks(updatedTasks);
    setTask({ ...task, ...updatedTaskData });
    setIsEditing(false);
  };
  
  if (!task) {
    return <div>加载中...</div>;
  }
  
  return (
    <div className="card">
      {isEditing ? (
        <>
          <h2>编辑任务</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">任务标题</label>
              <input
                type="text"
                id="title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={handleToggleComplete}
                />
                标记为已完成
              </label>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                取消
              </button>
              <button type="submit" className="btn">
                保存更改
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="task-header">
            <div className="task-title-row">
              <h2 className={`task-title ${completed ? 'completed' : ''}`}>{task.title}</h2>
              <div className="task-status">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={handleToggleComplete}
                  />
                  已完成
                </label>
              </div>
            </div>
            
            <div className="task-meta">
              <div className="task-date">
                <span className="material-symbols-outlined">event</span>
                {formatDate(task.date)}
                {task.date.includes('T') && task.date.split('T')[1] !== '00:00:00' && (
                  <span className="task-time"> {formatTime(task.date)}</span>
                )}
              </div>
              
              <div className="task-assignee">
                <span className="material-symbols-outlined">person</span>
                {task.assignee === user.id 
                  ? user.name 
                  : task.assignee === partner.id 
                    ? partner.name 
                    : `${user.name} & ${partner.name}`}
              </div>
              
              <div className="task-priority">
                <span className="material-symbols-outlined">flag</span>
                {task.priority === 'high' 
                  ? '高优先级' 
                  : task.priority === 'medium' 
                    ? '中优先级' 
                    : '低优先级'}
              </div>
            </div>
          </div>
          
          {task.description && (
            <div className="task-description">
              <h3>描述</h3>
              <p>{task.description}</p>
            </div>
          )}
          
          <div className="task-actions">
            <button className="btn" onClick={() => setIsEditing(true)}>
              编辑
            </button>
            <button className="btn btn-secondary" onClick={handleDelete}>
              删除
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              返回
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskDetail;