const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// @route   POST /tickets
// @desc    Create a ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    const ticket = new Ticket({
      subject,
      description,
      customerEmail,
      priority
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /tickets
// @desc    List tickets with status, priority, and breached filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });

    // Perform in-memory filter for slaBreached to perfectly match Mongoose virtual definitions
    if (breached === 'true') {
      tickets = tickets.filter(ticket => ticket.slaBreached === true);
    } else if (breached === 'false') {
      tickets = tickets.filter(ticket => ticket.slaBreached === false);
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /tickets/stats
// @desc    Get aggregate stats
router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find({});

    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    let slaBreachedOpenCount = 0;

    for (const ticket of tickets) {
      if (statusCounts[ticket.status] !== undefined) {
        statusCounts[ticket.status]++;
      }
      if (priorityCounts[ticket.priority] !== undefined) {
        priorityCounts[ticket.priority]++;
      }
      
      // "currently open" means status is 'open' or 'in_progress', and SLA is breached
      if (ticket.slaBreached && (ticket.status === 'open' || ticket.status === 'in_progress')) {
        slaBreachedOpenCount++;
      }
    }

    res.json({
      statusCounts,
      priorityCounts,
      slaBreachedOpenCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PATCH /tickets/:id
// @desc    Update a ticket (used to change status with boundary validation)
router.patch('/:id', async (req, res) => {
  try {
    const { subject, description, priority, status } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Enforce transition rules if status is changing
    if (status && status !== ticket.status) {
      const STATUS_RANKS = {
        open: 0,
        in_progress: 1,
        resolved: 2,
        closed: 3
      };

      if (STATUS_RANKS[status] === undefined) {
        return res.status(400).json({ 
          error: `Invalid status: '${status}'. Must be one of: open, in_progress, resolved, closed.` 
        });
      }

      const currentRank = STATUS_RANKS[ticket.status];
      const newRank = STATUS_RANKS[status];
      const rankDiff = newRank - currentRank;

      // Status transition allowed: 1 step forward or 1 step backward only
      if (Math.abs(rankDiff) !== 1) {
        return res.status(400).json({
          error: `Invalid status transition from '${ticket.status}' to '${status}'. You can only move forward or backward by one step.`
        });
      }

      const oldStatus = ticket.status;
      ticket.status = status;

      // Automatically manage resolvedAt timestamp
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (oldStatus === 'resolved' && status !== 'resolved') {
        ticket.resolvedAt = null;
      }
    }

    // Update other details if provided
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    
    if (priority !== undefined) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ 
          error: `Invalid priority: '${priority}'. Must be one of: low, medium, high, urgent.` 
        });
      }
      ticket.priority = priority;
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /tickets/:id
// @desc    Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const result = await Ticket.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
