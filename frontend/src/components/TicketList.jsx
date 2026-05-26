import { Clock, Eye, Mail, CheckCircle } from 'lucide-react';
import { calculateSlaStatus } from '../utils/sla';

export default function TicketList({ tickets, onTicketClick }) {
  const getPriorityClass = (pri) => {
    switch (pri) {
      case 'urgent': return 'pri-urgent';
      case 'high': return 'pri-high';
      case 'medium': return 'pri-medium';
      case 'low': return 'pri-low';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="empty-list-view">
        <p>No support tickets match the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="ticket-list-container">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Priority</th>
            <th>Ticket Details</th>
            <th>Customer Contact</th>
            <th>Status</th>
            <th>SLA Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => {
            const sla = calculateSlaStatus(ticket.createdAt, ticket.resolvedAt, ticket.priority);
            return (
              <tr 
                key={ticket._id} 
                className={`ticket-row ${ticket.status === 'closed' ? 'row-closed' : ''} ${sla.isBreached && !ticket.resolvedAt ? 'row-breached' : ''}`}
                onClick={() => onTicketClick(ticket)}
              >
                {/* Priority */}
                <td>
                  <span className={`priority-tag ${ticket.priority} ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>

                {/* Ticket Details */}
                <td className="details-col">
                  <div className="ticket-info-group">
                    <span className="row-subject">{ticket.subject}</span>
                    <span className="row-desc">{ticket.description}</span>
                  </div>
                </td>

                {/* Customer Contact */}
                <td>
                  <div className="row-customer">
                    <Mail size={14} className="cell-icon" />
                    <span>{ticket.customerEmail}</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span className={`status-badge status-${ticket.status}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </td>

                {/* SLA Deadline */}
                <td>
                  <div className={`row-sla ${sla.isBreached ? 'breached' : 'active'} ${sla.isResolved ? 'resolved' : ''}`}>
                    {sla.isResolved ? <CheckCircle size={14} /> : <Clock size={14} />}
                    <span>{sla.text}</span>
                  </div>
                </td>

                {/* Actions */}
                <td>
                  <button 
                    className="row-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTicketClick(ticket);
                    }}
                    title="View details"
                    aria-label={`View details for ticket ${ticket.subject}`}
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
