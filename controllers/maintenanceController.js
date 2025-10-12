const MaintenanceJob = require('../models/MaintenanceJob');
const Machine = require('../models/Machine');
const AuditLog = require('../models/AuditLog');

// Get all maintenance jobs
const getMaintenanceJobs = async (req, res) => {
  try {
    let query = {};
    
    // Maintenance leads can only see jobs in their assigned machines
    if (req.user.role === 'maintenance_lead' && req.user.assignedMachines.length > 0) {
      query.machineId = { $in: req.user.assignedMachines };
    }

    const maintenanceJobs = await MaintenanceJob.find(query)
      .populate('machineId')
      .populate('assignedTechnician', 'name email')
      .populate('reportedBy', 'name email');
    
    res.json(maintenanceJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance jobs', error: error.message });
  }
};

// Get maintenance job by ID
const getMaintenanceJobById = async (req, res) => {
  try {
    const maintenanceJob = await MaintenanceJob.findById(req.params.id)
      .populate('machineId')
      .populate('assignedTechnician', 'name email')
      .populate('reportedBy', 'name email');
    
    if (!maintenanceJob) {
      return res.status(404).json({ message: 'Maintenance job not found' });
    }
    
    res.json(maintenanceJob);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance job', error: error.message });
  }
};

// Create maintenance job
const createMaintenanceJob = async (req, res) => {
  try {
    const { machineId, issueType, description, priority, assignedTechnician } = req.body;

    // Check if machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const maintenanceJob = new MaintenanceJob({
      machineId,
      issueType,
      description,
      priority: priority || 'medium',
      assignedTechnician,
      status: 'open',
      reportedBy: req.user.id
    });

    await maintenanceJob.save();

    // Update machine status if critical issue
    if (priority === 'high' || issueType === 'breakdown') {
      machine.status = 'maintenance';
      await machine.save();
    }

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_maintenance_job',
      resource: 'maintenance',
      resourceId: maintenanceJob._id,
      newState: maintenanceJob
    });

    res.status(201).json({
      message: 'Maintenance job created successfully',
      maintenanceJob: await maintenanceJob.populate('machineId assignedTechnician')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating maintenance job', error: error.message });
  }
};

// Update maintenance job
const updateMaintenanceJob = async (req, res) => {
  try {
    const { status, resolution, partsUsed, timeSpent, assignedTechnician } = req.body;

    const maintenanceJob = await MaintenanceJob.findById(req.params.id);
    if (!maintenanceJob) {
      return res.status(404).json({ message: 'Maintenance job not found' });
    }

    const previousState = {
      status: maintenanceJob.status,
      resolution: maintenanceJob.resolution,
      partsUsed: maintenanceJob.partsUsed,
      assignedTechnician: maintenanceJob.assignedTechnician
    };

    // Update fields
    if (status) maintenanceJob.status = status;
    if (resolution) maintenanceJob.resolution = resolution;
    if (partsUsed) maintenanceJob.partsUsed = partsUsed;
    if (timeSpent) maintenanceJob.timeSpent = timeSpent;
    if (assignedTechnician) maintenanceJob.assignedTechnician = assignedTechnician;

    // If job is completed, set completion date and update machine status
    if (status === 'completed' && !maintenanceJob.completedAt) {
      maintenanceJob.completedAt = new Date();
      
      // Update machine status back to active
      const machine = await Machine.findById(maintenanceJob.machineId);
      if (machine && machine.status === 'maintenance') {
        machine.status = 'active';
        await machine.save();
      }
    }

    await maintenanceJob.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_maintenance_job',
      resource: 'maintenance',
      resourceId: maintenanceJob._id,
      previousState,
      newState: {
        status: maintenanceJob.status,
        resolution: maintenanceJob.resolution,
        partsUsed: maintenanceJob.partsUsed,
        assignedTechnician: maintenanceJob.assignedTechnician
      }
    });

    res.json({
      message: 'Maintenance job updated successfully',
      maintenanceJob: await maintenanceJob.populate('machineId assignedTechnician')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating maintenance job', error: error.message });
  }
};

// Assign maintenance job to technician
const assignMaintenanceJob = async (req, res) => {
  try {
    const { assignedTechnician } = req.body;

    const maintenanceJob = await MaintenanceJob.findById(req.params.id);
    if (!maintenanceJob) {
      return res.status(404).json({ message: 'Maintenance job not found' });
    }

    const previousTechnician = maintenanceJob.assignedTechnician;

    maintenanceJob.assignedTechnician = assignedTechnician;
    maintenanceJob.status = 'assigned';
    await maintenanceJob.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'assign_maintenance_job',
      resource: 'maintenance',
      resourceId: maintenanceJob._id,
      previousState: { assignedTechnician: previousTechnician },
      newState: { assignedTechnician: maintenanceJob.assignedTechnician, status: maintenanceJob.status }
    });

    res.json({
      message: 'Maintenance job assigned successfully',
      maintenanceJob: await maintenanceJob.populate('assignedTechnician', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning maintenance job', error: error.message });
  }
};

// Get preventive maintenance schedule
const getPreventiveMaintenance = async (req, res) => {
  try {
    const machines = await Machine.find({
      nextMaintenance: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Next 7 days
    });

    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preventive maintenance', error: error.message });
  }
};

// Get maintenance reports
const getMaintenanceReports = async (req, res) => {
  try {
    const { startDate, endDate, issueType } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (issueType) {
      query.issueType = issueType;
    }

    // Maintenance leads can only see reports for their assigned machines
    if (req.user.role === 'maintenance_lead' && req.user.assignedMachines.length > 0) {
      query.machineId = { $in: req.user.assignedMachines };
    }

    const reports = await MaintenanceJob.find(query)
      .populate('machineId')
      .populate('assignedTechnician', 'name email');

    // Generate summary
    const summary = {
      totalJobs: reports.length,
      openJobs: reports.filter(job => job.status === 'open').length,
      inProgressJobs: reports.filter(job => job.status === 'in_progress').length,
      completedJobs: reports.filter(job => job.status === 'completed').length,
      averageResolutionTime: calculateAverageResolutionTime(reports)
    };

    res.json({ reports, summary });
  } catch (error) {
    res.status(500).json({ message: 'Error generating maintenance reports', error: error.message });
  }
};

// Helper function to calculate average resolution time
const calculateAverageResolutionTime = (jobs) => {
  const completedJobs = jobs.filter(job => job.status === 'completed' && job.completedAt);
  if (completedJobs.length === 0) return 0;

  const totalTime = completedJobs.reduce((sum, job) => {
    const resolutionTime = job.completedAt - job.createdAt;
    return sum + resolutionTime;
  }, 0);

  return totalTime / completedJobs.length / (1000 * 60 * 60); // Return in hours
};

module.exports = {
  getMaintenanceJobs,
  getMaintenanceJobById,
  createMaintenanceJob,
  updateMaintenanceJob,
  assignMaintenanceJob,
  getPreventiveMaintenance,
  getMaintenanceReports
};