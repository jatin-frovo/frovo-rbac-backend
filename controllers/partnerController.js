const Partner = require('../models/Partner');
const Machine = require('../models/Machine');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const createPartner = async (req, res) => {
  try {
    const { name, code, description, contact, settings } = req.body;

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ 
      $or: [{ name }, { code }] 
    });
    
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this name or code already exists'
      });
    }

    const partner = new Partner({
      name,
      code: code.toUpperCase(),
      description,
      contact,
      settings,
      createdBy: req.user.id
    });

    await partner.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_partner',
      resource: 'partners',
      resourceId: partner._id,
      newState: partner
    });

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: partner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating partner',
      error: error.message
    });
  }
};

const getPartners = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const partners = await Partner.find(query)
      .populate('machines', 'name location status')
      .populate('users', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: partners,
      count: partners.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partners',
      error: error.message
    });
  }
};

const assignMachineToPartner = async (req, res) => {
  try {
    const { machineId } = req.body;

    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Check if machine already assigned to this partner
    if (partner.machines.includes(machineId)) {
      return res.status(400).json({
        success: false,
        message: 'Machine already assigned to this partner'
      });
    }

    partner.machines.push(machineId);
    await partner.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'assign_machine_partner',
      resource: 'partners',
      resourceId: partner._id,
      newState: { assignedMachine: machineId }
    });

    res.json({
      success: true,
      message: 'Machine assigned to partner successfully',
      data: await partner.populate('machines')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning machine to partner',
      error: error.message
    });
  }
};

const getPartnerMachines = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .populate('machines');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: partner.machines,
      count: partner.machines.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching partner machines',
      error: error.message
    });
  }
};

module.exports = {
  createPartner,
  getPartners,
  assignMachineToPartner,
  getPartnerMachines
};