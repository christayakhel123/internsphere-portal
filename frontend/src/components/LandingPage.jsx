import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Calendar, ArrowRight, Compass, ShieldCheck, Users } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ setView, user }) {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/internships');
      if (response.ok) {
        const data = await response.json();
        setInternships(data.slice(0, 6)); // Show top 6
      }
    } catch (error) {
      console.error('Failed to fetch internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (user) {
      setView(user.role === 'employer' ? 'employer-dashboard' : 'candidate-dashboard');
    } else {
      setView('auth');
    }
  };

  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-container container">
          <div className="hero-content">
            <div className="hero-tagline">
              <span className="badge badge-primary">Your Next Step Awaits</span>
            </div>
            <h1 className="hero-title">
              Find the perfect <span className="gradient-text">Internship</span> to launch your career.
            </h1>
            <p className="hero-description">
              Connect with top companies, manage your applications dynamically, and kickstart your professional journey with InternSphere.
            </p>

            <form className="hero-search-bar card" onSubmit={handleSearchSubmit}>
              <div className="search-field">
                <Search className="field-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Job title, keywords..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-divider"></div>
              <div className="search-field">
                <MapPin className="field-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Location or 'Remote'..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">
                <span>Explore</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
          <div className="hero-visual">
            <div className="glow-sphere"></div>
            <div className="glass-card-mockup animate-slide-up">
              <div className="mockup-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-item">
                  <div className="mockup-avatar" style={{ backgroundColor: 'var(--primary)' }}></div>
                  <div className="mockup-text">
                    <div className="line title" style={{ width: '80%' }}></div>
                    <div className="line sub" style={{ width: '40%' }}></div>
                  </div>
                  <span className="badge badge-success">Accepted</span>
                </div>
                <div className="mockup-item">
                  <div className="mockup-avatar" style={{ backgroundColor: 'var(--secondary)' }}></div>
                  <div className="mockup-text">
                    <div className="line title" style={{ width: '60%' }}></div>
                    <div className="line sub" style={{ width: '30%' }}></div>
                  </div>
                  <span className="badge badge-warning">Interview</span>
                </div>
                <div className="mockup-item">
                  <div className="mockup-avatar" style={{ backgroundColor: 'var(--accent)' }}></div>
                  <div className="mockup-text">
                    <div className="line title" style={{ width: '70%' }}></div>
                    <div className="line sub" style={{ width: '50%' }}></div>
                  </div>
                  <span className="badge badge-primary">Reviewing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="metrics-section container">
        <div className="metric-card card">
          <div className="metric-icon-wrapper">
            <Compass size={24} className="metric-icon primary" />
          </div>
          <h3 className="metric-number">120+</h3>
          <p className="metric-label">Active Listings</p>
        </div>
        <div className="metric-card card">
          <div className="metric-icon-wrapper">
            <Users size={24} className="metric-icon secondary" />
          </div>
          <h3 className="metric-number">4,200+</h3>
          <p className="metric-label">Applications Managed</p>
        </div>
        <div className="metric-card card">
          <div className="metric-icon-wrapper">
            <ShieldCheck size={24} className="metric-icon accent" />
          </div>
          <h3 className="metric-number">98%</h3>
          <p className="metric-label">Placement Success</p>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="recent-jobs container">
        <div className="section-header">
          <h2 className="section-title">Latest Opportunities</h2>
          <p className="section-subtitle">Hand-picked internship openings posted recently</p>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading opportunities...</div>
        ) : internships.length === 0 ? (
          <div className="empty-state card">
            <p>No listings found. Post the very first internship to get started!</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {internships.map((job) => (
              <div key={job.id} className="job-card card">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <span className="badge badge-secondary type-tag">{job.type}</span>
                </div>
                <p className="job-description">{job.description.slice(0, 120)}...</p>
                <div className="job-meta">
                  <span className="meta-item"><MapPin size={16} /> {job.location}</span>
                  <span className="meta-item"><DollarSign size={16} /> {job.stipend}</span>
                  <span className="meta-item"><Calendar size={16} /> {job.duration}</span>
                </div>
                <button 
                  onClick={() => setView(user ? (user.role === 'employer' ? 'employer-dashboard' : 'candidate-dashboard') : 'auth')}
                  className="btn btn-outline btn-full"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
