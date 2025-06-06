import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import Notification from './components/Notification';
import { getStoredTasks, storeUser, getStoredUser } from './utils/storage';

function App() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser.user);
      setPartner(storedUser.partner);
    }
    
    // Load tasks from local storage
    const storedTasks = getStoredTasks();
    if (storedTasks) {
      setTasks(storedTasks);
    }
  }, []);
  
  const handleLogin = (userData, partnerData) => {
    setUser(userData);
    setPartner(partnerData);
    storeUser(userData, partnerData);
  };
  
  return (
    <div className="app-container">
      <Header user={user} partner={partner} />
      <main className="main-content">
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
            element={user ? <TaskForm user={user} partner={partner} tasks={tasks} setTasks={setTasks} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/task/:id" 
            element={user ? <TaskDetail user={user} partner={partner} tasks={tasks} setTasks={setTasks} /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;