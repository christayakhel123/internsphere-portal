import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Calendar, FileText, Send, CheckCircle2, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import './CandidateDashboard.css';

export default function CandidateDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');

  // Selected Internship for Details / Apply Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // States
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, [search, type, location]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchMyApplications();
    }
  }, [activeTab]);

  const fetchInternships = async () => {
    setLoadingJobs(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (type) queryParams.append('type', type);
      if (location) queryParams.append('location', location);

      const response = await fetch(`http://localhost:5000/api/internships?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInternships(data);
      }
    } catch (error) {
      console.error('Error loading internships:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchMyApplications = async () => {
    setLoadingApps(true);
    try {
      const response = await fetch('http://localhost:5000/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMyApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setSubmitError('Please upload a resume file (PDF, JPG, PNG, DOCX)');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    const formData = new FormData();
    formData.append('internship_id', selectedJob.id);
    formData.append('cover_letter', coverLetter);
    formData.append('resume', resumeFile);

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application.');
      }

      setSubmitSuccess(true);
      setCoverLetter('');
      setResumeFile(null);
      fetchMyApplications();
      
      setTimeout(() => {
        setSelectedJob(null);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Reviewing': return 'badge-primary';
      case 'Interviewing': return 'badge-secondary';
      case 'Accepted': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="dashboard-container container animate-fade-in">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar card">
          <div className="sidebar-header">
            <h3>Candidate Hub</h3>
            <p>Manage your applications</p>
          </div>
          <div className="sidebar-menu">
            <button 
              className={`sidebar-link ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              <Search size={18} />
              <span>Explore Internships</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={18} />
              <span>My Applications</span>
              {myApplications.length > 0 && (
                <span className="count-badge">{myApplications.length}</span>
              )}
            </button>
          </div>
        </aside>

        <main className="dashboard-main-content">
          {activeTab === 'browse' ? (
            <div className="tab-pane">
              <div className="workspace-header">
                <h2>Find Internships</h2>
                <p>Browse through fresh opportunities tailored for you</p>
              </div>

              {/* Filters */}
              <div className="filters-bar card">
                <div className="filter-input-wrapper">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search titles, skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="filter-search-input"
                  />
                </div>
                <div className="filter-select-wrapper">
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Formats</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div className="filter-input-wrapper">
                  <MapPin size={16} />
                  <input
                    type="text"
                    placeholder="Location filter..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="filter-search-input"
                  />
                </div>
              </div>

              {/* Jobs List */}
              {loadingJobs ? (
                <div className="loading-state">
                  <RefreshCw className="spinner" size={24} />
                  <p>Searching for listings...</p>
                </div>
              ) : internships.length === 0 ? (
                <div className="empty-state card">
                  <h3>No internships match your filter</h3>
                  <p>Try clearing some criteria or typing a different keyword.</p>
                </div>
              ) : (
                <div className="jobs-list-grid">
                  {internships.map((job) => (
                    <div key={job.id} className="job-row card">
                      <div className="job-row-main">
                        <div className="job-row-title-company">
                          <h3 className="job-row-title">{job.title}</h3>
                          <span className="job-row-company">{job.company}</span>
                        </div>
                        <div className="job-row-badges">
                          <span className="badge badge-primary">{job.type}</span>
                          <span className="badge badge-secondary">{job.duration}</span>
                        </div>
                      </div>
                      <p className="job-row-desc">{job.description.slice(0, 160)}...</p>
                      <div className="job-row-footer">
                        <div className="job-row-meta">
                          <span><MapPin size={14} /> {job.location}</span>
                          <span><DollarSign size={14} /> {job.stipend}</span>
                        </div>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedJob(job);
                            setSubmitError('');
                            setSubmitSuccess(false);
                          }}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="tab-pane">
              <div className="workspace-header">
                <h2>Application Tracker</h2>
                <p>Track the status of your submitted applications</p>
              </div>

              {loadingApps ? (
                <div className="loading-state">
                  <RefreshCw className="spinner" size={24} />
                  <p>Loading your submissions...</p>
                </div>
              ) : myApplications.length === 0 ? (
                <div className="empty-state card">
                  <h3>No applications found</h3>
                  <p>Explore internships and apply to see them tracked here.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('browse')} style={{ marginTop: '1rem' }}>
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="applications-timeline">
                  {myApplications.map((app) => (
                    <div key={app.id} className="app-timeline-card card">
                      <div className="app-timeline-header">
                        <div>
                          <h3 className="app-job-title">{app.title}</h3>
                          <p className="app-job-company">{app.company}</p>
                        </div>
                        <span className={`badge ${getStatusClass(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="app-timeline-body">
                        <div className="cover-letter-preview">
                          <strong>Cover Letter:</strong>
                          <p>{app.cover_letter}</p>
                        </div>
                        <div className="app-resume-link">
                          <FileText size={16} />
                          <a href={`http://localhost:5000${app.resume_url}`} target="_blank" rel="noopener noreferrer">
                            Download Uploaded Resume
                          </a>
                        </div>
                      </div>

                      <div className="app-timeline-footer">
                        <span className="app-date">Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                        <div className="progress-timeline">
                          <div className={`step ${app.status !== 'Rejected' ? 'active' : ''}`}>Applied</div>
                          <div className={`step ${['Reviewing', 'Interviewing', 'Accepted'].includes(app.status) ? 'active' : ''}`}>Reviewing</div>
                          <div className={`step ${['Interviewing', 'Accepted'].includes(app.status) ? 'active' : ''}`}>Interview</div>
                          <div className={`step ${app.status === 'Accepted' ? 'hired' : app.status === 'Rejected' ? 'rejected' : ''}`}>
                            {app.status === 'Rejected' ? 'Rejected' : 'Decision'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Application / Details Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {selectedJob.title}</h2>
              <button className="btn-close" onClick={() => setSelectedJob(null)}>×</button>
            </div>
            
            <div className="modal-body-details">
              <div className="job-details-group">
                <span className="detail-tag">{selectedJob.company}</span>
                <span className="detail-tag">{selectedJob.location}</span>
                <span className="detail-tag">{selectedJob.type}</span>
                <span className="detail-tag">{selectedJob.stipend}</span>
              </div>
              <div className="job-desc-section">
                <h4>Description</h4>
                <p>{selectedJob.description}</p>
              </div>
              <div className="job-desc-section">
                <h4>Requirements</h4>
                <p>{selectedJob.requirements}</p>
              </div>
            </div>

            {submitSuccess ? (
              <div className="auth-success-alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '12px' }}>
                <CheckCircle2 size={20} />
                <span>Application submitted successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="application-form">
                {submitError && (
                  <div className="auth-error-alert" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={18} />
                    <span>{submitError}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Cover Letter</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Tell the employer why you are a great fit..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Resume / CV (PDF, DOCX, PNG, JPG)</label>
                  <div className="file-upload-dropzone">
                    <Upload size={24} className="upload-icon" />
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="file-input-hidden"
                      id="resume-file-input"
                    />
                    <label htmlFor="resume-file-input" className="file-upload-label">
                      {resumeFile ? `Selected: ${resumeFile.name}` : 'Click to select or drag resume file'}
                    </label>
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
