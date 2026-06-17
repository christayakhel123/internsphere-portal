import React from 'react';
import { Briefcase, Sun, Moon, LogOut, LayoutDashboard, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ user, logout, theme, toggleTheme, setView }) {
  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="navbar-logo" onClick={() => setView('landing')}>
          <div className="logo-icon-wrapper">
            <Briefcase className="logo-icon" size={24} />
          </div>
          <span className="logo-text">Intern<span className="gradient-text">Sphere</span></span>
        </div>

        <ul className="navbar-menu">
          <li className="nav-item" onClick={() => setView('landing')}>Home</li>
          <li className="nav-item" onClick={() => setView(user ? (user.role === 'employer' ? 'employer-dashboard' : 'candidate-dashboard') : 'auth')}>
            Browse Internships
          </li>
          {user && (
            <li className="nav-item" onClick={() => setView(user.role === 'employer' ? 'employer-dashboard' : 'candidate-dashboard')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <LayoutDashboard size={16} />
                Dashboard
              </span>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          <button className="theme-toggle btn-icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="user-profile-menu">
              <div className="user-info-badge">
                <User size={16} className="user-avatar-icon" />
                <span className="user-name-text">{user.name}</span>
                <span className={`role-tag ${user.role}`}>{user.role}</span>
              </div>
              <button className="btn btn-secondary logout-btn" onClick={logout}>
                <LogOut size={16} />
                <span className="hide-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-secondary" onClick={() => setView('auth')}>Sign In</button>
              <button className="btn btn-primary" onClick={() => setView('auth')}>Register</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
