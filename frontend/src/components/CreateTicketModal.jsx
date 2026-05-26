import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export default function CreateTicketModal({ isOpen, onClose, onCreate }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [priority, setPriority] = useState('medium');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-specific validation states
  const [emailError, setEmailError] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [descError, setDescError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');
    setSubjectError('');
    setDescError('');

    let hasError = false;

    // Field-level validation checks
    if (!customerEmail.trim()) {
      setEmailError('Customer email is required.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(customerEmail)) {
      setEmailError('Please enter a valid customer email address.');
      hasError = true;
    }

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
      setIsSubmitting(true);
      await onCreate({
        subject: subject.trim(),
        description: description.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        priority
      });
      
      // Reset form states
      setSubject('');
      setDescription('');
      setCustomerEmail('');
      setPriority('medium');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to file the ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <h3>File New Support Ticket</h3>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close form">
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="create-ticket-form" noValidate>
          {errorMsg && (
            <div className="form-error-banner">
              <AlertCircle size={16} className="error-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email Address</label>
            <input
              type="email"
              id="customerEmail"
              placeholder="e.g. customer@domain.com"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              className={emailError ? 'input-error' : ''}
              disabled={isSubmitting}
              required
            />
            {emailError && (
              <span className="inline-error-text">
                <AlertCircle size={12} />
                <span>{emailError}</span>
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject / Issue Summary</label>
            <input
              type="text"
              id="subject"
              placeholder="e.g. Database connection timeouts in Production"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (subjectError) setSubjectError('');
              }}
              className={subjectError ? 'input-error' : ''}
              disabled={isSubmitting}
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
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              placeholder="Provide a step-by-step description of the support inquiry, error messages, and context..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descError) setDescError('');
              }}
              className={descError ? 'input-error' : ''}
              rows={4}
              disabled={isSubmitting}
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
            <label htmlFor="priority">Issue Priority & SLA Grade</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="low">Low (72h Triage SLA)</option>
              <option value="medium">Medium (24h Triage SLA)</option>
              <option value="high">High (4h Urgent SLA)</option>
              <option value="urgent">Urgent (1h Critical SLA)</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>File Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
