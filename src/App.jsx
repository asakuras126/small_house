import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import CoupleForm from './components/CoupleForm';
import Notification from './components/Notification';
import { userApi, coupleApi, taskApi } from './utils/api';

function App() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      try {
        // 尝试获取当前用户信息
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        
        try {
          // 尝试获取伴侣信息
          const partnerData = await coupleApi.getPartner();
          setPartner(partnerData);
          
          // 获取任务列表
          const tasksData = await taskApi.getTasks();
          setTasks(tasksData);
        } catch (error) {
          // 没有伴侣关系，或获取任务失败
          console.error("获取伴侣或任务失败:", error);
        }
      } catch (error) {
        // 未登录或令牌无效
        console.error("身份验证失败:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = (userData, partnerData) => {
    setUser(userData);
    setPartner(partnerData);
    
    // 如果有伴侣关系，获取任务列表
    if (partnerData) {
      taskApi.getTasks()
        .then(tasksData => setTasks(tasksData))
        .catch(error => console.error("获取任务失败:", error));
    }
  };
  
  const handleLogout = () => {
    userApi.logout();
    setUser(null);
    setPartner(null);
    setTasks([]);
  };
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  return (
    <div className="app-container">
      <Header user={user} partner={partner} onLogout={handleLogout} />
      <main className="main-content">
        {error && <div className="error-message">{error}</div>}
        {user && <Notification tasks={tasks} user={user} partner={partner} />}
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} partner={partner} tasks={tasks} setTasks={setTasks} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/add-task" 
            element={user ? <TaskForm user={user} partner={partner} setTasks={setTasks} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/task/:id" 
            element={user ? <TaskDetail user={user} partner={partner} setTasks={setTasks} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/create-couple" 
            element={user ? <CoupleForm user={user} setPartner={setPartner} /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;