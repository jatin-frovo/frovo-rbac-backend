const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const createAccessRequest = async (req, res) => {
  try {
    const { role, permissions, reason, duration } = req.body;

    // Validate request
    if (!role && (!permissions || permissions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Either role or specific permissions are required'
      });
    }

    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
    }

    const accessRequest = new AccessRequest({
      userId: req.user.id,
      role,
      permissions,
      reason,
      duration,
      status: 'pending'
    });

    await accessRequest.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_access_request',
      resource: 'access_requests',
      resourceId: accessRequest._id,
      newState: accessRequest
    });

    res.status(201).json({
      success: true,
      message: 'Access request submitted successfully',
      data: await accessRequest.populate('role')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating access request',
      error: error.message
    });
  }
};

const getAccessRequests = async (req, res) => {
  try {
    const { status, userId } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by user (for non-admin users, only show their own requests)
    if (userId) {
      query.userId = userId;
    } else if (req.user.role !== 'super_admin') {
      query.userId = req.user.id;
    }

    const accessRequests = await AccessRequest.find(query)
      .populate('userId', 'name email role')
      .populate('role', 'name description')
      .populate('approver', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: accessRequests,
      count: accessRequests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching access requests',
      error: error.message
    });
  }
};

const approveAccessRequest = async (req, res) => {
  try {
    const { comments } = req.body;

    const accessRequest = await AccessRequest.findById(req.params.id)
      .populate('userId')
      .populate('role');

    if (!accessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    if (accessRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Access request is not pending'
      });
    }

    // Update user role if role-based request
    if (accessRequest.role) {
      const user = await User.findById(accessRequest.userId._id);
      user.role = accessRequest.role.name;
      await user.save();
    }

    // Update request status
    accessRequest.status = 'approved';
    accessRequest.approvedBy = req.user.id;
    accessRequest.approvedAt = new Date();
    accessRequest.comments = comments;

    await accessRequest.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'approve_access_request',
      resource: 'access_requests',
      resourceId: accessRequest._id,
      newState: accessRequest
    });

    res.json({
      success: true,
      message: 'Access request approved successfully',
      data: accessRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving access request',
      error: error.message
    });
  }
};

const rejectAccessRequest = async (req, res) => {
  try {
    const { comments } = req.body;

    const accessRequest = await AccessRequest.findById(req.params.id);
    if (!accessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    if (accessRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Access request is not pending'
      });
    }

    accessRequest.status = 'rejected';
    accessRequest.approvedBy = req.user.id;
    accessRequest.rejectedAt = new Date();
    accessRequest.comments = comments;

    await accessRequest.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'reject_access_request',
      resource: 'access_requests',
      resourceId: accessRequest._id,
      newState: accessRequest
    });

    res.json({
      success: true,
      message: 'Access request rejected',
      data: accessRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting access request',
      error: error.message
    });
  }
};

const getAccessRequestStats = async (req, res) => {
  try {
    const stats = await AccessRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await AccessRequest.countDocuments();
    const pending = await AccessRequest.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        total,
        pending,
        breakdown: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching access request stats',
      error: error.message
    });
  }
};

module.exports = {
  createAccessRequest,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  getAccessRequestStats
};