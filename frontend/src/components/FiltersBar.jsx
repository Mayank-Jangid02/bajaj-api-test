import { Search, SlidersHorizontal, Kanban, List, Plus } from 'lucide-react';

export default function FiltersBar({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  slaFilter,
  setSlaFilter,
  statusFilter,
  setStatusFilter,
  activeView,
  setActiveView,
  onCreateClick
}) {
  return (
    <div className="filters-bar">
      <div className="search-and-dropdowns">
        {/* Search Input */}
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search email, subject, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="ticket-search"
          />
        </div>

        {/* Priority Filter */}
        <div className="select-wrapper">
          <SlidersHorizontal className="select-icon" size={14} />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
            id="priority-filter"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>
        </div>

        {/* SLA Breach Filter */}
        <div className="select-wrapper">
          <SlidersHorizontal className="select-icon" size={14} />
          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
            className="filter-select"
            id="sla-filter"
            aria-label="Filter by SLA status"
          >
            <option value="all">All SLAs</option>
            <option value="active">Active SLA</option>
            <option value="breached">Breached SLA</option>
          </select>
        </div>

        {/* Status Filter (Only in Spacious List View) */}
        {activeView === 'list' && (
          <div className="select-wrapper">
            <SlidersHorizontal className="select-icon" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              id="status-filter"
              aria-label="Filter by ticket status"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      <div className="action-and-toggles">
        {/* Kanban / List Layout Toggles */}
        <div className="view-toggle-group">
          <button
            onClick={() => setActiveView('kanban')}
            className={`toggle-btn ${activeView === 'kanban' ? 'active' : ''}`}
            title="Kanban Board View"
            aria-label="Switch to Kanban board view"
          >
            <Kanban size={16} />
            <span>Board</span>
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`toggle-btn ${activeView === 'list' ? 'active' : ''}`}
            title="List View"
            aria-label="Switch to list view"
          >
            <List size={16} />
            <span>List</span>
          </button>
        </div>

        {/* Create Ticket Button */}
        <button
          onClick={onCreateClick}
          className="create-ticket-btn"
          title="Create New Ticket"
          id="btn-create-ticket"
        >
          <Plus size={16} />
          <span>New Ticket</span>
        </button>
      </div>
    </div>
  );
}
