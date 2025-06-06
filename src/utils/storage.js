// Local storage keys
const USER_KEY = 'couple_scheduler_user';
const TASKS_KEY = 'couple_scheduler_tasks';

// User storage functions
export const storeUser = (user, partner) => {
  localStorage.setItem(USER_KEY, JSON.stringify({ user, partner }));
};

export const getStoredUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Task storage functions
export const storeTasks = (tasks) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getStoredTasks = () => {
  const tasksData = localStorage.getItem(TASKS_KEY);
  return tasksData ? JSON.parse(tasksData) : [];
};

export const addTask = (task) => {
  const tasks = getStoredTasks();
  const newTask = {
    ...task,
    id: Date.now().toString(), // Simple unique ID
    createdAt: new Date().toISOString()
  };
  
  const updatedTasks = [...tasks, newTask];
  storeTasks(updatedTasks);
  return updatedTasks;
};

export const updateTask = (taskId, updatedData) => {
  const tasks = getStoredTasks();
  const updatedTasks = tasks.map(task => 
    task.id === taskId ? { ...task, ...updatedData, updatedAt: new Date().toISOString() } : task
  );
  
  storeTasks(updatedTasks);
  return updatedTasks;
};

export const deleteTask = (taskId) => {
  const tasks = getStoredTasks();
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  
  storeTasks(updatedTasks);
  return updatedTasks;
};

export const getTaskById = (taskId) => {
  const tasks = getStoredTasks();
  return tasks.find(task => task.id === taskId) || null;
};