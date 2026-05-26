import { useState } from 'react';
import TicketCard from './TicketCard';

const COLUMNS = [
  { id: 'open', title: 'Open', color: 'status-open' },
  { id: 'in_progress', title: 'In Progress', color: 'status-progress' },
  { id: 'resolved', title: 'Resolved', color: 'status-resolved' },
  { id: 'closed', title: 'Closed', color: 'status-closed' }
];

const STATUS_RANKS = {
  open: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3
};

export default function KanbanBoard({ tickets, onTicketClick, onStatusChange }) {
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [activeOverColumn, setActiveOverColumn] = useState(null);

  const handleDragStart = (e, ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.setData('text/plain', ticket._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
    setActiveOverColumn(null);
  };

  // Helper to determine if a transition is valid (exactly 1 step forward or backward)
  const isValidTransition = (fromStatus, toStatus) => {
    const currentRank = STATUS_RANKS[fromStatus];
    const newRank = STATUS_RANKS[toStatus];
    return Math.abs(newRank - currentRank) === 1;
  };

  const handleDragOver = (e, columnId) => {
    if (!draggedTicket) return;

    // Check strict transition limit
    if (isValidTransition(draggedTicket.status, columnId)) {
      e.preventDefault(); // Allows dropping
      if (activeOverColumn !== columnId) {
        setActiveOverColumn(columnId);
      }
    }
  };

  const handleDragLeave = () => {
    setActiveOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (!draggedTicket) return;

    if (isValidTransition(draggedTicket.status, columnId)) {
      onStatusChange(draggedTicket._id, columnId);
    }
    setDraggedTicket(null);
    setActiveOverColumn(null);
  };

  const getTicketsByStatus = (statusId) => {
    return tickets.filter(ticket => ticket.status === statusId);
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map(column => {
        const columnTickets = getTicketsByStatus(column.id);
        const isDropZone = activeOverColumn === column.id;
        const isCurrentColumn = draggedTicket && draggedTicket.status === column.id;
        const isValidTarget = draggedTicket && isValidTransition(draggedTicket.status, column.id);

        return (
          <div 
            key={column.id} 
            className={`kanban-column ${column.color} 
              ${isDropZone ? 'drag-over' : ''} 
              ${draggedTicket && !isValidTarget && !isCurrentColumn ? 'drop-disabled' : ''} 
              ${isValidTarget ? 'drop-enabled-candidate' : ''}
            `}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <div className="title-area">
                <span className="status-dot"></span>
                <h3>{column.title}</h3>
              </div>
              <span className="column-count">{columnTickets.length}</span>
            </div>

            <div className="column-cards-wrapper">
              {columnTickets.length === 0 ? (
                <div className="empty-column-placeholder">
                  <span>No tickets here</span>
                </div>
              ) : (
                columnTickets.map(ticket => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={onTicketClick}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
