const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Role = require('../models/Role');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const createInvitation = async (req, res) => {
  try {
    const { email, role, department, partner, customMessage } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if pending invitation already exists
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: 'pending' 
    });
    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Pending invitation already exists for this email'
      });
    }

    // Validate role
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = new Invitation({
      email,
      role,
      department,
      partner,
      token,
      expiresAt,
      customMessage,
      invitedBy: req.user.id
    });

    await invitation.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_invitation',
      resource: 'invitations',
      resourceId: invitation._id,
      newState: invitation
    });

    // TODO: Send email with invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/invitation/accept?token=${token}`;

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      data: {
        invitation: await invitation.populate(['role', 'department', 'partner']),
        invitationLink // In production, send via email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating invitation',
      error: error.message
    });
  }
};

const getInvitations = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const invitations = await Invitation.find(query)
      .populate('role', 'name description')
      .populate('department', 'name')
      .populate('partner', 'name code')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invitations,
      count: invitations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
      error: error.message
    });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const invitation = await Invitation.findOne({ token })
      .populate('role')
      .populate('department')
      .populate('partner');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation token'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been used or expired'
      });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired'
      });
    }

    // Create user
    const user = new User({
      name,
      email: invitation.email,
      password,
      role: invitation.role.name,
      department: invitation.department?._id,
      assignedMachines: [],
      assignedRegions: []
    });

    await user.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'accept_invitation',
      resource: 'invitations',
      resourceId: invitation._id,
      newState: { userCreated: user._id }
    });

    res.json({
      success: true,
      message: 'Invitation accepted successfully. You can now login.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting invitation',
      error: error.message
    });
  }
};

const cancelInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending invitations can be cancelled'
      });
    }

    invitation.status = 'cancelled';
    await invitation.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'cancel_invitation',
      resource: 'invitations',
      resourceId: invitation._id,
      newState: invitation
    });

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling invitation',
      error: error.message
    });
  }
};

module.exports = {
  createInvitation,
  getInvitations,
  acceptInvitation,
  cancelInvitation
};