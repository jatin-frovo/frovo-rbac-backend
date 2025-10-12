const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;
    
    let query = {};
    
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const auditLogs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      auditLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

const getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('userId', 'name email role');
    
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    
    res.json(auditLog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit log', error: error.message });
  }
};

const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const auditLogs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });

    // Convert to CSV format (simplified)
    const csvData = auditLogs.map(log => ({
      timestamp: log.timestamp,
      user: log.userId?.name || 'N/A',
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress
    }));

    res.json(csvData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting audit logs', error: error.message });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs
};