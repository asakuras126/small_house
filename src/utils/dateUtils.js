import { format, parseISO, isToday, isTomorrow, isThisWeek, isThisMonth, addDays, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Format date to display
export const formatDate = (dateString, formatStr = 'yyyy年MM月dd日') => {
  const date = parseISO(dateString);
  return format(date, formatStr, { locale: zhCN });
};

// Format time to display
export const formatTime = (dateString, formatStr = 'HH:mm') => {
  const date = parseISO(dateString);
  return format(date, formatStr);
};

// Get relative date description
export const getRelativeDateDescription = (dateString) => {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return '今天';
  } else if (isTomorrow(date)) {
    return '明天';
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE', { locale: zhCN }); // Day of week
  } else if (isThisMonth(date)) {
    return format(date, 'M月d日', { locale: zhCN });
  } else {
    return format(date, 'yyyy年M月d日', { locale: zhCN });
  }
};

// Group tasks by date
export const groupTasksByDate = (tasks) => {
  const grouped = {};
  
  tasks.forEach(task => {
    const dateKey = task.date.split('T')[0]; // Get YYYY-MM-DD part
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(task);
  });
  
  // Sort tasks within each date group by time
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  });
  
  return grouped;
};

// Filter tasks by time period
export const filterTasksByPeriod = (tasks, period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (period) {
    case 'today':
      return tasks.filter(task => isToday(parseISO(task.date)));
    
    case 'tomorrow':
      return tasks.filter(task => isTomorrow(parseISO(task.date)));
    
    case 'week':
      return tasks.filter(task => {
        const taskDate = parseISO(task.date);
        return isThisWeek(taskDate) && !isToday(taskDate) && !isTomorrow(taskDate);
      });
    
    case 'future':
      const nextWeek = addDays(today, 7);
      return tasks.filter(task => {
        const taskDate = parseISO(task.date);
        return !isBefore(taskDate, nextWeek);
      });
    
    case 'all':
    default:
      return tasks.filter(task => !isBefore(parseISO(task.date), today));
  }
};

// Check if a task is overdue
export const isTaskOverdue = (task) => {
  const now = new Date();
  const taskDate = parseISO(task.date);
  return isBefore(taskDate, now);
};