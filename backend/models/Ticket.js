const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be either: low, medium, high, or urgent'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed'],
      message: 'Status must be either: open, in_progress, resolved, or closed'
    },
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
});

// Configure Schema to include virtuals when converting to JSON or Object responses
ticketSchema.set('toJSON', { virtuals: true });
ticketSchema.set('toObject', { virtuals: true });

// Derived virtual field: ageMinutes (minutes between createdAt and now, or resolvedAt if resolved)
ticketSchema.virtual('ageMinutes').get(function () {
  const now = new Date();
  const resolvedAt = this.resolvedAt ? new Date(this.resolvedAt) : null;
  const createdAt = new Date(this.createdAt);
  
  const ageMs = (resolvedAt || now) - createdAt;
  return Math.max(0, Math.floor(ageMs / (1000 * 60)));
});

// Derived virtual field: slaBreached (true if unresolved past target, or resolved after target)
ticketSchema.virtual('slaBreached').get(function () {
  const targetMinutes = {
    urgent: 60,       // 1 hour
    high: 240,        // 4 hours
    medium: 1440,     // 24 hours
    low: 4320         // 72 hours
  }[this.priority];

  return this.ageMinutes > targetMinutes;
});

module.exports = mongoose.model('Ticket', ticketSchema);
