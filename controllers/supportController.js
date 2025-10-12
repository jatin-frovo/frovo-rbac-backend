const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Get all support tickets
const getSupportTickets = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Support agents can only see tickets assigned to them or unassigned tickets
    if (req.user.role === 'support_agent') {
      query.$or = [
        { assignedTo: req.user.id },
        { assignedTo: null }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('machineId');
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching support tickets', error: error.message });
  }
};

// Get support ticket by ID
const getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('machineId');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    // Support agents can only access tickets assigned to them
    if (req.user.role === 'support_agent' && 
        ticket.assignedTo && 
        ticket.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this support ticket' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching support ticket', error: error.message });
  }
};

// Create support ticket
const createSupportTicket = async (req, res) => {
  try {
    const { title, description, priority, machineId, issueType } = req.body;

    const ticket = new SupportTicket({
      title,
      description,
      priority: priority || 'medium',
      machineId,
      issueType,
      status: 'open',
      createdBy: req.user.id
    });

    await ticket.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_support_ticket',
      resource: 'support',
      resourceId: ticket._id,
      newState: ticket
    });

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: await ticket.populate('createdBy machineId')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating support ticket', error: error.message });
  }
};

// Update support ticket
const updateSupportTicket = async (req, res) => {
  try {
    const { status, assignedTo, resolution, notes } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Support agents can only update tickets assigned to them
    if (req.user.role === 'support_agent' && 
        ticket.assignedTo && 
        ticket.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this support ticket' });
    }

    const previousState = {
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      resolution: ticket.resolution
    };

    // Update fields
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (resolution) ticket.resolution = resolution;
    if (notes) ticket.notes = notes;

    // If ticket is resolved, set resolution date
    if (status === 'resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_support_ticket',
      resource: 'support',
      resourceId: ticket._id,
      previousState,
      newState: {
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        resolution: ticket.resolution
      }
    });

    res.json({
      message: 'Support ticket updated successfully',
      ticket: await ticket.populate('assignedTo', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating support ticket', error: error.message });
  }
};

// Add response to support ticket
const addTicketResponse = async (req, res) => {
  try {
    const { message, isInternal } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Support agents can only respond to tickets assigned to them
    if (req.user.role === 'support_agent' && 
        ticket.assignedTo && 
        ticket.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this support ticket' });
    }

    const response = {
      user: req.user.id,
      message,
      isInternal: isInternal || false,
      timestamp: new Date()
    };

    ticket.responses.push(response);
    await ticket.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'add_ticket_response',
      resource: 'support',
      resourceId: ticket._id,
      newState: { response }
    });

    res.json({
      message: 'Response added successfully',
      ticket: await ticket.populate('responses.user', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding response to ticket', error: error.message });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;

    const refund = new Refund({
      transactionId,
      amount,
      reason,
      status: 'pending',
      processedBy: req.user.id
    });

    await refund.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'process_refund',
      resource: 'support',
      resourceId: refund._id,
      newState: refund
    });

    res.status(201).json({
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing refund', error: error.message });
  }
};

// Get support dashboard stats
const getSupportStats = async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'in_progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });

    // Average resolution time
    const resolvedTicketsWithTime = await SupportTicket.find({
      status: 'resolved',
      resolvedAt: { $exists: true }
    });

    const avgResolutionTime = resolvedTicketsWithTime.length > 0 
      ? resolvedTicketsWithTime.reduce((sum, ticket) => {
          const resolutionTime = ticket.resolvedAt - ticket.createdAt;
          return sum + resolutionTime;
        }, 0) / resolvedTicketsWithTime.length / (1000 * 60 * 60) // in hours
      : 0;

    res.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      avgResolutionTime: avgResolutionTime.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching support stats', error: error.message });
  }
};

module.exports = {
  getSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  addTicketResponse,
  processRefund,
  getSupportStats
};