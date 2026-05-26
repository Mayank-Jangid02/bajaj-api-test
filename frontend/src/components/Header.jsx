import { Sun, Moon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function Header({ theme, toggleTheme, isBackendOnline }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Sparkles className="logo-glow-icon" />
          <span>DeskFlow</span>
        </div>
        <div className="brand-badge">Triage Board</div>
      </div>

      <div className="header-controls">
        {/* Backend Status Indicator */}
        <div className={`status-pill ${isBackendOnline ? 'online' : 'offline'}`}>
          {isBackendOnline ? (
            <>
              <CheckCircle2 className="status-icon" size={16} />
              <span>API Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="status-icon pulse-animation" size={16} />
              <span>Connecting API...</span>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label="Toggle visual theme"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <div className={`toggle-track ${theme}`}>
            <div className="toggle-thumb">
              {theme === 'light' ? (
                <Sun className="thumb-icon sun" size={12} />
              ) : (
                <Moon className="thumb-icon moon" size={12} />
              )}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
