const Machine = require('../models/Machine');

const getMachines = async (req, res) => {
  try {
    let query = {};
    
    // Field agents and maintenance leads can only see assigned machines
    if (req.user.role === 'field_refill_agent' || req.user.role === 'maintenance_lead') {
      query._id = { $in: req.user.assignedMachines };
    }

    const machines = await Machine.find(query);
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machines', error: error.message });
  }
};

const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machine', error: error.message });
  }
};

const createMachine = async (req, res) => {
  try {
    const machine = new Machine(req.body);
    await machine.save();

    res.status(201).json({
      message: 'Machine created successfully',
      machine
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating machine', error: error.message });
  }
};

const updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.json({
      message: 'Machine updated successfully',
      machine
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating machine', error: error.message });
  }
};

module.exports = {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine
};