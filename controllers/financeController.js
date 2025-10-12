const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const CashReconciliation = require('../models/CashReconciliation');
const Machine = require('../models/Machine');
const AuditLog = require('../models/AuditLog');

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, machineId, type } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (machineId) {
      query.machineId = machineId;
    }
    
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('machineId')
      .populate('userId', 'name email');
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transactions', 
      error: error.message 
    });
  }
};

// Get transaction summary
const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchStage = {};
    
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' },
          cashTransactions: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, 1, 0] }
          },
          digitalTransactions: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'digital'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: summary[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        cashTransactions: 0,
        digitalTransactions: 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transaction summary', 
      error: error.message 
    });
  }
};

// Get payouts
const getPayouts = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payouts = await Payout.find(query)
      .populate('userId', 'name email')
      .populate('machineId')
      .populate('processedBy', 'name email');
    
    res.json({
      success: true,
      data: payouts,
      count: payouts.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching payouts', 
      error: error.message 
    });
  }
};

// Create payout
const createPayout = async (req, res) => {
  try {
    const { userId, machineId, amount, description, payoutMethod } = req.body;

    // Validate required fields
    if (!userId || !amount || !description || !payoutMethod) {
      return res.status(400).json({
        success: false,
        message: 'userId, amount, description, and payoutMethod are required'
      });
    }

    const payout = new Payout({
      userId,
      machineId,
      amount,
      description,
      payoutMethod,
      status: 'pending',
      processedBy: req.user.id
    });

    await payout.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_payout',
      resource: 'finance',
      resourceId: payout._id,
      newState: payout
    });

    res.status(201).json({
      success: true,
      message: 'Payout created successfully',
      data: await payout.populate(['userId', 'machineId'])
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating payout', 
      error: error.message 
    });
  }
};

// Update payout status
const updatePayoutStatus = async (req, res) => {
  try {
    const { status, transactionId, notes } = req.body;

    const payout = await Payout.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({ 
        success: false,
        message: 'Payout not found' 
      });
    }

    const previousState = {
      status: payout.status,
      transactionId: payout.transactionId,
      notes: payout.notes
    };

    // Update fields
    if (status) payout.status = status;
    if (transactionId) payout.transactionId = transactionId;
    if (notes) payout.notes = notes;

    // If payout is completed, set completion date
    if (status === 'completed' && !payout.completedAt) {
      payout.completedAt = new Date();
    }

    await payout.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_payout',
      resource: 'finance',
      resourceId: payout._id,
      previousState,
      newState: {
        status: payout.status,
        transactionId: payout.transactionId,
        notes: payout.notes
      }
    });

    res.json({
      success: true,
      message: 'Payout updated successfully',
      data: await payout.populate(['userId', 'machineId'])
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating payout', 
      error: error.message 
    });
  }
};

// Cash reconciliation
const cashReconciliation = async (req, res) => {
  try {
    const { machineId, date, expectedAmount, actualAmount, notes } = req.body;

    // Validate required fields
    if (!machineId || expectedAmount === undefined || actualAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'machineId, expectedAmount, and actualAmount are required'
      });
    }

    const reconciliation = new CashReconciliation({
      machineId,
      date: date || new Date(),
      expectedAmount,
      actualAmount,
      variance: actualAmount - expectedAmount,
      notes,
      reconciledBy: req.user.id
    });

    await reconciliation.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'cash_reconciliation',
      resource: 'finance',
      resourceId: reconciliation._id,
      newState: reconciliation
    });

    res.status(201).json({
      success: true,
      message: 'Cash reconciliation completed successfully',
      data: await reconciliation.populate('machineId')
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error during cash reconciliation', 
      error: error.message 
    });
  }
};

// Get financial reports
const getFinancialReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    
    let report;
    
    switch (reportType) {
      case 'revenue':
        report = await generateRevenueReport(startDate, endDate);
        break;
      case 'payouts':
        report = await generatePayoutsReport(startDate, endDate);
        break;
      case 'gst':
        report = await generateGSTReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid report type. Use: revenue, payouts, or gst' 
        });
    }

    res.json({
      success: true,
      data: report,
      reportType: reportType
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error generating financial report', 
      error: error.message 
    });
  }
};

// Helper functions for financial reports
const generateRevenueReport = async (startDate, endDate) => {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          machine: '$machineId'
        },
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        dailyRevenue: { $sum: '$totalRevenue' },
        machineBreakdown: {
          $push: {
            machineId: '$_id.machine',
            revenue: '$totalRevenue',
            transactions: '$transactionCount'
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const generatePayoutsReport = async (startDate, endDate) => {
  const matchStage = { status: 'completed' };
  
  if (startDate && endDate) {
    matchStage.completedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await Payout.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$payoutMethod',
        totalAmount: { $sum: '$amount' },
        payoutCount: { $sum: 1 }
      }
    }
  ]);
};

const generateGSTReport = async (startDate, endDate) => {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        gstAmount: { $sum: { $multiply: ['$amount', 0.1] } }, // Assuming 10% GST
        transactionCount: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    totalRevenue: 0,
    gstAmount: 0,
    transactionCount: 0
  };
};

module.exports = {
  getTransactions,
  getTransactionSummary,
  getPayouts,
  createPayout,
  updatePayoutStatus,
  cashReconciliation,
  getFinancialReports
};