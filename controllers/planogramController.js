const Planogram = require('../models/Planogram');
const Machine = require('../models/Machine');
const AuditLog = require('../models/AuditLog');

// Get all planograms
const getPlanograms = async (req, res) => {
  try {
    let query = {};
    
    // Operations Manager can see planograms for their regions
    if (req.user.role === 'operations_manager' && req.user.assignedRegions.length > 0) {
      const machines = await Machine.find({ region: { $in: req.user.assignedRegions } });
      query.machineId = { $in: machines.map(m => m._id) };
    }

    const planograms = await Planogram.find(query)
      .populate('machineId')
      .populate('products.product');
    
    res.json(planograms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching planograms', error: error.message });
  }
};

// Get planogram by ID
const getPlanogramById = async (req, res) => {
  try {
    const planogram = await Planogram.findById(req.params.id)
      .populate('machineId')
      .populate('products.product');
    
    if (!planogram) {
      return res.status(404).json({ message: 'Planogram not found' });
    }
    
    res.json(planogram);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching planogram', error: error.message });
  }
};

// Create planogram
const createPlanogram = async (req, res) => {
  try {
    const { machineId, name, description, products, isActive } = req.body;

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Check if planogram already exists for this machine
    const existingPlanogram = await Planogram.findOne({ machineId });
    if (existingPlanogram) {
      return res.status(400).json({ message: 'Planogram already exists for this machine' });
    }

    const planogram = new Planogram({
      machineId,
      name,
      description,
      products,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    await planogram.save();

    // Update machine with planogram reference
    machine.currentPlanogram = planogram._id;
    await machine.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_planogram',
      resource: 'planograms',
      resourceId: planogram._id,
      newState: planogram
    });

    res.status(201).json({
      message: 'Planogram created successfully',
      planogram: await planogram.populate('machineId')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating planogram', error: error.message });
  }
};

// Update planogram
const updatePlanogram = async (req, res) => {
  try {
    const { name, description, products, isActive } = req.body;

    const planogram = await Planogram.findById(req.params.id);
    if (!planogram) {
      return res.status(404).json({ message: 'Planogram not found' });
    }

    const previousState = {
      name: planogram.name,
      description: planogram.description,
      products: planogram.products,
      isActive: planogram.isActive
    };

    // Update fields
    if (name) planogram.name = name;
    if (description) planogram.description = description;
    if (products) planogram.products = products;
    if (isActive !== undefined) planogram.isActive = isActive;
    planogram.updatedBy = req.user.id;
    planogram.updatedAt = new Date();

    await planogram.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_planogram',
      resource: 'planograms',
      resourceId: planogram._id,
      previousState,
      newState: {
        name: planogram.name,
        description: planogram.description,
        products: planogram.products,
        isActive: planogram.isActive
      }
    });

    res.json({
      message: 'Planogram updated successfully',
      planogram: await planogram.populate('machineId')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating planogram', error: error.message });
  }
};

// Assign products to planogram
const assignProductsToPlanogram = async (req, res) => {
  try {
    const { products } = req.body;

    const planogram = await Planogram.findById(req.params.id);
    if (!planogram) {
      return res.status(404).json({ message: 'Planogram not found' });
    }

    const previousProducts = [...planogram.products];
    
    planogram.products = products;
    planogram.updatedBy = req.user.id;
    planogram.updatedAt = new Date();

    await planogram.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'assign_products_planogram',
      resource: 'planograms',
      resourceId: planogram._id,
      previousState: { products: previousProducts },
      newState: { products: planogram.products }
    });

    res.json({
      message: 'Products assigned to planogram successfully',
      planogram: await planogram.populate('products.product')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning products to planogram', error: error.message });
  }
};

// Get planogram by machine
const getPlanogramByMachine = async (req, res) => {
  try {
    const planogram = await Planogram.findOne({ machineId: req.params.machineId })
      .populate('machineId')
      .populate('products.product');
    
    if (!planogram) {
      return res.status(404).json({ message: 'Planogram not found for this machine' });
    }
    
    res.json(planogram);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching planogram', error: error.message });
  }
};

module.exports = {
  getPlanograms,
  getPlanogramById,
  createPlanogram,
  updatePlanogram,
  assignProductsToPlanogram,
  getPlanogramByMachine
};