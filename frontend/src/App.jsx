import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MetricsPanel from './components/MetricsPanel';
import FiltersBar from './components/FiltersBar';
import KanbanBoard from './components/KanbanBoard';
import TicketList from './components/TicketList';
import TicketDetailDrawer from './components/TicketDetailDrawer';
import CreateTicketModal from './components/CreateTicketModal';
import api from './utils/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  const [activeView, setActiveView] = useState('kanban');
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Global Toast State
  const [toasts, setToasts] = useState([]);

  // Tickets & Metrics state
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    slaBreachedOpenCount: 0
  });

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Drawer state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Display Toast Notification Helper
  const showToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Apply Theme class/attribute to Document Element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync with OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Memoized load data method
  const loadData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);
      const filters = {};
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (slaFilter !== 'all') {
        filters.breached = slaFilter === 'breached' ? 'true' : 'false';
      }

      const [ticketsResponse, statsResponse] = await Promise.all([
        api.fetchTickets(filters),
        api.fetchStats()
      ]);

      setTickets(ticketsResponse);
      setStats(statsResponse);
      setIsBackendOnline(true);
    } catch (error) {
      console.error('Error fetching DeskFlow data:', error);
      setIsBackendOnline(false);
      showToast('Error syncing with DeskFlow database. Check backend server connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [priorityFilter, slaFilter]);

  // Initial load and setup periodic auto-refresh polling (every 30 seconds)
  useEffect(() => {
    // Run initial load asynchronously to comply with strict cascading-render guidelines
    const initLoad = async () => {
      await loadData(true);
    };
    initLoad();

    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const renderKanbanSkeleton = () => {
    const COLUMNS = [
      { id: 'open', title: 'Open', color: 'status-open' },
      { id: 'in_progress', title: 'In Progress', color: 'status-progress' },
      { id: 'resolved', title: 'Resolved', color: 'status-resolved' },
      { id: 'closed', title: 'Closed', color: 'status-closed' }
    ];
    return (
      <div className="kanban-board">
        {COLUMNS.map(column => (
          <div key={column.id} className={`kanban-column ${column.color}`}>
            <div className="column-header">
              <div className="title-area">
                <span className="status-dot"></span>
                <h3>{column.title}</h3>
              </div>
              <span className="column-count">...</span>
            </div>
            <div className="column-cards-wrapper">
              <div className="skeleton-card"></div>
              <div className="skeleton-card" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListSkeleton = () => {
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
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td colSpan={6} style={{ padding: 0 }}>
                  <div className="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Client-side text filter on the retrieved tickets list for maximum responsiveness
  const getFilteredTickets = () => {
    let result = tickets;

    // Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.subject.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.customerEmail.toLowerCase().includes(query)
      );
    }

    // Status Filter (Only applied in list view mode)
    if (activeView === 'list' && statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    return result;
  };

  // Status boundary change handler (Handles drag/drop & timeline buttons)
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const updatedTicket = await api.updateTicket(ticketId, { status: newStatus });
      
      // Update local tickets list
      setTickets(prev => prev.map(t => t._id === ticketId ? updatedTicket : t));
      
      // Sync selected ticket drawer details if open
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(updatedTicket);
      }

      // Reload stats and tickets in background to keep virtual slaBreached perfectly in sync
      loadData();
      showToast(`Ticket successfully moved to ${newStatus.replace('_', ' ')}`, 'success');
    } catch (error) {
      showToast(`Transition failed: ${error.message}`, 'error');
    }
  };

  // General details update handler (Subject, Description, Priority)
  const handleTicketUpdate = async (ticketId, updateData) => {
    try {
      const updatedTicket = await api.updateTicket(ticketId, updateData);
      setTickets(prev => prev.map(t => t._id === ticketId ? updatedTicket : t));
      
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(updatedTicket);
      }

      loadData();
      showToast('Changes saved successfully!', 'success');
    } catch (error) {
      showToast(`Update failed: ${error.message}`, 'error');
      throw error;
    }
  };

  // Ticket creation handler
  const handleTicketCreate = async (ticketData) => {
    try {
      const newTicket = await api.createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      loadData();
      showToast('Ticket filed successfully!', 'success');
    } catch (error) {
      showToast(`Failed to file ticket: ${error.message}`, 'error');
      throw error;
    }
  };

  // Ticket deletion handler
  const handleTicketDelete = async (ticketId) => {
    try {
      await api.deleteTicket(ticketId);
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      setSelectedTicket(null);
      loadData();
      showToast('Support ticket permanently purged.', 'success');
    } catch (error) {
      showToast(`Failed to delete ticket: ${error.message}`, 'error');
    }
  };

  const filteredTickets = getFilteredTickets();

  return (
    <>
      {/* Toast Notifications Overlay Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-notification ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} className="status-icon" style={{ color: '#10b981' }} />
            ) : (
              <AlertCircle size={16} className="status-icon" style={{ color: '#ef4444' }} />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Brand Header & Theme Controls */}
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isBackendOnline={isBackendOnline} 
      />

      {/* KPI Stats Panel */}
      <MetricsPanel stats={stats} />

      {/* Advanced Filters, Views switcher and Creation trigger */}
      <FiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        slaFilter={slaFilter}
        setSlaFilter={setSlaFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        activeView={activeView}
        setActiveView={setActiveView}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* Main Board vs List Workspace */}
      <main className="workspace-container">
        {isLoading ? (
          activeView === 'kanban' ? renderKanbanSkeleton() : renderListSkeleton()
        ) : activeView === 'kanban' ? (
          <KanbanBoard
            tickets={filteredTickets}
            onTicketClick={setSelectedTicket}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TicketList
            tickets={filteredTickets}
            onTicketClick={setSelectedTicket}
          />
        )}
      </main>

      {/* Slide-over Ticket Details & Transition progression drawer */}
      {selectedTicket && (
        <TicketDetailDrawer
          key={selectedTicket._id}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
          onDelete={handleTicketDelete}
        />
      )}

      {/* Centered Ticket Creation Dialog */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleTicketCreate}
      />
    </>
  );
}
