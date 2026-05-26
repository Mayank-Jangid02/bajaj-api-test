import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Clock, 
  CheckSquare, 
  User, 
  Calendar, 
  ChevronRight, 
  Undo2, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { calculateSlaStatus } from '../utils/sla';

const STATUS_RANKS = {
  open: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3
};

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

export default function TicketDetailDrawer({ ticket, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(ticket.subject);
  const [description, setDescription] = useState(ticket.description);
  const [priority, setPriority] = useState(ticket.priority);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [, setTick] = useState(0);

  // Field-specific validation errors for edit mode
  const [subjectError, setSubjectError] = useState('');
  const [descError, setDescError] = useState('');

  // Force re-renders for ticking live countdowns inside details drawer
  useEffect(() => {
    if (ticket.resolvedAt) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [ticket.resolvedAt]);

  if (!ticket) return null;

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubjectError('');
    setDescError('');

    let hasError = false;
    if (!subject.trim()) {
      setSubjectError('Subject is required.');
      hasError = true;
    }
    if (!description.trim()) {
      setDescError('Description is required.');
      hasError = true;
    }

    if (hasError) return;

    try {
      await onUpdate(ticket._id, { subject, description, priority });
      setIsEditing(false);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update ticket details.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdate(ticket._id, { status: newStatus });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to transition ticket status.');
    }
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(ticket._id);
    } else {
      setConfirmDelete(true);
      // Auto-reset delete confirmation after 4 seconds if not double-clicked
      setTimeout(() => setConfirmDelete(false), 4000);
    }
  };

  const sla = calculateSlaStatus(ticket.createdAt, ticket.resolvedAt, priority);

  // Status boundary transition logic
  const currentRank = STATUS_RANKS[ticket.status];
  
  const canMoveBackward = currentRank > 0;
  const prevStatus = canMoveBackward ? STATUS_ORDER[currentRank - 1] : null;

  const canMoveForward = currentRank < 3;
  const nextStatus = canMoveForward ? STATUS_ORDER[currentRank + 1] : null;

  const getStatusDisplay = (st) => {
    const displays = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return displays[st] || st;
  };

  return (
    <div className="detail-drawer-overlay" onClick={onClose}>
      <div className="detail-drawer-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-title">
            <Sparkles size={16} className="sparkle-accent" />
            <span>Ticket Details</span>
            <span className="ticket-id-tag">#{ticket._id.slice(-6)}</span>
          </div>
          <button className="close-drawer-btn" onClick={onClose} aria-label="Close details panel">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="drawer-body">
          {errorMsg && <div className="drawer-error-alert">{errorMsg}</div>}

          {/* SLA Hero Status Card */}
          {sla && (
            <div className={`sla-hero-card ${sla.isBreached && !ticket.resolvedAt ? 'breached' : 'active'} ${sla.isResolved ? 'resolved' : ''}`}>
              <div className="sla-hero-icon">
                {sla.isResolved ? <CheckSquare size={20} /> : <Clock size={20} className={sla.isBreached ? 'shake-animation' : ''} />}
              </div>
              <div className="sla-hero-text">
                <h4>{sla.text}</h4>
                <p>{sla.isResolved ? 'SLA complete' : `SLA threshold: ${sla.limitMinutes / 60} hours (${priority} priority)`}</p>
              </div>
            </div>
          )}

          {/* Strict Status Progression Timeline */}
          <div className="status-progression-timeline">
            <h5>Status Path</h5>
            <div className="timeline-steps">
              {STATUS_ORDER.map((step, idx) => {
                const isCurrent = step === ticket.status;
                const isPast = STATUS_RANKS[step] < currentRank;
                return (
                  <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span className={`timeline-node ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}>
                      <span className="node-dot"></span>
                      <span>{getStatusDisplay(step)}</span>
                    </span>
                    {idx < 3 && <ChevronRight size={14} className="timeline-arrow" />}
                  </span>
                );
              })}
            </div>

            {/* Boundary transition controllers */}
            <div className="timeline-controls">
              {canMoveBackward && (
                <button
                  onClick={() => handleStatusChange(prevStatus)}
                  className="transition-btn revert"
                  title={`Revert back to ${getStatusDisplay(prevStatus)}`}
                >
                  <Undo2 size={14} />
                  <span>Revert to {getStatusDisplay(prevStatus)}</span>
                </button>
              )}

              {canMoveForward && (
                <button
                  onClick={() => handleStatusChange(nextStatus)}
                  className="transition-btn advance"
                  title={`Advance to ${getStatusDisplay(nextStatus)}`}
                >
                  <span>Move to {getStatusDisplay(nextStatus)}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
            
            <p className="status-flow-footnote">
              * The triage system restricts state changes to exactly 1 adjacent step forward or backward.
            </p>
          </div>

          {/* Editable Ticket Details Section */}
          <div className="details-section">
            <div className="section-title-bar">
              <h5>Ticket Overview</h5>
              {!isEditing && (
                <button className="edit-action-btn" onClick={() => setIsEditing(true)}>
                  Edit Description
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveDetails} className="edit-details-form" noValidate>
                <div className="form-group">
                  <label htmlFor="edit-subject">Subject</label>
                  <input
                    type="text"
                    id="edit-subject"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (subjectError) setSubjectError('');
                    }}
                    className={subjectError ? 'input-error' : ''}
                    required
                  />
                  {subjectError && (
                    <span className="inline-error-text">
                      <AlertCircle size={12} />
                      <span>{subjectError}</span>
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (descError) setDescError('');
                    }}
                    className={descError ? 'input-error' : ''}
                    rows={5}
                    required
                  />
                  {descError && (
                    <span className="inline-error-text">
                      <AlertCircle size={12} />
                      <span>{descError}</span>
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-priority">Priority</label>
                  <select
                    id="edit-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low (72h SLA)</option>
                    <option value="medium">Medium (24h SLA)</option>
                    <option value="high">High (4h SLA)</option>
                    <option value="urgent">Urgent (1h SLA)</option>
                  </select>
                </div>

                <div className="edit-form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => {
                      setIsEditing(false);
                      setSubject(ticket.subject);
                      setDescription(ticket.description);
                      setPriority(ticket.priority);
                      setSubjectError('');
                      setDescError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="read-only-details">
                <div className="detail-row">
                  <span className="detail-label">Subject</span>
                  <p className="detail-val-subject">{ticket.subject}</p>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description</span>
                  <p className="detail-val-desc">{ticket.description}</p>
                </div>
                <div className="detail-row flex-row">
                  <div>
                    <span className="detail-label">Priority</span>
                    <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
                  </div>
                  <div>
                    <span className="detail-label">Current Status</span>
                    <span className={`status-badge status-${ticket.status}`}>{getStatusDisplay(ticket.status)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer & Timestamp info */}
          <div className="meta-info-card">
            <h5>Customer & Logging Metadata</h5>
            <div className="meta-item">
              <User size={14} className="meta-icon" />
              <div>
                <span className="meta-label">Customer Email</span>
                <span className="meta-value">{ticket.customerEmail}</span>
              </div>
            </div>
            <div className="meta-item">
              <Calendar size={14} className="meta-icon" />
              <div>
                <span className="meta-label">Created At</span>
                <span className="meta-value">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
            </div>
            {ticket.resolvedAt && (
              <div className="meta-item">
                <CheckSquare size={14} className="meta-icon resolved" />
                <div>
                  <span className="meta-label">Resolved At</span>
                  <span className="meta-value resolved">{new Date(ticket.resolvedAt).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone: Delete Ticket */}
          <div className="danger-zone-section">
            <h5>Danger Zone</h5>
            <p>Once a ticket is deleted, its logs are permanently purged from the triage database.</p>
            <button
              onClick={handleDeleteClick}
              className={`delete-btn ${confirmDelete ? 'confirming' : ''}`}
              title="Permanently remove this support ticket"
            >
              <Trash2 size={16} />
              <span>
                {confirmDelete ? 'Double-click to permanently delete!' : 'Delete Support Ticket'}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
