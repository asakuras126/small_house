import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function Calendar({ tasks, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get days with tasks
  const daysWithTasks = tasks.reduce((acc, task) => {
    const taskDate = parseISO(task.date);
    const dateString = format(taskDate, 'yyyy-MM-dd');
    
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    
    acc[dateString].push(task);
    return acc;
  }, {});
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const onDateClick = (day) => {
    setSelectedDate(day);
    if (onSelectDate) {
      onSelectDate(day);
    }
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="icon-btn">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h3>{format(currentMonth, 'yyyy年MM月', { locale: zhCN })}</h3>
        <button onClick={nextMonth} className="icon-btn">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      
      <div className="calendar-weekdays">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {Array(monthStart.getDay()).fill(null).map((_, index) => (
          <div key={`empty-start-${index}`} className="calendar-day empty"></div>
        ))}
        
        {monthDays.map(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          const hasTask = daysWithTasks[dateString] && daysWithTasks[dateString].length > 0;
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={`calendar-day ${!isSameMonth(day, currentMonth) ? 'disabled' : ''} 
                ${hasTask ? 'has-task' : ''} 
                ${isSelected ? 'selected' : ''} 
                ${isDayToday ? 'today' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {hasTask && <span className="task-dot"></span>}
            </div>
          );
        })}
        
        {Array((6 * 7) - monthDays.length - monthStart.getDay())
          .fill(null)
          .map((_, index) => (
            <div key={`empty-end-${index}`} className="calendar-day empty"></div>
          ))
        }
      </div>
    </div>
  );
}

export default Calendar;