import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import CandidateDashboard from './components/CandidateDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [appLoading, setAppLoading] = useState(!!token);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setUser(null);
      setAppLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.role === 'employer') {
          setView('employer-dashboard');
        } else {
          setView('candidate-dashboard');
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      logout();
    } finally {
      setAppLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newUser.role === 'employer') {
      setView('employer-dashboard');
    } else {
      setView('candidate-dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setView('landing');
  };

  const renderView = () => {
    if (appLoading) {
      return (
        <div className="app-loader container">
          <div className="spinner"></div>
          <p>Restoring session...</p>
        </div>
      );
    }

    switch (view) {
      case 'landing':
        return <LandingPage setView={setView} user={user} />;
      case 'auth':
        return <Auth onAuthSuccess={handleAuthSuccess} setView={setView} />;
      case 'candidate-dashboard':
        return user ? <CandidateDashboard token={token} /> : <Auth onAuthSuccess={handleAuthSuccess} setView={setView} />;
      case 'employer-dashboard':
        return user ? <EmployerDashboard token={token} /> : <Auth onAuthSuccess={handleAuthSuccess} setView={setView} />;
      default:
        return <LandingPage setView={setView} user={user} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar 
        user={user} 
        logout={logout} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        setView={setView} 
      />
      
      <div className="main-content-layout">
        {renderView()}
      </div>

      <footer className="app-footer">
        <div className="container footer-content">
          <p>&copy; {new Date().getFullYear()} InternSphere. All rights reserved.</p>
          <div className="footer-links">
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Support Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
