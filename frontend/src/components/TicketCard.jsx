import { useState, useEffect } from 'react';
import { Clock, User, Calendar, CheckSquare } from 'lucide-react';
import { calculateSlaStatus } from '../utils/sla';

export default function TicketCard({ ticket, onClick, onDragStart }) {
  const { subject, description, customerEmail, priority, status, createdAt, resolvedAt } = ticket;
  const [, setTick] = useState(0);

  // Ticks every 30 seconds to force update SLA countdowns live on render
  useEffect(() => {
    if (resolvedAt) return; // SLA is locked if resolved

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [resolvedAt]);

  const sla = calculateSlaStatus(createdAt, resolvedAt, priority);

  const formatAge = (dateStr) => {
    const elapsedMs = new Date() - new Date(dateStr);
    const mins = Math.floor(elapsedMs / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getPriorityClass = (pri) => {
    switch (pri) {
      case 'urgent': return 'pri-urgent';
      case 'high': return 'pri-high';
      case 'medium': return 'pri-medium';
      case 'low': return 'pri-low';
      default: return '';
    }
  };

  return (
    <div
      className={`ticket-card ${getPriorityClass(priority)} ${sla.isBreached && !resolvedAt ? 'sla-breached' : ''}`}
      onClick={() => onClick(ticket)}
      draggable={!resolvedAt && status !== 'closed'} // Disable drag for closed/resolved to reinforce strict process flow
      onDragStart={(e) => onDragStart && onDragStart(e, ticket)}
      title="Click to view details"
    >
      <div className="card-header">
        <span className={`priority-badge ${priority}`}>{priority}</span>
        <span className="ticket-age" title={new Date(createdAt).toLocaleString()}>
          <Calendar size={12} />
          {formatAge(createdAt)}
        </span>
      </div>

      <h4 className="ticket-title">{subject}</h4>
      <p className="ticket-desc">{description}</p>

      <div className="card-footer">
        <div className="customer-info" title={customerEmail}>
          <User size={12} className="footer-icon" />
          <span className="email-text">{customerEmail}</span>
        </div>

        {/* SLA Status Widget */}
        <div className={`sla-indicator ${sla.isBreached ? 'breached' : 'active'} ${sla.isResolved ? 'resolved' : ''}`}>
          {sla.isResolved ? (
            <CheckSquare size={12} className="footer-icon" />
          ) : (
            <Clock size={12} className={`footer-icon ${sla.isBreached ? 'shake-animation' : ''}`} />
          )}
          <span className="sla-text">{sla.text}</span>
        </div>
      </div>
      
      {/* Background SLA completion percentage progress bar */}
      {!sla.isResolved && (
        <div className="sla-progress-bar-bg">
          <div 
            className={`sla-progress-bar-fill ${sla.isBreached ? 'breached' : 'active'}`}
            style={{ width: `${sla.percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
