import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parseISO, differenceInDays, differenceInHours, isToday, isTomorrow } from 'date-fns';
import { formatTime } from '../utils/dateUtils';

function Notification({ tasks, user, partner }) {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Filter tasks for upcoming notifications
    const now = new Date();
    const upcomingTasks = tasks.filter(task => {
      if (task.completed) return false;
      
      const taskDate = parseISO(task.date);
      const daysDiff = differenceInDays(taskDate, now);
      const hoursDiff = differenceInHours(taskDate, now);
      
      // Show notifications for:
      // 1. Tasks today
      // 2. Tasks tomorrow
      // 3. Tasks within 3 days
      return (isToday(taskDate) || isTomorrow(taskDate) || (daysDiff > 0 && daysDiff <= 3));
    });
    
    // Sort by date (closest first)
    upcomingTasks.sort((a, b) => parseISO(a.date) - parseISO(b.date));
    
    // Limit to 3 notifications
    setNotifications(upcomingTasks.slice(0, 3));
  }, [tasks]);
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notifications-container">
      <h3 className="notifications-title">
        <span className="material-symbols-outlined">notifications</span>
        即将到来的任务
      </h3>
      
      <div className="notifications-list">
        {notifications.map(task => {
          const taskDate = parseISO(task.date);
          const daysDiff = differenceInDays(taskDate, new Date());
          
          let timeText = '';
          if (isToday(taskDate)) {
            timeText = `今天 ${formatTime(task.date)}`;
          } else if (isTomorrow(taskDate)) {
            timeText = `明天 ${formatTime(task.date)}`;
          } else {
            timeText = `${daysDiff}天后`;
          }
          
          const assigneeName = task.assignee === user.id 
            ? user.name 
            : task.assignee === partner.id 
              ? partner.name 
              : `${user.name} & ${partner.name}`;
          
          return (
            <div key={task.id} className="notification-item">
              <div className="notification-content">
                <Link to={`/task/${task.id}`} className="notification-title">
                  {task.title}
                </Link>
                <div className="notification-meta">
                  <span className="notification-time">{timeText}</span>
                  <span className="notification-assignee">{assigneeName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Notification;