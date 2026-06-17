import React, { useState, useEffect } from 'react';
import { Plus, BarChart2, Briefcase, Users, FileText, CheckCircle, Clock, Trash2, Edit, X, RefreshCw, Send, Download } from 'lucide-react';
import './EmployerDashboard.css';

export default function EmployerDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('metrics');
  const [postings, setPostings] = useState([]);
  const [applicants, setApplicants] = useState([]);

  // States
  const [loadingPostings, setLoadingPostings] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Post / Edit Modal Form State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('remote');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetchPostings();
    fetchApplicants();
  }, []);

  const fetchPostings = async () => {
    setLoadingPostings(true);
    try {
      const response = await fetch('http://localhost:5000/api/internships/my-postings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPostings(data);
      }
    } catch (error) {
      console.error('Error fetching postings:', error);
    } finally {
      setLoadingPostings(false);
    }
  };

  const fetchApplicants = async () => {
    setLoadingApplicants(true);
    try {
      const response = await fetch('http://localhost:5000/api/applications/employer', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplicants(data);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('');
    setDescription('');
    setRequirements('');
    setLocation('');
    setStipend('');
    setDuration('');
    setType('remote');
    setFormError('');
    setFormSuccess(false);
    setShowJobModal(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setDescription(job.description);
    setRequirements(job.requirements);
    setLocation(job.location);
    setStipend(job.stipend);
    setDuration(job.duration);
    setType(job.type);
    setFormError('');
    setFormSuccess(false);
    setShowJobModal(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    const payload = { title, company, description, requirements, location, stipend, duration, type };
    const method = editingJob ? 'PUT' : 'POST';
    const url = editingJob 
      ? `http://localhost:5000/api/internships/${editingJob.id}`
      : 'http://localhost:5000/api/internships';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error processing listing.');
      }

      setFormSuccess(true);
      fetchPostings();
      setTimeout(() => {
        setShowJobModal(false);
        setFormSuccess(false);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? Associated candidate submissions will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/internships/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchPostings();
        fetchApplicants();
      } else {
        alert('Failed to delete posting.');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      } else {
        alert('Failed to update status.');
      }
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const totalPostings = postings.length;
  const totalApplicants = applicants.length;
  const pendingApplicants = applicants.filter(a => a.status === 'Pending').length;
  const acceptedApplicants = applicants.filter(a => a.status === 'Accepted').length;

  return (
    <div className="dashboard-container container animate-fade-in">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar card">
          <div className="sidebar-header">
            <h3>Employer Hub</h3>
            <p>Post and manage jobs</p>
          </div>
          <div className="sidebar-menu">
            <button 
              className={`sidebar-link ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              <BarChart2 size={18} />
              <span>Overview Metrics</span>
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'postings' ? 'active' : ''}`}
              onClick={() => setActiveTab('postings')}
            >
              <Briefcase size={18} />
              <span>My Listings</span>
              {totalPostings > 0 && <span className="count-badge">{totalPostings}</span>}
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'applicants' ? 'active' : ''}`}
              onClick={() => setActiveTab('applicants')}
            >
              <Users size={18} />
              <span>Review Applicants</span>
              {pendingApplicants > 0 && <span className="count-badge warning">{pendingApplicants}</span>}
            </button>
          </div>
          <button className="btn btn-primary btn-full sidebar-action-btn" onClick={handleOpenCreateModal}>
            <Plus size={16} />
            <span>Post Internship</span>
          </button>
        </aside>

        <main className="dashboard-main-content">
          {activeTab === 'metrics' && (
            <div className="tab-pane">
              <div className="workspace-header">
                <h2>Dashboard Overview</h2>
                <p>Monitor your job listings and applicant flows</p>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card card">
                  <div className="stat-icon-wrapper secondary">
                    <Briefcase size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Positions Posted</span>
                    <h3 className="stat-number">{totalPostings}</h3>
                  </div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon-wrapper primary">
                    <Users size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Applicants</span>
                    <h3 className="stat-number">{totalApplicants}</h3>
                  </div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon-wrapper warning">
                    <Clock size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Pending Reviews</span>
                    <h3 className="stat-number">{pendingApplicants}</h3>
                  </div>
                </div>
                <div className="stat-card card">
                  <div className="stat-icon-wrapper success">
                    <CheckCircle size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Candidates Selected</span>
                    <h3 className="stat-number">{acceptedApplicants}</h3>
                  </div>
                </div>
              </div>

              <div className="action-banner card" style={{ marginTop: '2rem' }}>
                <div className="banner-text">
                  <h3>Need to find fresh talent?</h3>
                  <p>Create a listing detail containing description and duration, and receive resumes directly on InternSphere.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                  <Plus size={16} />
                  <span>Create Listing</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'postings' && (
            <div className="tab-pane">
              <div className="workspace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>My Active Listings</h2>
                  <p>Edit or remove internship opportunities you created</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                  <Plus size={16} /> Add New
                </button>
              </div>

              {loadingPostings ? (
                <div className="loading-state">
                  <RefreshCw className="spinner" size={24} />
                  <p>Syncing job listings...</p>
                </div>
              ) : postings.length === 0 ? (
                <div className="empty-state card">
                  <h3>No internships created yet</h3>
                  <p>Click "Post Internship" to publish your first opportunity!</p>
                </div>
              ) : (
                <div className="postings-list-grid">
                  {postings.map(job => (
                    <div key={job.id} className="posting-row card">
                      <div className="posting-row-header">
                        <div>
                          <h3 className="posting-title">{job.title}</h3>
                          <span className="posting-meta-company">{job.company}</span>
                        </div>
                        <div className="posting-actions">
                          <button className="btn-icon-sm" onClick={() => handleOpenEditModal(job)} title="Edit Posting">
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon-sm danger" onClick={() => handleDeleteJob(job.id)} title="Delete Posting">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="posting-details-row">
                        <span className="badge badge-primary">{job.type}</span>
                        <span className="posting-loc">{job.location}</span>
                        <span className="posting-stipend">{job.stipend}</span>
                        <span className="posting-dur">{job.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applicants' && (
            <div className="tab-pane">
              <div className="workspace-header">
                <h2>Candidate Review Portal</h2>
                <p>Evaluate submissions, check cover letters, and download resumes</p>
              </div>

              {loadingApplicants ? (
                <div className="loading-state">
                  <RefreshCw className="spinner" size={24} />
                  <p>Retrieving applicant entries...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="empty-state card">
                  <h3>No applicants have applied yet</h3>
                  <p>Once students apply, their details and resume files will populate here.</p>
                </div>
              ) : (
                <div className="applicants-review-list">
                  {applicants.map(app => (
                    <div key={app.id} className="applicant-review-card card">
                      <div className="applicant-card-header">
                        <div className="candidate-info">
                          <h4>{app.candidate_name}</h4>
                          <span className="candidate-email">{app.candidate_email}</span>
                        </div>
                        <div className="status-dropdown-wrapper">
                          <label className="form-label select-lbl">Status:</label>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="status-selector-dropdown"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="applicant-card-job-section">
                        <span className="label">Applied For:</span>
                        <span className="value">{app.internship_title}</span>
                      </div>

                      <div className="cover-letter-preview">
                        <strong>Cover Letter:</strong>
                        <p>{app.cover_letter}</p>
                      </div>

                      <div className="applicant-card-actions">
                        <a href={`http://localhost:5000${app.resume_url}`} className="btn btn-secondary btn-sm resume-download-link" target="_blank" rel="noopener noreferrer">
                          <Download size={14} />
                          <span>View Resume</span>
                        </a>
                        <span className="applied-date">Submitted {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Post/Edit Job Modal */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Modify Internship Listing' : 'Publish New Internship'}</h2>
              <button className="btn-close" onClick={() => setShowJobModal(false)}>
                <X size={20} />
              </button>
            </div>

            {formSuccess ? (
              <div className="auth-success-alert" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '12px' }}>
                <span>Listing saved successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleJobSubmit} className="job-post-form">
                {formError && (
                  <div className="auth-error-alert">
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Internship Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Node.js Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. InternSphere Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Core Projects</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Provide a detailed description of projects, tasks, and mentorship paths..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Candidate Requirements</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Basic SQL familiarity, React state hooks, Git workflows."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="form-group-grid-3">
                  <div className="form-group">
                    <label className="form-label">Job Format</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="form-select"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Remote or Boston, MA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stipend / Salary</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $1,200/mo"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '50%' }}>
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6 Months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowJobModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <span>Publish Opportunity</span>
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
