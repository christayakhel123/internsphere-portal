import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, ChevronRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import './Auth.css';

export default function Auth({ onAuthSuccess, setView }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('candidate'); // candidate or employer
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, role };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please check details.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in container">
      <div className="auth-box card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
          <button 
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            <UserPlus size={18} />
            <span>Register</span>
          </button>
        </div>

        <div className="auth-header-info">
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Join InternSphere'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Access your applications, listings, and updates.' 
              : 'Create a free account to search and apply for internships.'}
          </p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="role-selector-group">
                <span className="form-label">I want to register as:</span>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${role === 'candidate' ? 'selected' : ''}`}
                    onClick={() => setRole('candidate')}
                  >
                    <User size={18} />
                    <span>Candidate</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'employer' ? 'selected' : ''}`}
                    onClick={() => setRole('employer')}
                  >
                    <Briefcase size={18} />
                    <span>Employer</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full submit-btn">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span 
              className="toggle-link"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Register here' : 'Sign In instead'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
