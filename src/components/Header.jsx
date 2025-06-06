import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearStoredUser } from '../utils/storage';

function Header({ user, partner }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    clearStoredUser();
    navigate('/');
    window.location.reload(); // Force reload to clear state
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <h1>情侣日程小程序</h1>
        {user && (
          <div className="user-info">
            <span className="user-names">{user.name} & {partner.name}</span>
            <button onClick={handleLogout} className="btn btn-small">
              退出
            </button>
          </div>
        )}
        
        {user && (
          <button className="menu-toggle" onClick={toggleMenu}>
            <span className="material-symbols-outlined">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        )}
      </div>
      
      {user && (
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined">calendar_today</span>
            日程
          </Link>
          <Link 
            to="/add-task" 
            className={`nav-link ${isActive('/add-task') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined">add_task</span>
            添加任务
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;