import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, getRelativeDateDescription, groupTasksByDate, filterTasksByPeriod } from '../utils/dateUtils';
import { deleteTask, storeTasks } from '../utils/storage';
import Calendar from './Calendar';
import { format, parseISO, isSameDay } from 'date-fns';

function Dashboard({ user, partner, tasks, setTasks }) {
  const [filter, setFilter] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  useEffect(() => {
    // Apply filter
    const filtered = filterTasksByPeriod(tasks, filter);
    setFilteredTasks(filtered);
    
    // Group by date
    const grouped = groupTasksByDate(filtered);
    setGroupedTasks(grouped);
  }, [tasks, filter]);
  
  const handleDeleteTask = (taskId) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      const updatedTasks = deleteTask(taskId);
      setTasks(updatedTasks);
    }
  };
  
  const handleCompleteTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    storeTasks(updatedTasks);
  };
  
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setFilter('all'); // Reset filter when selecting a date
    
    // Filter tasks for the selected date
    const dateString = format(date, 'yyyy-MM-dd');
    const tasksOnDate = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isSameDay(taskDate, date);
    });
    
    setFilteredTasks(tasksOnDate);
    setGroupedTasks({ [dateString]: tasksOnDate });
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
                      onChange={() => handleCompleteTask(task.id)}
                    />
                  </div>
                  <div className="task-content">
                    <Link to={`/task/${task.id}`} className="task-title">
                      {task.title}
                    </Link>
                    <div className="task-meta">
                      <span className="task-time">{formatTime(task.date)}</span>
                      <span className="task-assignee">
                        {task.assignee === user.id ? user.name : 
                         task.assignee === partner.id ? partner.name : 
                         `${user.name} & ${partner.name}`}
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
                            onChange={() => handleCompleteTask(task.id)}
                          />
                        </div>
                        <div className="task-content">
                          <Link to={`/task/${task.id}`} className="task-title">
                            {task.title}
                          </Link>
                          <div className="task-meta">
                            <span className="task-time">{formatTime(task.date)}</span>
                            <span className="task-assignee">
                              {task.assignee === user.id ? user.name : 
                               task.assignee === partner.id ? partner.name : 
                               `${user.name} & ${partner.name}`}
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