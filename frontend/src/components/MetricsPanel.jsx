import { 
  Ticket, 
  Flame, 
  CircleDot, 
  PlayCircle, 
  CheckCircle2, 
  FolderClosed 
} from 'lucide-react';

export default function MetricsPanel({ stats }) {
  const { statusCounts = {}, slaBreachedOpenCount = 0 } = stats || {};
  
  const totalTickets = 
    (statusCounts.open || 0) + 
    (statusCounts.in_progress || 0) + 
    (statusCounts.resolved || 0) + 
    (statusCounts.closed || 0);

  return (
    <section className="metrics-panel">
      {/* SLA Breached - Elevated Card */}
      <div className={`metric-card sla-breached-card ${slaBreachedOpenCount > 0 ? 'critical' : 'stable'}`}>
        <div className="metric-icon-wrapper">
          <Flame className="metric-icon pulse" />
        </div>
        <div className="metric-info">
          <h3>SLA Breached</h3>
          <p className="metric-value">{slaBreachedOpenCount}</p>
          <span className="metric-sub">Open Overdue Tickets</span>
        </div>
        {slaBreachedOpenCount > 0 && <span className="pulsar-dot"></span>}
      </div>

      {/* Total Tickets */}
      <div className="metric-card total-card">
        <div className="metric-icon-wrapper">
          <Ticket className="metric-icon" />
        </div>
        <div className="metric-info">
          <h3>Total Tickets</h3>
          <p className="metric-value">{totalTickets}</p>
          <span className="metric-sub">All ticket history</span>
        </div>
      </div>

      {/* Open */}
      <div className="metric-card open-card">
        <div className="metric-icon-wrapper">
          <CircleDot className="metric-icon" />
        </div>
        <div className="metric-info">
          <h3>Open</h3>
          <p className="metric-value">{statusCounts.open || 0}</p>
          <span className="metric-sub">Awaiting assignment</span>
        </div>
      </div>

      {/* In Progress */}
      <div className="metric-card progress-card">
        <div className="metric-icon-wrapper">
          <PlayCircle className="metric-icon" />
        </div>
        <div className="metric-info">
          <h3>In Progress</h3>
          <p className="metric-value">{statusCounts.in_progress || 0}</p>
          <span className="metric-sub">Actively triaged</span>
        </div>
      </div>

      {/* Resolved */}
      <div className="metric-card resolved-card">
        <div className="metric-icon-wrapper">
          <CheckCircle2 className="metric-icon" />
        </div>
        <div className="metric-info">
          <h3>Resolved</h3>
          <p className="metric-value">{statusCounts.resolved || 0}</p>
          <span className="metric-sub">Pending confirmation</span>
        </div>
      </div>

      {/* Closed */}
      <div className="metric-card closed-card">
        <div className="metric-icon-wrapper">
          <FolderClosed className="metric-icon" />
        </div>
        <div className="metric-info">
          <h3>Closed</h3>
          <p className="metric-value">{statusCounts.closed || 0}</p>
          <span className="metric-sub">Archived issues</span>
        </div>
      </div>
    </section>
  );
}
