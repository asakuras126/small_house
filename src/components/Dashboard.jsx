import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, getRelativeDateDescription, groupTasksByDate, filterTasksByPeriod } from '../utils/dateUtils';
import { taskApi } from '../utils/api';
import Calendar from './Calendar';
import { format, parseISO, isSameDay } from 'date-fns';

function Dashboard({ user, partner, tasks, setTasks }) {
  const [filter, setFilter] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 加载任务
  const loadTasks = async (period = filter) => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskApi.getTasks(period);
      setTasks(tasksData);
    } catch (error) {
      setError('加载任务失败: ' + error.message);
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // 当过滤器改变时，从API加载任务
    loadTasks(filter);
  }, [filter]);
  
  useEffect(() => {
    // 当任务列表改变时，应用过滤和分组
    // 注意：由于我们现在直接从API获取已过滤的任务，这个逻辑可能需要调整
    setFilteredTasks(tasks);
    
    // 分组任务
    const grouped = groupTasksByDate(tasks);
    setGroupedTasks(grouped);
  }, [tasks]);
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        setLoading(true);
        await taskApi.deleteTask(taskId);
        // 重新加载任务列表
        await loadTasks();
      } catch (error) {
        setError('删除任务失败: ' + error.message);
        console.error('删除任务失败:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleCompleteTask = async (taskId, currentStatus) => {
    try {
      setLoading(true);
      await taskApi.updateTask(taskId, { completed: !currentStatus });
      // 重新加载任务列表
      await loadTasks();
    } catch (error) {
      setError('更新任务状态失败: ' + error.message);
      console.error('更新任务状态失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectDate = async (date) => {
    setSelectedDate(date);
    
    try {
      setLoading(true);
      // 格式化日期为ISO字符串
      const dateString = format(date, 'yyyy-MM-dd');
      
      // 从API获取特定日期的任务
      // 注意：这里假设API支持按日期过滤，实际实现可能需要调整
      const tasksData = await taskApi.getTasks('all');
      
      // 手动过滤出选定日期的任务
      const tasksOnDate = tasksData.filter(task => {
        const taskDate = new Date(task.date);
        return isSameDay(taskDate, date);
      });
      
      setFilteredTasks(tasksOnDate);
      setGroupedTasks({ [dateString]: tasksOnDate });
    } catch (error) {
      setError('加载任务失败: ' + error.message);
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="dashboard-header">
        <h2>日程安排</h2>
        <div className="dashboard-actions">
          <div className="view-toggle">
            <button 
              className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
            >
              <span className="material-symbols-outlined">view_list</span>
            </button>
            <button 
              className={`btn-icon ${viewMode === 'calendar' ? 'active' : ''}`} 
              onClick={() => setViewMode('calendar')}
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
          </div>
          <Link to="/add-task" className="btn">
            添加新任务
          </Link>
        </div>
      </div>
      
      {loading && <div className="loading-indicator">加载中...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!partner && !loading && (
        <div className="empty-state">
          <p>您还没有创建情侣关系，请先创建情侣关系</p>
          <Link to="/create-couple" className="btn">
            创建情侣关系
          </Link>
        </div>
      )}
      
      {viewMode === 'calendar' ? (
        <div className="calendar-view">
          <Calendar tasks={tasks} onSelectDate={handleSelectDate} />
          
          <h3 className="selected-date-header">
            {format(selectedDate, 'yyyy年MM月dd日')}的任务
          </h3>
          
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>这一天没有任务</p>
              <Link to="/add-task" className="btn">
                添加新任务
              </Link>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <div className="task-checkbox">
                    <input 
                      type="checkbox" 
                      checked={task.completed || false}
                      onChange={() => handleCompleteTask(task.id, task.completed)}
                      disabled={loading}
                    />
                  </div>
                  <div className="task-content">
                    <Link to={`/task/${task.id}`} className="task-title">
                      {task.title}
                    </Link>
                    <div className="task-meta">
                      <span className="task-time">{formatTime(task.date)}</span>
                      <span className="task-assignee">
                        {task.assignee === user.id ? user.username : 
                         partner && task.assignee === partner.id ? partner.username : 
                         "双方"}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <Link to={`/task/${task.id}`} className="icon-btn">
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <button 
                      className="icon-btn delete"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="tab-container">
            <div 
              className={`tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </div>
            <div 
              className={`tab ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              今天
            </div>
            <div 
              className={`tab ${filter === 'tomorrow' ? 'active' : ''}`}
              onClick={() => setFilter('tomorrow')}
            >
              明天
            </div>
            <div 
              className={`tab ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              本周
            </div>
            <div 
              className={`tab ${filter === 'future' ? 'active' : ''}`}
              onClick={() => setFilter('future')}
            >
              未来
            </div>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>没有找到任务</p>
              <Link to="/add-task" className="btn">
                添加新任务
              </Link>
            </div>
          ) : (
            <div className="task-groups">
              {Object.keys(groupedTasks).sort().map(dateKey => (
                <div key={dateKey} className="task-group">
                  <h3 className="date-header">
                    {getRelativeDateDescription(dateKey)}
                  </h3>
                  <div className="task-list">
                    {groupedTasks[dateKey].map(task => (
                      <div 
                        key={task.id} 
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                      >
                        <div className="task-checkbox">
                          <input 
                            type="checkbox" 
                            checked={task.completed || false}
                            onChange={() => handleCompleteTask(task.id, task.completed)}
                            disabled={loading}
                          />
                        </div>
                        <div className="task-content">
                          <Link to={`/task/${task.id}`} className="task-title">
                            {task.title}
                          </Link>
                          <div className="task-meta">
                            <span className="task-time">{formatTime(task.date)}</span>
                            <span className="task-assignee">
                              {task.assignee === user.id ? user.username : 
                               partner && task.assignee === partner.id ? partner.username : 
                               "双方"}
                            </span>
                          </div>
                        </div>
                        <div className="task-actions">
                          <Link to={`/task/${task.id}`} className="icon-btn">
                            <span className="material-symbols-outlined">edit</span>
                          </Link>
                          <button 
                            className="icon-btn delete"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={loading}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;