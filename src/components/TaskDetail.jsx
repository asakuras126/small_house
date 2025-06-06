import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../utils/api';
import { formatDate, formatTime } from '../utils/dateUtils';

function TaskDetail({ user, partner, setTasks }) {
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
  const [loading, setLoading] = useState(true);
  
  // 获取任务详情
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskData = await taskApi.getTask(id);
        setTask(taskData);
        
        // 初始化表单字段
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        
        // 分割日期和时间
        const dateObj = new Date(taskData.date);
        setDate(dateObj.toISOString().split('T')[0]);
        setTime(dateObj.toTimeString().substring(0, 5));
        
        setAssignee(taskData.assignee);
        setPriority(taskData.priority);
        setCompleted(taskData.completed || false);
      } catch (error) {
        setError('获取任务失败: ' + error.message);
        console.error('获取任务失败:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id, navigate]);
  
  // 删除任务
  const handleDelete = async () => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        setLoading(true);
        await taskApi.deleteTask(id);
        
        // 重新获取任务列表
        const updatedTasks = await taskApi.getTasks();
        setTasks(updatedTasks);
        
        navigate('/dashboard');
      } catch (error) {
        setError('删除任务失败: ' + error.message);
        console.error('删除任务失败:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 切换完成状态
  const handleToggleComplete = async () => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    
    if (!isEditing) {
      try {
        setLoading(true);
        await taskApi.updateTask(id, { completed: newCompletedState });
        
        // 更新本地任务状态
        setTask({ ...task, completed: newCompletedState });
        
        // 重新获取任务列表
        const updatedTasks = await taskApi.getTasks();
        setTasks(updatedTasks);
      } catch (error) {
        setError('更新任务状态失败: ' + error.message);
        console.error('更新任务状态失败:', error);
        // 恢复原状态
        setCompleted(!newCompletedState);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 提交表单
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
    
    // 合并日期和时间
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
    
    try {
      setLoading(true);
      await taskApi.updateTask(id, updatedTaskData);
      
      // 更新本地任务状态
      setTask({ ...task, ...updatedTaskData });
      
      // 重新获取任务列表
      const updatedTasks = await taskApi.getTasks();
      setTasks(updatedTasks);
      
      setIsEditing(false);
    } catch (error) {
      setError('更新任务失败: ' + error.message);
      console.error('更新任务失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !task) {
    return <div className="loading-indicator">加载中...</div>;
  }
  
  if (!task) {
    return <div className="error-message">任务不存在或无法加载</div>;
  }
  
  return (
    <div className="card">
      {loading && <div className="loading-indicator">加载中...</div>}
      {error && <div className="error-message">{error}</div>}
      
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
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={handleToggleComplete}
                  disabled={loading}
                />
                标记为已完成
              </label>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                取消
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? '保存中...' : '保存更改'}
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
                    disabled={loading}
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
                  ? user.username 
                  : partner && task.assignee === partner.id 
                    ? partner.username 
                    : "双方"}
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
            <button 
              className="btn" 
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              编辑
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleDelete}
              disabled={loading}
            >
              删除
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              返回
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskDetail;