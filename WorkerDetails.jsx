import React from 'react';

const WorkerDetails = ({ worker, onLogout }) => {
  if (!worker) {
    return <div>No worker data available</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#28a745';
      case 'inactive':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="worker-details">
      <div className="worker-header">
        <div className="worker-avatar">
          {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div className="worker-basic-info">
          <h2>{worker.name}</h2>
          <p className="worker-id">ID: {worker.id}</p>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(worker.status) }}
          >
            {worker.status}
          </span>
        </div>
      </div>

      <div className="worker-info-grid">
        <div className="info-card">
          <h3>Personal Information</h3>
          <div className="info-row">
            <span className="label">Full Name:</span>
            <span className="value">{worker.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Employee ID:</span>
            <span className="value">{worker.employeeId || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{worker.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Phone:</span>
            <span className="value">{worker.phone}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Work Information</h3>
          <div className="info-row">
            <span className="label">Department:</span>
            <span className="value">{worker.department}</span>
          </div>
          <div className="info-row">
            <span className="label">Designation:</span>
            <span className="value">{worker.designation}</span>
          </div>
          <div className="info-row">
            <span className="label">Join Date:</span>
            <span className="value">{formatDate(worker.joinDate)}</span>
          </div>
          <div className="info-row">
            <span className="label">Shift:</span>
            <span className="value">{worker.shift || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Supervisor:</span>
            <span className="value">{worker.supervisor || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="worker-actions">
        <button 
          onClick={onLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default WorkerDetails;