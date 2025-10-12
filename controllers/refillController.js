const RefillJob = require('../models/RefillJob');
const Machine = require('../models/Machine');
const AuditLog = require('../models/AuditLog');

// Get all refill jobs
const getRefillJobs = async (req, res) => {
  try {
    let query = {};
    
    // Field agents can only see their assigned jobs
    if (req.user.role === 'field_refill_agent') {
      query.assignedAgent = req.user.id;
    }
    
    // Operations Manager can see jobs in their regions
    if (req.user.role === 'operations_manager' && req.user.assignedRegions.length > 0) {
      const machines = await Machine.find({ region: { $in: req.user.assignedRegions } });
      query.machineId = { $in: machines.map(m => m._id) };
    }

    const refillJobs = await RefillJob.find(query)
      .populate('machineId')
      .populate('assignedAgent', 'name email')
      .populate('products.product');
    
    res.json(refillJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching refill jobs', error: error.message });
  }
};

// Get refill job by ID
const getRefillJobById = async (req, res) => {
  try {
    const refillJob = await RefillJob.findById(req.params.id)
      .populate('machineId')
      .populate('assignedAgent', 'name email')
      .populate('products.product');
    
    if (!refillJob) {
      return res.status(404).json({ message: 'Refill job not found' });
    }
    
    // Field agents can only access their assigned jobs
    if (req.user.role === 'field_refill_agent' && refillJob.assignedAgent._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this refill job' });
    }
    
    res.json(refillJob);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching refill job', error: error.message });
  }
};

// Create refill job
const createRefillJob = async (req, res) => {
  try {
    const { machineId, assignedAgent, products, priority, scheduledDate } = req.body;

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const refillJob = new RefillJob({
      machineId,
      assignedAgent,
      products,
      priority: priority || 'medium',
      scheduledDate: scheduledDate || new Date(),
      status: 'pending',
      createdBy: req.user.id
    });

    await refillJob.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_refill_job',
      resource: 'refills',
      resourceId: refillJob._id,
      newState: refillJob
    });

    res.status(201).json({
      message: 'Refill job created successfully',
      refillJob: await refillJob.populate('machineId assignedAgent')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating refill job', error: error.message });
  }
};

// Update refill job status (Field Agent)
const updateRefillJobStatus = async (req, res) => {
  try {
    const { status, completedProducts, notes, cashCollected } = req.body;

    const refillJob = await RefillJob.findById(req.params.id);
    if (!refillJob) {
      return res.status(404).json({ message: 'Refill job not found' });
    }

    // Field agents can only update their assigned jobs
    if (req.user.role === 'field_refill_agent' && refillJob.assignedAgent.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this refill job' });
    }

    const previousState = {
      status: refillJob.status,
      completedProducts: refillJob.completedProducts,
      notes: refillJob.notes,
      cashCollected: refillJob.cashCollected
    };

    // Update fields
    if (status) refillJob.status = status;
    if (completedProducts) refillJob.completedProducts = completedProducts;
    if (notes) refillJob.notes = notes;
    if (cashCollected !== undefined) refillJob.cashCollected = cashCollected;

    // If job is completed, set completion date
    if (status === 'completed' && !refillJob.completedAt) {
      refillJob.completedAt = new Date();
    }

    await refillJob.save();

    // Update machine stock if job is completed
    if (status === 'completed' && completedProducts) {
      await updateMachineStock(refillJob.machineId, completedProducts);
    }

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_refill_job',
      resource: 'refills',
      resourceId: refillJob._id,
      previousState,
      newState: {
        status: refillJob.status,
        completedProducts: refillJob.completedProducts,
        notes: refillJob.notes,
        cashCollected: refillJob.cashCollected
      }
    });

    res.json({
      message: 'Refill job updated successfully',
      refillJob: await refillJob.populate('machineId assignedAgent')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating refill job', error: error.message });
  }
};

// Helper function to update machine stock
const updateMachineStock = async (machineId, completedProducts) => {
  const machine = await Machine.findById(machineId);
  if (!machine) return;

  completedProducts.forEach(completedProduct => {
    const existingStock = machine.currentStock.find(
      stock => stock.product.toString() === completedProduct.productId
    );

    if (existingStock) {
      existingStock.quantity = completedProduct.newQuantity;
    } else {
      machine.currentStock.push({
        product: completedProduct.productId,
        quantity: completedProduct.newQuantity,
        capacity: completedProduct.capacity
      });
    }
  });

  machine.lastRefill = new Date();
  await machine.save();
};

// Assign refill job to agent
const assignRefillJob = async (req, res) => {
  try {
    const { assignedAgent } = req.body;

    const refillJob = await RefillJob.findById(req.params.id);
    if (!refillJob) {
      return res.status(404).json({ message: 'Refill job not found' });
    }

    const previousAgent = refillJob.assignedAgent;

    refillJob.assignedAgent = assignedAgent;
    refillJob.status = 'assigned';
    await refillJob.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'assign_refill_job',
      resource: 'refills',
      resourceId: refillJob._id,
      previousState: { assignedAgent: previousAgent },
      newState: { assignedAgent: refillJob.assignedAgent, status: refillJob.status }
    });

    res.json({
      message: 'Refill job assigned successfully',
      refillJob: await refillJob.populate('assignedAgent', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning refill job', error: error.message });
  }
};

// Get refill jobs by agent
const getRefillJobsByAgent = async (req, res) => {
  try {
    const agentId = req.params.agentId || req.user.id;
    
    const refillJobs = await RefillJob.find({ assignedAgent: agentId })
      .populate('machineId')
      .populate('products.product');
    
    res.json(refillJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching refill jobs', error: error.message });
  }
};

module.exports = {
  getRefillJobs,
  getRefillJobById,
  createRefillJob,
  updateRefillJobStatus,
  assignRefillJob,
  getRefillJobsByAgent
};